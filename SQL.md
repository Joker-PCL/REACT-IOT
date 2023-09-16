# สร้างตารางและตั้งคอลัมน์ timestamp เป็น primary key
CREATE TABLE machineid_xxx (
    timestamp TIMESTAMP PRIMARY KEY
);

# เพิ่มข้อมูล timestamp ทุกๆ นาทีทั้งวัน ตั้งแต่เวลา 00:00:00
INSERT IGNORE INTO machineid_xxx (timestamp)
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
WHERE TIMESTAMP(CONCAT(CURDATE(), ' 00:00:00')) + INTERVAL (t4*10000 + t3*1000 + t2*100 + t1*10 + t0) MINUTE < TIMESTAMP(CONCAT(CURDATE() + INTERVAL 1 DAY, ' 00:00:00'));

# JOIN TABLES
SELECT WS.*, MC.machineName
FROM workshift AS WS
JOIN machinelist AS MC ON MC.machineID = WS.machineID
WHERE WS.machineID = 175001
ORDER BY WS.id ASC

INSERT INTO `workshift` (`machineID`, `sWork1`, `eWork1`, `sWork2`, `eWork2`, `sWork3`, `eWork3`, `sWork4`, `eWork4`) VALUES ('175001', '06:00:00', '11:30:00', '12:30:00', '17:00:00', '17:00:00', '21:00:00', '22:00:00', '06:00:00');