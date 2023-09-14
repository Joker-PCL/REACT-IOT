const express = require("express");
const cors = require("cors");
const crypto = require('crypto');

const mysql = require("mysql2");

const { sendLineNotify } = require("./sendLineNotify")

const connection = mysql.createConnection({
  host: "192.168.10.7",
  // host: "127.0.0.1",
  user: "engineer",
  password: "engineer",
  database: "nodejs_iot"
});

var app = express();
app.use(cors());
app.use(express.json());

app.get("/", function (req, res, next) {
  res.json({ msg: "Hello word!" })
});

//********************* API ESP32 CONNECTION *********************//
// esp32 first connect query id
app.post("/api/handshake", function (req, res, next) {
  try {
    const sh256_key = req.body.sh256_key;
    console.log(sh256_key)
    connection.execute(`UPDATE machinelist SET Status='ONLINE'  
                    WHERE sh256_key = ? LIMIT 1`,
      [sh256_key],
      function (err, results) {
        console.log(results)
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
app.post("/api/device", function (req, res, next) {
  try {
    const data = req.body;
    connection.query(
      "SELECT * FROM `machinelist` WHERE `machineID` = ? AND `sh256_key` = ?",
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
          const sqlInsert = `INSERT INTO ${table}(timestamp, ${columns.map(colName => `\`${colName}\``).join(", ")}) 
                            VALUES (NOW(), ${values.join(", ")})`;

          const sqlUpdate = `UPDATE machinelist
                            SET Status = 'ONLINE'
                            WHERE machineID = ${data.machineID} LIMIT 1`;

          connection.execute(sqlInsert, function (errInsert, insertResults) {
            if (errInsert) {
              res.status(500).json(errInsert);
            } else {
              console.log("Insert results:", insertResults);
              connection.execute(sqlUpdate, function (errUpdate, updateResults) {
                if (errUpdate) {
                  res.status(500).json(errUpdate);
                } else {
                  console.log("Update results:", updateResults);
                  res.status(200).json({ insertResults, updateResults });
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
function fetchData(dataList, startOfToday, endOfToday) {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT SUM(qty)-(SUM(nc1)+SUM(nc2)+SUM(nc3)) as totalQty, MAX(timestamp) as latestDate, MIN(timestamp) as previousDate" +
      " FROM machineid_" + dataList.machineID + " WHERE timestamp BETWEEN ? AND ?",
      [startOfToday, endOfToday],
      function (err, summary) {
        if (err) {
          console.error("Error fetching data:", err);
          reject(err);
        } else {
          const result = { ...dataList, ...summary[0] };
          resolve(result);
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

    connection.query(
      "SELECT id, machineID, machineName, product, lot, batchSize, unit FROM machinelist",
      function (err, dataLists) {
        if (err) {
          console.error("Error fetching data:", err);
          return res.status(500).json({ error: "Error fetching data" });
        } else {
          const resultPromises = dataLists.map(dataList => fetchData(dataList, startOfToday, endOfToday));

          Promise.all(resultPromises)
            .then(results => {
              console.log(results); // แสดงผลลัพธ์ที่ได้
              res.json(results);    // ส่งผลลัพธ์กลับไปให้ client
            })
            .catch(error => {
              console.error("Error:", error);
              res.status(500).json({ error: "Error fetching data" });
            });
        }
      }
    );
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});

// query machine lists
app.get("/api/dataListsMC", function (req, res) {
  connection.query(
    "SELECT id, machineID, machineName, product, lot, batchSize, unit FROM machinelist",
    function (err, results) {
      if (err) {
        console.error("Error fetching data:", err);
        return res.status(500).json({ error: "Error fetching data" });
      } else {
        console.log(results);
        res.json(results);
      }
    }
  );
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

  connection.query(
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

// create machine list
app.post("/api/createMC", function (req, res, next) {
  connection.query(
    "SELECT * FROM `machinelist` WHERE `machineID` = ? OR `machineName` = ? LIMIT 1",
    [req.body.machineID, req.body.machineName],
    function (err, results) {
      if (err) {
        res.json(err)
      }
      else if (results.length == 0) {   // Create machine list
        const hash_text = `polipharm${req.body.machineID}`;
        const sh256_key = crypto.createHash('sha256').update(hash_text).digest('hex');
        console.log(sh256_key)
        connection.execute(`INSERT INTO machinelist 
                            (machineID, machineName, Alert, AlertTime, LineToken, sh256_key) 
                            VALUES (?, ?, ?, ?, ?, ?)`,
          [
            req.body.machineID,
            req.body.machineName,
            req.body.Alert,
            req.body.AlertTime,
            req.body.LineToken,
            sh256_key
          ],

          // Create table
          function (err, results) {
            if (err) {
              res.json(err);
            } else if (results) {
              const tableMC = `machineid_${req.body.machineID}`
              connection.execute(`CREATE TABLE ${tableMC} (
                timestamp TIMESTAMP NOT NULL,
                machineID INT(10) NOT NULL,
                qty int(10) NOT NULL DEFAULT '0',
                nc1 int(5) NOT NULL DEFAULT '0',
                nc2 int(5) NOT NULL DEFAULT '0',
                nc3 int(5) NOT NULL DEFAULT '0',
                nc4 int(5) NOT NULL DEFAULT '0',
                nc5 int(5) NOT NULL DEFAULT '0',
                nc6 int(5) NOT NULL DEFAULT '0',
                UNIQUE KEY unique_timestamp (timestamp)
                ) ENGINE=InnoDB CHARSET=utf8 COLLATE utf8_general_ci COMMENT = 'ตารางเก็บข้อมูล'`,
                function (err, results) {
                  if (err) {
                    connection.execute("DELETE FROM machinelist WHERE machineID=?", [req.body.machineID]);
                    res.json(err);
                  } else {
                    res.json(results);
                  }
                }
              );
            } else {
              res.json("Failed create machine!");
            }
          }
        );
      } else {
        res.json("Invalid machineID or machineName!")
      }
    }
  );
});

// delete
app.delete("/api/deleteMC", function (req, res) {
  connection.query(
    "DELETE FROM `machinelist` WHERE id=?",
    [req.body.id],
    function (err, results) {
      if (err) {
        console.error("Error fetching data:", err);
        return res.status(500).json({ error: "Error fetching data" });
      } else {
        connection.query("DROP TABLE machineid_" + req.body.machineID,
          function (err, results) {
            if (err) {
              console.error("Error fetching data:", err);
              return res.status(500).json({ error: "Error fetching data" });
            } else {
              res.json(results);
              console.log(results);
            }
          })
      }
    }
  );
});

// update
app.put("/updateMC", function (req, res, next) {
  // res.json(req.body.fname);
  connection.query(
    "UPDATE `users` SET `fname`=?, `lname`=?, `email`=?, `avatar`=? WHERE id=?",
    [
      req.body.fname,
      req.body.lname,
      req.body.email,
      req.body.avatar,
      req.body.id,
    ],
    function (err, results) {
      res.json(results);
      console.log(results);
    }
  );
});


//********************* INTERVAL FUNCTION CHECK DATA *********************//
// ตรวจสอบข้อมูลทุกๆ 1 นาที
function checkDeviceStatus() {
  try {
    connection.query("SELECT * FROM machinelist", (err, lists) => {
      if (err) {
        console.error("Error fetching data:", err);
      } else {
        lists.forEach(list => {
          const table = `machineid_${list.machineID}`;
          connection.query(`SELECT SUM(qty) AS sum_qty, 
                                MAX(timestamp) AS latest_timestamp,
                                CASE WHEN MIN(qty) > 0 THEN 1 ELSE 0 END AS machine_running
                          FROM ${table} 
                          WHERE timestamp 
                          BETWEEN 
                            (SELECT DATE_SUB(MAX(timestamp), INTERVAL 5 MINUTE) FROM ${table}) 
                          AND 
                            (SELECT MAX(timestamp) FROM ${table})`,
            (err, results) => {
              console.log(results)
              if (err) {
                console.error('เกิดข้อผิดพลาดในการค้นหาข้อมูล:', err);
              }
              else if (results.length > 0 && list.Alert === "ON") {
                const resData = results[0];
                const currentTime = new Date();
                const dataTime = new Date(resData.latest_timestamp);
                const timeDifference = Number((currentTime - dataTime) / (60 * 1000));

                const status = list.Status;

                // ตรวจสอบการเชื่อมต่อของอุปกรณ์ ONLINE
                console.log("machine_running", resData.machine_running);
                if (status === "ONLINE" && list.OnlinetAL === "OFF") {
                  console.log("Machine is running...")
                  connection.execute(`UPDATE machinelist
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
                        console.log(results);
                        sendLineNotify(list.LineToken, `เครื่อง ${list.machineName} ออนไลน์`);
                      }
                    }
                  )
                }   // ตรวจสอบการเชื่อมต่อของอุปกรณ์ ONLINE
                else if (status === "ONLINE" && Number(resData.machine_running) > 0 && list.StartAL === "OFF") {
                  console.log("Machine is running...")
                  connection.execute(`UPDATE machinelist
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
                        console.log(results);
                        sendLineNotify(list.LineToken, `เครื่อง ${list.machineName} เครื่องจักรเริ่มทำงาน`);
                      }
                    }
                  )
                }  // ตรวจสอบการเชื่อมต่อของอุปกรณ์ OFFLINE (ขาดการเชื่อมต่อเกิน 15 นาที)
                else if (timeDifference >= list.AlertTime && list.DisAL === "OFF") {
                  console.log(`ข้อมูลล่าสุดเกิน ${list.AlertTime} นาที:`, resData);
                  connection.execute(`UPDATE machinelist
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
                        console.log(results);
                        sendLineNotify(list.LineToken, `เครื่อง ${list.machineName} ขาดการเชื่อมต่อ`);
                      }
                    }
                  )
                }  // ตรวจสอบการส่งข้อมูล (ไม่มีข้อมูลส่งมาใน 5 นาที) เครื่องจักหยุดการทำงาน
                else if (resData.sum_qty == 0 && list.StopAL === "OFF") {
                  console.log("Machine is stopped working...");
                  connection.execute(`UPDATE machinelist
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
                        console.log(results);
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
