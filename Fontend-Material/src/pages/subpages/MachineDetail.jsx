import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
} from "@material-tailwind/react";

import {
  ChartPieIcon,
  ListBulletIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";

import {
  ClockIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";

import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
  projectsTableData,
  ordersOverviewData,
} from "@/data";

import { useGetData, usePostData } from '@/data'
import { API_URL } from "@/configs";
import { alert_success, alert_failed, alert_delete } from "@/widgets/alert";
import { NavMini } from "@/layouts";
import { dateFormat } from "@/configs";

export function MachineDetail() {
  const receivedData = useLocation().state;

  const [dataLists, setDataListss] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function getData() {
    await usePostData(API_URL.URL_DETAIL, receivedData).then(res => {
      setDataListss(res);
      setIsLoading(false);
    }).catch((error) => {
      console.error("Error fetching dataMC:", error);
      alert_failed();
    });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <NavMini />
      <>
        {isLoading ? (
          <h1>Loading...</h1>
        ) : (
          <>
            <div className="mt-12">
              <div className="px-5">
                <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
                  {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
                    <StatisticsCard
                      key={title}
                      {...rest}
                      title={title}
                      icon={React.createElement(icon, {
                        className: "w-6 h-6 text-white",
                      })}
                      footer={
                        <Typography className="font-normal text-blue-gray-600">
                          <strong className={footer.color1}>{footer.value}</strong>
                          &nbsp;<span className={footer.color2}>{footer.label}</span>
                        </Typography>
                      }
                    />
                  ))}
                </div>
                <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-1 xl:grid-cols-1">
                  {statisticsChartsData.map((props) => (
                    <StatisticsChart
                      key={props.title}
                      {...props}
                      footer={
                        <Typography
                          variant="small"
                          className="flex items-center font-normal text-blue-gray-600"
                        >
                          <ClockIcon strokeWidth={2} className="h-4 w-4 text-inherit" />
                          &nbsp;{props.footer}
                        </Typography>
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="mt-12 px-5">
                <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-1">
                  <Card className="h-full w-full">
                    <CardHeader
                      floated={false}
                      shadow={false}
                      color="transparent"
                      className="m-0 flex items-center justify-center p-6"
                    >
                      <div>
                        <Typography variant="h5" color="blue-gray" className="mb-1">
                          รายการผลิต
                        </Typography>
                      </div>
                    </CardHeader>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                      <table className="w-full min-w-max table-auto text-left">
                        <thead>
                          <tr>
                            {["รายการผลิต", "ขนาดผลิต", "วันที่เริ่มผลิต", "วันที่จบการผลิต"].map(
                              (el) => (
                                <th
                                  key={el}
                                  className="border-b border-blue-gray-50 py-3 px-6 text-left"
                                >
                                  <Typography
                                    variant="small"
                                    className="text-[14px] font-medium uppercase text-blue-gray-400"
                                  >
                                    {el}
                                  </Typography>
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {dataLists.map((el, key) => {
                            const className = `py-3 px-5 ${key === el.length - 1
                              ? ""
                              : "border-b border-blue-gray-50"
                              }`;

                            return (
                              <tr key={el.id}>
                                <td className={className}>
                                  <div className="flex items-center gap-4">
                                    <Avatar src={'../drugs.png'} alt={'../drugs.png'} size="sm" />
                                    <div>
                                      <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-semibold"
                                      >
                                        {el.product}
                                      </Typography>
                                      <Typography className="text-sm font-normal text-blue-gray-500">
                                        Lot. {el.Lot}
                                      </Typography>
                                    </div>
                                  </div>
                                </td>
                                <td className={className}>
                                  <Typography
                                    variant="small"
                                    className="text-xs font-medium text-blue-gray-600"
                                  >
                                    {Number(el.batchSize).toLocaleString()}
                                    <span className="text-[14px] px-1">
                                      {el.unit}
                                    </span>
                                  </Typography>
                                </td>
                                <td className={className}>
                                  <Typography
                                    variant="small"
                                    className="text-xs font-medium text-blue-gray-600"
                                  >
                                    {new Date(el.start_production).toLocaleString('en-GB', dateFormat)}
                                  </Typography>
                                </td>
                                <td className={className}>
                                  <Typography
                                    variant="small"
                                    className="text-xs font-medium text-blue-gray-600"
                                  >
                                    {new Date(el.end_production).toLocaleString('en-GB', dateFormat)}
                                  </Typography>
                                </td>
                              </tr>
                            )}
                          )}
                        </tbody>
                      </table>
                    </CardBody>
                  </Card>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    </>
  );
}

MachineDetail.displayName = "/src/layout/MachineDetail.jsx";

export default MachineDetail;
