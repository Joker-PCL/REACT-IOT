//********************* API CRUD MACHINE *********************//
const express = require('express');
const router = express.Router();
const crypto = require('crypto');


const { dbConnect } = require("./config/connection");
const db = dbConnect();

// create machine list
router.post("/create", function (req, res) {
    if(req.body.machineID.length !== 6) {
        return res.status(404).json("กรอกไอดีเครื่องจักร 6 หลัก!")
    }
    
    db.query(`SELECT * FROM machinelist WHERE machineID = ? LIMIT 1`,
        [req.body.machineID],
        function (err, results) {
            if (err) {
                res.json(err)
            }
            else if (results.length == 0) {   // Create machine list
                const data = req.body;
                const hash_text = `polipharm${data.machineID}`;
                const sh256_key = crypto.createHash('sha256').update(hash_text).digest('hex');
                const col = ["machineID", "machineName", "workTimeDF", "speedDF", "unit", "Alert", "AlertTime", "LineToken"];
                const columns = col.filter(colName => colName in data);
                const values = columns.map(colName => typeof data[colName] === "string" ? `'${data[colName]}'` : data[colName]);
                const sqlInsert = `INSERT INTO machinelist (${columns.map(colName => `\`${colName}\``).join(", ")}, sh256_key) 
                            VALUES (${values.join(", ")}, '${sh256_key}')`;

                // Create table
                db.execute(sqlInsert, function (err, results) {
                    if (err) {
                        res.json(err);
                    } else if (results) {
                        const tableMC = `machineid_${req.body.machineID}`
                        db.execute(`CREATE TABLE ${tableMC} (
                  timestamp TIMESTAMP NOT NULL,
                  machineID INT(10) NOT NULL,
                  Status VARCHAR(10) NOT NULL,
                  qty INT(10) NOT NULL DEFAULT '0',
                  nc1 INT(5) NOT NULL DEFAULT '0',
                  nc2 INT(5) NOT NULL DEFAULT '0',
                  nc3 INT(5) NOT NULL DEFAULT '0',
                  nc4 INT(5) NOT NULL DEFAULT '0',
                  nc5 INT(5) NOT NULL DEFAULT '0',
                  nc6 INT(5) NOT NULL DEFAULT '0',
                  UNIQUE KEY unique_timestamp (timestamp)
                  ) ENGINE=InnoDB CHARSET=utf8 COLLATE utf8_general_ci COMMENT = 'ตารางเก็บข้อมูล'`,
                            function (err, results) {
                                if (err) {
                                    db.execute("DELETE FROM machinelist WHERE machineID=?", [req.body.machineID]);
                                    res.status(500).json(err);
                                } else {
                                    res.status(200).json(results);
                                }
                            }
                        );
                    } else {
                        res.status(400).json("Failed create machine!");
                    }
                }
                );
            } else {
                return res.status(404).json("ไอดีเครื่องจักรนี้มีอยู่แล้ว!")
            }
        }
    );
});

// delete
router.delete("/delete", function (req, res) {
    db.query(
        "DELETE FROM `machinelist` WHERE machineID=?",
        [req.body.machineID],
        function (err, results) {
            if (err) {
                console.error("Error fetching data:", err);
                return res.status(500).json({ error: "Error fetching data" });
            } else {
                db.query("DROP TABLE machineid_" + req.body.machineID,
                    function (err, results) {
                        if (err) {
                            console.error("Error fetching data:", err);
                            return res.status(500).json({ error: "Error fetching data" });
                        } else {
                            res.status(200).json(results);
                        }
                    })
            }
        }
    );
});

// update
router.put("/update", function (req, res) {
    db.execute(`UPDATE machinelist 
                        SET machineName =?,
                            speedDF = ?,
                            unit = ?,
                            RejectType =?,
                            Alert =?,
                            AlertTime =?,
                            LineToken =?,
                            Alert =?                       
                        WHERE machineID = ?;`,
        [
            req.body.machineName,
            req.body.speedDF,
            req.body.unit,
            req.body.RejectType,
            req.body.Alert,
            req.body.AlertTime,
            req.body.LineToken,
            req.body.Alert,
            req.body.machineID
        ],
        function (err, results) {
            if (err) {
                console.error("Error fetching data:", err);
                return res.status(500).json({ error: "Error fetching data" });
            } else {
                res.status(200).json(results);
            }
        })
});

module.exports = router;
