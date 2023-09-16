//********************* API ESP32 CONNECTION *********************//
const express = require('express')
const router = express.Router()

const { dbConnect } = require("./config/connection");
const db = dbConnect();

// esp32 first connect query id
router.post("/handshake", function (req, res) {
    try {
        const sh256_key = req.body.sh256_key;
        db.execute(`UPDATE machinelist SET Status='ONLINE'  
                      WHERE sh256_key = ? LIMIT 1`,
            [sh256_key],
            function (err, results) {
                if (err) {
                    console.error(err);
                    res.status(500).json(err);
                }
                else if (results.affectedRows > 0) {
                    res.status(200).json(results);
                } else {
                    res.status(404).json("Machine not found!");
                }
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

const eventTimestamp = (table) => `INSERT IGNORE INTO ${table} (timestamp)
    SELECT TIMESTAMP(CONCAT(CURDATE(), ' 00:00:00')) + INTERVAL (t4*10000 + t3*1000 + t2*100 + t1*10 + t0) MINUTE
    FROM (SELECT 0 t0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
        SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t0,
        (SELECT 0 t1 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
        SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t1,
        (SELECT 0 t2 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
        SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t2,
        (SELECT 0 t3 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
        SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t3,
        (SELECT 0 t4 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
        SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t4
    WHERE TIMESTAMP(CONCAT(CURDATE(), ' 00:00:00')) + INTERVAL (t4*10000 + t3*1000 + t2*100 + t1*10 + t0) 
        MINUTE < TIMESTAMP(CONCAT(CURDATE() + INTERVAL 1 DAY, ' 00:00:00'));`;

// esp32 recive
router.post("/device", function (req, res) {
    try {
        const data = req.body;
        db.query(
            "SELECT * FROM `machinelist` WHERE `machineID` = ? AND `sh256_key` = ? LIMIT 1",
            [data.machineID, data.sh256_key],
            function (err, list) {
                if (err) {
                    console.error(err);
                    res.status(500).json(err);
                }
                else if (list.length > 0) {
                    const table = `machineid_${data.machineID}`;
                    const eventTimes = eventTimestamp(table);
                    db.execute(eventTimes, function (errEventTimes, results) {
                        if (errEventTimes) {
                            console.error(errEventTimes);
                            res.status(500).json(errEventTimes);
                        } else {
                            const col = ["machineID", "qty", "nc1", "nc2", "nc3", "nc4", "nc5", "nc6"];
                            const columns = col.filter(colName => colName in data);
                            const values = columns.map(colName => typeof data[colName] === "string" ? `${colName}='${data[colName]}'` : `${colName}='${data[colName]}'`);
                            const sqlInsert = `UPDATE ${table}
                                            SET Status='${list[0].Status}', ${values.join(", ")}
                                            WHERE timestamp=DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:00')`;

                            const sqlUpdate = `UPDATE machinelist
                                  SET Status = 'ONLINE'
                                  WHERE machineID = ${data.machineID} AND Status = 'OFFLINE'
                                  LIMIT 1`;
                            
                            console.log("IsqlInsert:", sqlInsert);
                            db.execute(sqlInsert, function (errInsert, insertResults) {
                                if (errInsert) {
                                    res.status(500).json(errInsert);
                                } else {
                                    res.status(200).json(insertResults);
                                    db.execute(sqlUpdate, function (errUpdate, updateResults) {
                                        if (errUpdate) {
                                            res.status(500).json(errUpdate);
                                        } else {
                                            console.log("Update results:", updateResults);
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    res.status(404).json("Machine not found!")
                }
            }
        );
    } catch (err) {
        console.error("Error: ", err);
        res.status(500).json(err);
    }
});

module.exports = router;
