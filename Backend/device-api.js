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
                    const col = ["machineID", "qty", "nc1", "nc2", "nc3", "nc4", "nc5", "nc6"];
                    const columns = col.filter(colName => colName in data);
                    const values = columns.map(colName => typeof data[colName] === "string" ? `'${data[colName]}'` : data[colName]);
                    const sqlInsert = `INSERT INTO ${table}(timestamp, Status, ${columns.map(colName => `\`${colName}\``).join(", ")}) 
                              VALUES (DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:00'), '${list[0].Status}', ${values.join(", ")})`;

                    const sqlUpdate = `UPDATE machinelist
                              SET Status = 'ONLINE'
                              WHERE machineID = ${data.machineID} AND Status = 'OFFLINE'
                              LIMIT 1`;

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
