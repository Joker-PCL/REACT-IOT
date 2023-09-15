//********************* API OEE CONNECTION *********************//
const express = require('express')
const router = express.Router()

const { dbConnect } = require("./config/connection");
const db = dbConnect();

function fetchDataOEE(mcList) {
    const now = new Date();
    const localTime = now.getTime()
    const startOfToday = new Date(localTime);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(localTime);
    endOfToday.setHours(23, 59, 59, 999);

    let sql_totalQty, sql_totalNC;
    if (mcList.RejectType == "NC") {
        sql_totalQty = `SUM(qty) - SUM(nc1)`;
        sql_totalNC = `SUM(nc1)`;
    } else {
        sql_totalQty = `SUM(qty) - (SUM(qty) - (SUM(nc1)))`;
        sql_totalNC = `SUM(qty) - SUM(nc1)`;
    }

    return new Promise((resolve, reject) => {
        db.query(
            `SELECT DATE_FORMAT(CURRENT_DATE(), '%d/%m/%Y') AS date,
              TIME_FORMAT(MIN(timestamp), '%H:%i') AS sTime,
              TIME_FORMAT(MAX(timestamp), '%H:%i') AS eTime,
  
              CONCAT(
                LPAD(TIMESTAMPDIFF(HOUR, MIN(timestamp), MAX(timestamp)), 2, '0'),
                ':',
                LPAD(TIMESTAMPDIFF(MINUTE, MIN(timestamp), MAX(timestamp)) % 60, 2, '0')
              ) AS periodTime,
  
              FORMAT(SUM(qty), 0) AS total,
              FORMAT(${sql_totalQty}, 0) AS totalQty,
              FORMAT(${sql_totalNC}, 0) AS totalNC,
              ROUND(SUM(qty) / TIMESTAMPDIFF(MINUTE, MIN(timestamp), MAX(timestamp)), 2) AS average,
  
              CONCAT(ROUND(
                TIMESTAMPDIFF(MINUTE, MIN(timestamp), MAX(timestamp)) / (8*60) *100, 2), '%') 
                AS availability,
  
              CONCAT(ROUND(
                (SUM(qty) / TIMESTAMPDIFF(MINUTE, MIN(timestamp), MAX(timestamp))) / ${mcList.speedDF} * 100, 2), '%') 
                AS performance,
  
              CONCAT(ROUND((${sql_totalQty}) / SUM(qty) * 100, 2), '%') AS qtyPCT,
              
              CONCAT(ROUND(
                (TIMESTAMPDIFF(MINUTE, MIN(timestamp), MAX(timestamp)) / (8*60)
              *
              (SUM(qty) / TIMESTAMPDIFF(MINUTE, MIN(timestamp), MAX(timestamp))) / ${mcList.speedDF}
              *
              (SUM(qty) / SUM(qty))) * 100, 2), '%') AS OEE
  
              FROM machineid_${mcList.machineID} 
              WHERE timestamp BETWEEN ? AND ? 
              ORDER by timestamp DESC`,
            [startOfToday, endOfToday],
            function (err, lists) {
                if (err) {
                    console.error("Error fetching data:", err);
                    reject(err);
                } else {
                    const result = { ...mcList, ...lists[0] };
                    resolve(result);
                }
            })
    })
}

router.get("/", function (req, res) {
    db.query(
        "SELECT machineID, machineName, speedDF, RejectType, workTimeDF FROM machinelist ORDER BY machineID ASC",
        function (err, mcLists) {
            if (err) {
                console.error("Error fetching data:", err);
                return res.status(500).json({ error: "Error fetching data" });
            } else {
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
