//********************* API CRUD PRODUCTION *********************//
const express = require('express');
const router = express.Router();
const { convertToDateTimeLocal } = require("./config/convertDateTime");

const { dbConnect } = require("./config/connection");
const db = dbConnect();

// query machine lists
router.get("/", function (req, res) {
    db.query(`SELECT PD.*, MC.machineID, MC.machineName
            FROM productionlist AS PD
            JOIN machinelist AS MC ON PD.machineID = MC.machineID
            ORDER BY PD.productID DESC`,
        function (err, productLists) {
            if (err) {
                console.error("Error fetching data:", err);
                return res.status(500).json({ error: "Error fetching data" });
            } else {
                console.log(productLists);
                res.status(200).json(productLists);
            }
        }
    );
});

//  query machine lists
router.get("/machineLists", function (req, res) {
    db.query(`SELECT machineID, machineName
            FROM machinelist 
            ORDER BY machineID DESC`,
        function (err, machineLists) {
            if (err) {
                console.error("Error fetching data:", err);
                return res.status(500).json({ error: "Error fetching data" });
            } else {
                console.log(machineLists);
                res.status(200).json(machineLists);
            }
        }
    );
});

// create production list
router.post("/create", function (req, res) {
    const data = req.body;
    const col = ["machineID", "Lot", "product", "multiplier", "setSpeed", "batchSize", "start_production", "end_production", "note"];
    const columns = col.filter(colName => colName in data);
    const values = columns.map(colName => typeof data[colName] === "string" ? `'${data[colName]}'` : data[colName]);
    const sqlInsert = `INSERT INTO productionlist (${columns.map(colName => `\`${colName}\``).join(", ")}) 
                            VALUES (${values.join(", ")})`;
    console.log(sqlInsert);
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
        "DELETE FROM `productionlist` WHERE productID=?",
        [req.body.productID],
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
                        WHERE productID = ?;`,
        [
            req.body.Lot,
            req.body.product,
            req.body.multiplier,
            req.body.batchSize,
            convertToDateTimeLocal(req.body.start_production),
            convertToDateTimeLocal(req.body.end_production),
            req.body.note,
            req.body.productID
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
