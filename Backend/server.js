const express = require("express");
const cors = require("cors");
const crypto = require('crypto');

const mysql = require("mysql2");

const { sendLineNotify, convertToDateTimeLocal } = require("./sendLineNotify")

const db = mysql.createConnection({
  host: "192.168.10.7",
  // host: "127.0.0.1",
  user: "engineer",
  password: "engineer",
  database: "nodejs_iot"
});

const app = express();
app.use(cors());
app.use(express.json());

//********************* API ESP32 CONNECTION *********************//
// esp32 first connect query id
app.post("/api/handshake", function (req, res) {
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
app.post("/api/device", function (req, res) {
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


//********************* API DASHBOARD CONNECTION *********************//
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
app.get("/api/dashboard", function (req, res) {
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
app.post("/api/detail", function (req, res) {
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
app.get("/api/dataListsMC", function (req, res) {
  db.query(
    "SELECT * FROM machinelist ORDER BY machineID ASC",
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
app.post("/api/machineDetail", function (req, res) {
  db.query(`SELECT PD.*, MC.*
                    FROM productionlist as PD
                    JOIN machinelist as MC ON PD.machineID = MC.machineID
                    WHERE MC.machineID = ?
                    ORDER BY PD.id DESC`,
    [req.body.machineID],
    function (err, lists) {
      if (err) {
        console.error("Error fetching data:", err);
        return res.status(500).json({ error: "Error fetching data" });
      } else {
        if (lists.length > 0) {
          res.status(200).json(lists);
        } else {
          return res.status(404).json({ error: "No data found" });
        }
      }
    }
  );
});

//********************* API OEE CONNECTION *********************//
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

app.get("/api/oee", function (req, res) {
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

//********************* API CRUD MACHINE *********************//
// create machine list
app.post("/api/createMC", function (req, res) {
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
        res.status(404).json("Invalid machineID or machineName!")
      }
    }
  );
});

// delete
app.delete("/api/deleteMC", function (req, res) {
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
app.put("/api/updateMC", function (req, res) {
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

//********************* API CRUD MACHINE *********************//
// create production list
app.post("/api/createPD", function (req, res) {
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
app.delete("/api/deletePD", function (req, res) {
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
app.put("/api/updatePD", function (req, res) {
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

// query machine lists
app.get("/api/productLists", function (req, res) {
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


//********************* INTERVAL FUNCTION CHECK DATA *********************//
// ตรวจสอบข้อมูลทุกๆ 1 นาที
function checkDeviceStatus() {
  try {
    db.query("SELECT * FROM machinelist", (err, lists) => {
      if (err) {
        console.error("Error fetching data:", err);
      } else {
        lists.forEach(list => {
          const table = `machineid_${list.machineID}`;
          db.query(`SELECT SUM(qty) AS sum_qty, 
                                MAX(timestamp) AS latest_timestamp,
                                TIMESTAMPDIFF(MINUTE, MAX(timestamp), NOW()) AS timeDifference,
                                CASE WHEN MIN(qty) > 0 THEN 1 ELSE 0 END AS machine_running
                          FROM ${table} 
                          WHERE timestamp 
                          BETWEEN 
                            (SELECT DATE_SUB(MAX(timestamp), INTERVAL ${list.AlertTime} MINUTE) FROM ${table}) 
                          AND 
                            (SELECT MAX(timestamp) FROM ${table})`,
            (err, results) => {
              if (err) {
                console.error('เกิดข้อผิดพลาดในการค้นหาข้อมูล:', err);
              }
              else if (results.length > 0 && list.Alert === "ON") {
                const resData = results[0];
                const status = list.Status;

                // ตรวจสอบการเชื่อมต่อของอุปกรณ์ ONLINE
                if (status === "ONLINE" && list.OnlinetAL === "OFF") {
                  console.log("Machine online...")
                  db.execute(`UPDATE machinelist
                                    SET OnlinetAL = 'ON',
                                        StartAL = 'OFF',
                                        StopAL = 'ON',
                                        DisAL = 'OFF'
                                    WHERE machineID=?
                                    LIMIT 1;`,
                    [list.machineID], (err, results) => {
                      if (err) {
                        console.log(err);
                      } else {
                        sendLineNotify(list.LineToken, `เครื่อง ${list.machineName} ออนไลน์`);
                      }
                    }
                  )
                }   // ตรวจสอบการเชื่อมต่อของอุปกรณ์ START
                else if (Number(resData.machine_running) > 0 && list.StartAL === "OFF") {
                  console.log("Machine is running...")
                  db.execute(`UPDATE machinelist
                                    SET Status = 'START',
                                        OnlinetAL = 'ON',
                                        StartAL = 'ON',
                                        StopAL = 'OFF',
                                        DisAL = 'OFF'
                                    WHERE machineID=?
                                    LIMIT 1;`,
                    [list.machineID], (err, results) => {
                      if (err) {
                        console.log(err);
                      } else {
                        sendLineNotify(list.LineToken, `เครื่อง ${list.machineName} เครื่องจักรเริ่มทำงาน`);
                      }
                    }
                  )
                }  // ตรวจสอบการเชื่อมต่อของอุปกรณ์ OFFLINE (ขาดการเชื่อมต่อเกิน 15 นาที)
                else if (resData.timeDifference >= Number(list.AlertTime) && list.DisAL === "OFF") {
                  console.log(`ข้อมูลล่าสุดเกิน ${list.AlertTime} นาที:`, resData);
                  db.execute(`UPDATE machinelist
                                    SET Status = 'OFFLINE',
                                        OnlinetAL = 'OFF',
                                        StartAL = 'ON',
                                        StopAL = 'ON',
                                        DisAL = 'ON'
                                    WHERE machineID=?
                                    LIMIT 1;`,
                    [list.machineID], (err, results) => {
                      if (err) {
                        console.log(err);
                      } else {
                        sendLineNotify(list.LineToken, `เครื่อง ${list.machineName} ขาดการเชื่อมต่อ`);
                      }
                    }
                  )
                }  // ตรวจสอบการส่งข้อมูล (ไม่มีข้อมูลส่งมาใน 5 นาที) เครื่องจักหยุดการทำงาน
                else if (resData.sum_qty == 0 && list.StopAL === "OFF") {
                  console.log("Machine is stopped working...");
                  db.execute(`UPDATE machinelist
                                    SET Status = 'STOP',
                                        OnlinetAL = 'ON',
                                        StartAL = 'OFF',
                                        StopAL = 'ON',
                                        DisAL = 'OFF'
                                    WHERE machineID=?
                                    LIMIT 1;`,
                    [list.machineID], (err, results) => {
                      if (err) {
                        console.log(err);
                      } else {
                        sendLineNotify(list.LineToken, `เครื่อง ${list.machineName} เครื่องจักรหยุดการทำงาน`);
                      }
                    }
                  )
                }
                else {
                  console.log(`ข้อมูลล่าสุด:`, resData);
                }
              } else {
                console.log('ไม่พบข้อมูล หรือ ไม่ได้เปิดการแจ้งเตือน');
              }
            });
        });
      }
    });
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json(err);
  }
}

checkDeviceStatus();
setInterval(checkDeviceStatus, 60000); // ตรวจสอบทุก 1 นาที (60000 มิลลิวินาที)


app.listen(3000, function () {
  console.log("CORS-enabled web server listening on port 3000");
});
