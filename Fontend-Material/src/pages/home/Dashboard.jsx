import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";

import { API_URL } from "@/configs";
import { useGetData } from '@/data'
import { alert_failed, alert_delete } from "@/widgets/alert";

const dateFormat = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};

export function Dashboard() {
  const [dataMCs, setDataMCs] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // เพิ่ม state เพื่อติดตามการโหลดข้อมูล

  async function getData() {
    await useGetData(API_URL.URL_DASHBOARD).then(res => {
      setDataMCs(res);
      setIsLoading(false);
    }).catch((error) => {
      console.error("Error fetching dataMC:", error);
      alert_failed();
    });
  };

  useEffect(() => {
    getData();

    const interval = setInterval(() => {
      console.log("Loading data...")
      getData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <>
          <div className="mt-12 main-detail">
            {dataMCs.sort((a, b) => a.machineID - b.machineID).map(dataMCs =>
              <div className="mb-20" key={dataMCs.machineID}>
                <Card>
                  <CardHeader
                    variant="gradient"
                    color={
                      dataMCs.Status === "ONLINE" ? "green" :
                        dataMCs.Status === "START" ? "green" :
                          dataMCs.Status === "OFFLINE" ? "gray" :
                            dataMCs.Status === "STOP" ? "red" : "gray"
                    }
                    className="grid h-20 place-items-center"
                  >
                    <Typography className="text-2xl font-bold pt-2" color="white">
                      {dataMCs.machineName} ({dataMCs.machineID})
                    </Typography>
                    <Typography className="text-xm font-bold pb-2" color="white">
                      {dataMCs.latest_information ? `เชื่อมต่อล่าสุด ${new Date(dataMCs.latest_information).toLocaleString('en-GB', dateFormat)}` : "OFFLINE"}
                    </Typography>
                  </CardHeader>
                  <CardBody>
                    <Typography variant="h4" color="gray" className="mb-2 text-center">
                      ยอดผลิตสะสม {dataMCs.totalQty ? Number(dataMCs.totalQty).toLocaleString() : "x,xxx"} {dataMCs.unit}
                    </Typography>
                    <Typography variant="h5" color="gray" className="mb-2 text-center">
                      เป้าการผลิต {dataMCs.batchSize ? Number(dataMCs.batchSize).toLocaleString() : "x,xxx"} {dataMCs.unit}
                    </Typography>
                    <div className="container flex justify-between">
                      <div className="main-detail">
                        <div className="detail-box2">
                          <div className="mt-3 px-5">
                            <li className='leading-loose' id="product_name">
                              ชื่อยา : {dataMCs.product}
                            </li>
                            <li className='leading-loose' id="lot">
                              เลขที่ผลิต : {dataMCs.Lot}
                            </li>
                            <li className='leading-loose' id="period_time">
                              เวลาผ่านไปแล้ว : {dataMCs.period_time}
                            </li>
                            <li className='leading-loose' id="average">เฉลี่ย {parseInt(dataMCs.avgQty) || "00"} {dataMCs.unit} ต่อ นาที
                            </li>
                            <li>
                              จะเสร็จในอีก (โดยประมาณ) :
                              {dataMCs.time_completed ? ` ${dataMCs.time_completed}` : " 00 วัน 00 นาที ชั่วโมง 00 นาที"}
                            </li>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                  <CardFooter className="pt-0 flex justify-end">
                    <Link to="/machine-detail" state={{ ...dataMCs }}>
                      <Button className="py-2">
                        <span><i className="fa-solid fa-circle-info fa-2x" /></span>
                        <span>รายละเอีด</span>
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default Dashboard;
