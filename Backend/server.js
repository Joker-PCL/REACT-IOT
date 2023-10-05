const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');

const { dbConnect } = require("./config/connection");
const { sendLineNotify } = require("./config/sendLineNotify");

const db = dbConnect();
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET_KEY = 'polipharm';

const device = require('./device-api');
const dashboard = require('./dashboard');
const machineCRUD = require('./machineCRUD');
const productCRUD = require('./productCRUD');
const workShift = require('./work-shift');
const oee = require('./oee');
app.use('/dashboard', verifyToken, dashboard);
app.use('/machineCRUD', verifyToken, machineCRUD);
app.use('/productCRUD', verifyToken, productCRUD);
app.use('/workShift', verifyToken, workShift);
app.use('/oee', verifyToken, oee);
app.use('/api', verifyToken, device);

function verifyToken(req, res, next) {
  const token = req.headers.authorization; // รับ token จาก headers
  next();
  // if (!token) {
  //   return res.status(401).json({ error: 'ไม่พบ token' });
  // }

  // jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
  //   if (!err) {
  //     const token = jwt.sign({msg: 175001}, JWT_SECRET_KEY, { expiresIn: '1h' });
  //     return res.status(403).json(token);
  //   }

  //   req.user = decoded;
  //   next();
  // });
}

//********************* INTERVAL FUNCTION CHECK DATA *********************//
function updateStatus(table, status, alertTime) {
  console.log("updateStatus", status)
  db.execute(`UPDATE ${table}
                SET Status =?                      
                WHERE timestamp 
                BETWEEN DATE_SUB(NOW(), INTERVAL ? MINUTE) 
                AND NOW();`,
    [status, alertTime],
    function (err, results) {
      if (err) {
        console.error("Error fetching data:", err);
      } else {
        console.log(results);
        return;
      }
    })
}

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
                            CASE WHEN qty > 0 THEN 1 ELSE 0 END AS machine_running
                    FROM ${table} 
                    WHERE timestamp 
                    BETWEEN 
                      DATE_SUB(NOW(), INTERVAL ${Number(list.AlertTime)} MINUTE) 
                    AND 
                      NOW();`,
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
                  updateStatus(table, 'START', list.AlertTime, resData.latest_timestamp);
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
                else if (resData.sum_qty == null && list.DisAL === "OFF") {
                  console.log(`ข้อมูลล่าสุดเกิน ${list.AlertTime} นาที:`, resData);
                  updateStatus(table, 'OFFLINE', list.AlertTime, resData.latest_timestamp);
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
                  updateStatus(table, 'STOP', list.AlertTime, resData.latest_timestamp);
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
  }
}

checkDeviceStatus();
setInterval(checkDeviceStatus, 30000); // ตรวจสอบทุก 1 นาที (60000 มิลลิวินาที)


app.listen(3000, function () {
  console.log("CORS-enabled web server listening on port 3000");
});
