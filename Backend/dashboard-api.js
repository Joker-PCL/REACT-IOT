//********************* API DASHBOARD CONNECTION *********************//
const express = require('express')
const router = express.Router()

const { dbConnect } = require("./config/connection");
const db = dbConnect();

function fetchDataProduction(mcList) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT Lot, product, multiplier,
                              batchSize, start_production, end_production,
                              note
                        FROM productionlist
                        WHERE machineID = ${mcList.machineID}
                        ORDER BY id DESC
                        LIMIT 1`,
            function (err, production) {
                if (err) {
                    console.error("Error fetching data:", err);
                    reject(err);
                } else {
                    const result = { ...mcList, ...production[0] };
                    resolve(result);
                }
            }
        );
    });
}

// ดึงข้อมูลจากรายการผลิต
function fetchData(productList) {
    const now = new Date();
    const localTime = now.getTime()
    const startOfToday = new Date(localTime);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(localTime);
    endOfToday.setHours(23, 59, 59, 999);

    const sDate = productList.start_production ? productList.start_production : startOfToday;
    const eDate = productList.end_production ? productList.end_production : endOfToday;

    // คำนวณเวลาที่คาดว่าจะเสร็จ
    const time_completed = (batchSize, qty, avgQty) => {
        const minutes_completed = (batchSize - qty) / avgQty;
        const days = Math.floor(minutes_completed / (60 * 24)).toString().padStart(2, '0');
        const hours = Math.floor((minutes_completed % (60 * 24)) / 60).toString().padStart(2, '0');
        const remainingMinutes = Math.floor(minutes_completed % 60).toString().padStart(2, '0');

        const formattedTime = `${days} วัน ${hours} ชั่วโมง ${remainingMinutes} นาที`;
        return formattedTime;
    }

    return new Promise((resolve, reject) => {
        const RejectType = productList.RejectType;
        const multiplier = productList.multiplier ? productList.multiplier : 1;
        let sql_qty;

        const sql_nc = `SUM(${Array.from({ length: multiplier }, (_, i) => `nc${i + 1}`).join(' + ')})`;

        if (RejectType == "NC") {
            sql_qty = `SUM(qty)*${multiplier} - (${sql_nc})`;
        } else {
            sql_qty = `SUM(qty)*${multiplier} - (SUM(qty)*${multiplier} - (${sql_nc}))`;
        }

        db.query(`SELECT ${sql_qty} as totalQty,
                              (${sql_qty}) / SUM(CASE WHEN qty > 0 THEN 1 ELSE 0 END) as avgQty,
                              MAX(timestamp) as latest_information,
                              CONCAT(
                                LPAD(TIMESTAMPDIFF(HOUR, MIN(timestamp), MAX(timestamp)), 2, '0'), ' ชั่วโมง ',
                                LPAD(TIMESTAMPDIFF(MINUTE, MIN(timestamp), MAX(timestamp)) % 60, 2, '0'), ' นาที'
                              ) AS period_time
                        FROM machineid_${productList.machineID}
                        WHERE NOW() BETWEEN ? AND ?
                        AND timestamp BETWEEN  ? AND ?;`,
            [sDate, eDate, sDate, eDate],
            function (err, summary) {
                if (err) {
                    console.error("Error fetching data:", err);
                    reject(err);
                } else {
                    if (summary[0].latest_information) {
                        productList.time_completed = time_completed(productList.batchSize, summary[0].totalQty, summary[0].avgQty);
                        const result = { ...productList, ...summary[0] };
                        resolve(result);
                    } else {
                        if (RejectType == "NC") {
                            sql_qty = `SUM(qty) - SUM(nc1)`;
                        } else {
                            sql_qty = `SUM(qty) - (SUM(qty)-SUM(nc1))`;
                        }

                        db.query(`SELECT ${sql_qty} as totalQty,
                              MAX(timestamp) as latest_information,
                              (${sql_qty}) / SUM(CASE WHEN qty > 0 THEN 1 ELSE 0 END) as avgQty,
                              CONCAT(
                                LPAD(TIMESTAMPDIFF(HOUR, MIN(timestamp), MAX(timestamp)), 2, '0'), ' ชั่วโมง ',
                                LPAD(TIMESTAMPDIFF(MINUTE, MIN(timestamp), MAX(timestamp)) % 60, 2, '0'), ' นาที'
                              ) AS period_time
                        FROM machineid_${productList.machineID}
                        WHERE timestamp BETWEEN ? AND ?`,
                            [eDate, now],
                            function (err, summary) {
                                if (err) {
                                    console.error("Error fetching data:", err);
                                    reject(err);
                                } else {
                                    productList.Lot = null;
                                    productList.product = null;
                                    productList.multiplier = 1;
                                    productList.batchSize = null;
                                    productList.start_production = null;
                                    productList.end_production = null;
                                    productList.note = null;
                                    productList.time_completed = null;

                                    const result = { ...productList, ...summary[0] };
                                    resolve(result);
                                }
                            });
                    }
                }
            }
        );
    });
}

// query dashboard machine
router.get("/", function (req, res) {
    try {
        const now = new Date();
        const localTime = now.getTime();
        const startOfToday = new Date(localTime);
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(localTime);
        endOfToday.setHours(23, 59, 59, 999);

        // ดึงข้อมูลรายการเครื่องจักร
        db.query("SELECT * FROM machinelist ORDER BY machineID",
            function (err, mcLists) {
                if (err) {
                    console.error("Error fetching data:", err);
                    return res.status(500).json({ error: "Error fetching data" });
                } else {
                    if (mcLists) {
                        const resultPromises = mcLists.map(mcList => fetchDataProduction(mcList));

                        Promise.all(resultPromises).then(productLists => {
                            const resultPromises = productLists.map(productList => fetchData(productList));
                            Promise.all(resultPromises).then(productLists => {
                                res.status(200).json(productLists);
                            }).catch(error => {
                                console.error("Error:", error);
                                res.status(500).json({ error: "Error fetching data" });
                            });

                        }).catch(error => {
                            console.error("Error:", error);
                            res.status(500).json({ error: "Error fetching data" });
                        });

                    } else {
                        return res.status(404).json({ error: "No data found" });
                    }
                }
            }
        );
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Error fetching data" });
    }
});

// query detail machine *่json body
router.post("/detail", function (req, res) {
    const now = new Date();
    const localTime = now.getTime()
    const startOfToday = new Date(localTime);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(localTime);
    endOfToday.setHours(23, 59, 59, 999);

    const id = req.body.machineID;
    const sDate = req.body.sDate ? req.body.sDate : startOfToday;
    const eDate = req.body.eDate ? req.body.sDate : endOfToday;

    db.query(
        "SELECT * FROM machineid_" + id + " WHERE timestamp BETWEEN ? AND ?",
        [sDate, eDate],
        function (err, results) {
            if (err) {
                console.error("Error fetching data:", err);
                return res.status(500).json({ error: "Error fetching data" });
            } else {
                res.json(results);
            }
        }
    );
});

// query machine lists
router.get("/dataListsMC", function (req, res) {
    db.query(`SELECT MClist.*, WS.*
            FROM machinelist AS MClist
            JOIN workshift AS WS
                ON MClist.machineID = WS.machineID
            ORDER BY MClist.machineID ASC`,
        function (err, mcLists) {
            if (err) {
                console.error("Error fetching data:", err);
                return res.status(500).json({ error: "Error fetching data" });
            } else {
                res.status(200).json(mcLists);
            }
        }
    );
});

// query machine lists
router.post("/machineDetail", function (req, res) {
    db.query(`SELECT PD.*, MC.*
                      FROM productionlist as PD
                      JOIN machinelist as MC ON PD.machineID = MC.machineID
                      WHERE MC.machineID = ?
                      ORDER BY PD.id DESC`,
        [req.body.machineID],
        function (err, lists) {
            console.log(lists);
            if (err) {
                console.error("Error fetching data:", err);
                return res.status(500).json({ error: "Error fetching data" });
            } else {
                res.status(200).json(lists);
            }
        }
    );
});

module.exports = router;
