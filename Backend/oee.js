//********************* API OEE CONNECTION *********************//
const express = require('express')
const router = express.Router()
const { mergeDateAndTimeLocal } = require('./config/convertDateTime');

const { dbConnect } = require("./config/connection");
const db = dbConnect();

// ค้นหาข้อมูลการผลิต
function fetchDataOEE(mcList) {
    const multiplier = mcList.multiplier;
    const create_sql_nc = Array.from({ length: multiplier }, (_, i) => `nc${i + 1}`); // สร้างแม่แบบ col_nc*multiplier
    const sql_nc = create_sql_nc.join("+");

    // create the sql of the sensor type
    let sql_sumQTY, sql_sumNC;
    if (mcList.RejectType == "NC") {
        sql_sumQTY = `(qty * ${multiplier}) - (${sql_nc})`;
        sql_sumNC = `(${sql_nc})`;
    } else {
        sql_sumQTY = `(qty * ${multiplier}) - ((qty * ${multiplier}) - (${sql_nc}))`;
        sql_sumNC = `(qty * ${multiplier}) - (${sql_nc})`;
    }

    const createSql = (alias, sWork, eWork) => {
        if (!sWork || !eWork) return `NULL AS ${alias}`;

        var mergeTime, sTime, eTime;
        const sDate = mcList.start_work;
        const eDate = mcList.end_work;

        if (sWork && eWork) {
            sTime = new Date()
            sTime.setHours(Number(sWork.split(':')[0]))
            sTime.setMinutes(Number(sWork.split(':')[1]));

            eTime = new Date()
            eTime.setHours(Number(eWork.split(':')[0]))
            eTime.setMinutes(Number(eWork.split(':')[1]));
        }

        // ตรวจสอบเวลาหากเกินเที่ยงคืนให้บวกเพิ่ม 1 วัน
        if (sTime > eTime) {
            mergeTime = `(TIME(timestamp) BETWEEN TIME('${sWork}') AND TIME('24:00:00') 
                        OR TIME(timestamp) BETWEEN TIME('00:00:00') AND TIME('${eWork}'))
                        AND timestamp BETWEEN '${mergeDateAndTimeLocal(sDate, sWork)}'
                        AND '${mergeDateAndTimeLocal(eDate, eWork, 1)}'`

        } else {
            mergeTime = `(TIME(timestamp) BETWEEN TIME('${sWork}') AND TIME('${eWork}')) 
                ${alias == "night_ot" ?
                    `AND timestamp BETWEEN '${mergeDateAndTimeLocal(sDate, sWork, 1)}'
                                            AND '${mergeDateAndTimeLocal(eDate, eWork, 1)}'`
                    :
                    `AND timestamp BETWEEN '${mergeDateAndTimeLocal(sDate, sWork)}'
                                            AND '${mergeDateAndTimeLocal(eDate, eWork)}'`
                }`
        }

        return `SUM(CASE WHEN ${mergeTime}
                    THEN qty * ${multiplier} ELSE 0 END) AS total_${alias},
                SUM(CASE WHEN ${mergeTime}
                    THEN ${sql_sumQTY} ELSE 0 END) AS qty_${alias},
                SUM(CASE WHEN ${mergeTime}
                    THEN ${sql_sumNC} ELSE 0 END) AS nc_${alias},
                SUM(CASE WHEN ${mergeTime}
                    THEN qty  * ${multiplier} ELSE 0 END) 
                    /
                COUNT(CASE WHEN ${mergeTime} 
                    AND Status IS NOT NULL
                        THEN 1 ELSE NULL END) 
                AS avg_${alias},
                
                COUNT(CASE WHEN ${mergeTime} 
                AND Status IS NOT NULL
                    THEN 1 ELSE NULL END) AS online_${alias},
                COUNT(CASE WHEN ${mergeTime} 
                AND Status IS NULL
                    THEN 1 ELSE NULL END) AS offline_${alias},
                COUNT(CASE WHEN ${mergeTime} 
                AND Status='START'
                    THEN 1 ELSE NULL END) AS start_${alias},
                COUNT(CASE WHEN ${mergeTime} 
                AND Status!='START' AND Status IS NOT NULL
                    THEN 1 ELSE NULL END) AS stop_${alias}`;
    }

    return new Promise((resolve, reject) => {
        const table = `machineid_${mcList.machineID}`;
        const sDate = mcList.start_work;
        const eDate = mcList.end_work;

        const sql = `SELECT
                        ${createSql("day_1", mcList.sw_day_1, mcList.ew_day_1)},
                        ${createSql("day_2", mcList.sw_day_2, mcList.ew_day_2)},
                        ${createSql("day_ot", mcList.sw_day_ot, mcList.ew_day_ot)},
                        ${createSql("night_1", mcList.sw_night_1, mcList.ew_night_1)},
                        ${createSql("night_2", mcList.sw_night_2, mcList.ew_night_2)},
                        ${createSql("night_ot", mcList.sw_night_ot, mcList.ew_night_ot)}
                    FROM ${table}`

        db.query(sql, (err, lists) => {
            if (err) {
                console.error("Error fetching data:", err);
                reject(err);
            } else {
                const result = { ...mcList, workshift: lists[0] };
                resolve(result);
            }
        })
    })
}

// ดึงข้อมูลรายการผลิตตามวันที่
router.get("/", function (req, res) {
    db.query(`SELECT MC.machineID, MC.machineName, MC.unit, PD.*, WS.*, 
                DATEDIFF(NOW(), WS.start_work) + 1 AS work_days, DS.*, NS.*
            FROM machinelist AS MC
            LEFT JOIN productionlist AS PD ON MC.machineID = PD.machineID
            LEFT JOIN workshift AS WS ON MC.machineID = WS.machineID
            LEFT JOIN dayshift AS DS ON WS.wsID = DS.wsID
            LEFT JOIN nightshift AS NS ON WS.wsID = NS.wsID
            WHERE DATE(NOW()) BETWEEN WS.start_work AND WS.end_work
            ORDER BY MC.machineID ASC`,
        function (err, mcLists) {
            if (err) {
                console.error("Error fetching data:", err);
                return res.status(500).send("Error fetching data");
            } else {
                // ค้นหาข้อมูลการผลิต
                const resultPromises = mcLists.map(mcList => fetchDataOEE(mcList));

                Promise.all(resultPromises).then(result => {
                    res.status(200).json(result);
                }).catch(error => {
                    console.error("Error:", error);
                    res.status(500).json({ error: "Error fetching data" });
                });
            }
        }
    );
});

module.exports = router;
