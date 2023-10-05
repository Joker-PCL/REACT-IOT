//********************* API CRUD MACHINE *********************//
const express = require('express');
const router = express.Router();

const { dbConnect } = require("./config/connection");
const db = dbConnect();

const { convertToDateLocal } = require("./config/convertDateTime")

router.get('/:lot', function (req, res) {
    try {
        const lot = req.params.lot;
        db.query(`SELECT workshift.*, dayshift.*, nightshift.* 
                FROM workshift
                LEFT JOIN dayshift ON workshift.wsID = dayshift.wsID
                LEFT JOIN nightshift ON workshift.wsID = nightshift.wsID
                WHERE workshift.Lot = ${lot};`,
            function (err, result) {
                if (err) throw err;
                res.status(200).json(result);
            });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// create machine list
router.post("/create", function (req, res) {
    const data = req.body;
    const work_shift = ["machineID", "Lot", "product", "start_work", "end_work", "tw_day_shift", "total_night_shift", "total_work_time"];
    const work_shift_cols = work_shift.filter(colName => colName in data);
    const work_shift_vals = work_shift_cols.map(colName => `'${data[colName]}'`);
    const work_shift_sql = `INSERT INTO workshift (${work_shift_cols.join(', ')}) 
                        VALUES (${work_shift_vals.join(', ')});`

    const day_shift = ["sw_day_1", "ew_day_1", "tw_day_1", "sw_day_2", "ew_day_2", "tw_day_2", "sw_day_ot", "ew_day_ot", "tw_day_ot"];
    const day_shift_cols = day_shift.filter(colName => colName in data);
    const day_shift_vals = day_shift_cols.map(colName => `'${data[colName]}'`);
    const day_shift_sql = `INSERT INTO dayshift (${["wsID", ...day_shift_cols].join(', ')}) 
                        VALUES ( ${["?", ...day_shift_vals].join(', ')});`

    const night_shift = ["sw_night_1", "ew_night_1", "total_night_1", "sw_night_2", "ew_night_2", "total_night_2", "sw_night_ot", "ew_night_ot", "total_night_ot"];
    const night_shift_cols = night_shift.filter(colName => colName in data);
    const night_shift_vals = night_shift_cols.map(colName => `'${data[colName]}'`);
    const night_shift_sql = `INSERT INTO nightshift (${["wsID", ...night_shift_cols].join(', ')}) 
                        VALUES (${["?", ...night_shift_vals].join(', ')});`

    try {
        db.beginTransaction()
        db.query(work_shift_sql, function (err, result) {
            if (err) throw err;
            const insertID = result.insertId;
            try {
                db.query(day_shift_sql, [insertID]);
                db.query(night_shift_sql, [insertID]);
            } catch (err) {
                db.rollback();
                res.status(400).send(err);
            };
        })
        db.commit();
        res.status(200).send('success');
    }
    catch (error) {
        db.rollback()
        res.status(400).send(error);
    }
});

// delete
router.delete("/delete", function (req, res) {
    console.log(req.body.wsID)
    db.execute(`DELETE workshift, dayshift, nightshift
                FROM workshift
                LEFT JOIN dayshift ON workshift.wsID = dayshift.wsID
                LEFT JOIN nightshift ON workshift.wsID = nightshift.wsID
                WHERE workshift.wsID = ?;`,
        [req.body.wsID],
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
    db.execute(`UPDATE workshift AS WS
                JOIN dayshift AS DS ON WS.wsID = DS.wsID
                JOIN nightshift AS NS ON WS.wsID = NS.wsID
                SET WS.start_work = ?,
                    WS.end_work = ?,
                    WS.tw_day_shift = ?,
                    WS.tw_night_shift = ?,
                    WS.total_work_time = ?,
                    DS.sw_day_1 = ?,
                    DS.ew_day_1 = ?,
                    DS.tw_day_1 = ?,
                    DS.sw_day_2 = ?,
                    DS.ew_day_2 = ?,
                    DS.tw_day_2 = ?,
                    DS.sw_day_ot = ?,
                    DS.ew_day_ot = ?,
                    DS.tw_day_ot = ?,
                    NS.sw_night_1 = ?,
                    NS.ew_night_1 = ?,
                    NS.tw_night_1 = ?,
                    NS.sw_night_2 = ?,
                    NS.ew_night_2 = ?,
                    NS.tw_night_2 = ?,
                    NS.sw_night_ot = ?,
                    NS.ew_night_ot = ?,
                    NS.tw_night_ot = ?               
                WHERE WS.wsID = ?;`,
        [
            convertToDateLocal(req.body.start_work),
            convertToDateLocal(req.body.end_work),
            req.body.tw_day_shift || null,
            req.body.tw_night_shift || null,
            req.body.total_work_time || null,
            req.body.sw_day_1 || null,
            req.body.ew_day_1 || null,
            req.body.tw_day_1 || null,
            req.body.sw_day_2 || null,
            req.body.ew_day_2 || null,
            req.body.tw_day_2 || null,
            req.body.sw_day_ot || null,
            req.body.ew_day_ot || null,
            req.body.tw_day_ot || null,
            req.body.sw_night_1 || null,
            req.body.ew_night_1 || null,
            req.body.tw_night_1 || null,
            req.body.sw_night_2 || null,
            req.body.ew_night_2 || null,
            req.body.tw_night_2 || null,
            req.body.sw_night_ot || null,
            req.body.ew_night_ot || null,
            req.body.tw_night_ot || null,
            req.body.wsID,
        ],
        function (err, results) {
            if (err) {
                console.error("Error Update data:", err);
                return res.status(500).json({ error: "Error Update data" });
            } else {
                res.status(200).json(results);
            }
        })
});

module.exports = router;
