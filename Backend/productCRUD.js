//********************* API CRUD PRODUCTION *********************//
const express = require('express');
const router = express.Router();
const { convertToDateTimeLocal } = require("./config/convertDateTime");

const { dbConnect } = require("./config/connection");
const db = dbConnect();

// query machine lists
router.get("/", function (req, res) {
    db.query(`SELECT productionlist.*, machinelist.machineID, machinelist.machineName
                      FROM productionlist
                      JOIN machinelist ON productionlist.machineID = machinelist.machineID
                      ORDER BY productionlist.id DESC`,
        function (err, productLists) {
            if (err) {
                console.error("Error fetching data:", err);
                return res.status(500).json({ error: "Error fetching data" });
            } else {
                res.status(200).json(productLists);
            }
        }
    );
});

// create production list
router.post("/create", function (req, res) {
    const data = req.body;
    const col = ["machineID", "Lot", "product", "multiplier", "batchSize", "start_production", "end_production", "note"];
    const columns = col.filter(colName => colName in data);
    const values = columns.map(colName => typeof data[colName] === "string" ? `'${data[colName]}'` : data[colName]);
    const sqlInsert = `INSERT INTO productionlist (${columns.map(colName => `\`${colName}\``).join(", ")}) 
                            VALUES (${values.join(", ")})`;

    db.execute(sqlInsert, function (err, results) {
        if (err) {
            res.status(500).json(err);
        } else if (results) {
            res.status(200).json(results);
        } else {
            res.status(400).json("Failed create production!");
        }
    }
    );
});

// delete
router.delete("/delete", function (req, res) {
    db.query(
        "DELETE FROM `productionlist` WHERE id=?",
        [req.body.id],
        function (err, results) {
            if (err) {
                console.error("Error fetching data:", err);
                return res.status(500).json({ error: "Error fetching data" });
            } else {
                res.status(200).json(results);
            }
        }
    );
});

// update
router.put("/update", function (req, res) {
    db.execute(`UPDATE productionlist 
                        SET Lot = ?,
                            product = ?,
                            multiplier = ?,
                            batchSize = ?,  
                            start_production = ?,
                            end_production = ?,
                            note = ?               
                        WHERE id = ?;`,
        [
            req.body.Lot,
            req.body.product,
            req.body.multiplier,
            req.body.batchSize,
            convertToDateTimeLocal(req.body.start_production),
            convertToDateTimeLocal(req.body.end_production),
            req.body.note,
            req.body.id
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
