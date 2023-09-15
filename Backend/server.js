const express = require("express");
const cors = require("cors");

const { dbConnect } = require("./config/connection");
const { sendLineNotify } = require("./config/sendLineNotify");

const db = dbConnect();
const app = express();

app.use(cors());
app.use(express.json());

const device = require('./device-api');
const dashboard = require('./dashboard-api');
const machineCRUD = require('./machineCRUD');
const productCRUD = require('./productCRUD');
const oee = require('./oee-api');
app.use('/dashboard', dashboard);
app.use('/machineCRUD', machineCRUD);
app.use('/productCRUD', productCRUD);
app.use('/oee', oee);
app.use('/api', device);

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
setInterval(checkDeviceStatus, 30000); // ตรวจสอบทุก 1 นาที (60000 มิลลิวินาที)


app.listen(3000, function () {
  console.log("CORS-enabled web server listening on port 3000");
});
