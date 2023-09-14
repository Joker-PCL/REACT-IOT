import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Button,
} from "@material-tailwind/react";

import { FormMachine } from "@/widgets/layout";
import { useGetData, useDeleteData } from '@/data'
import { API_URL } from "@/configs";

import { alert_success, alert_failed, alert_delete } from "@/widgets/alert";

export function MachineLists() {
  const [modalOpen, setModalOpen] = useState(false);
  const [dataObj, setDataObj] = useState([]);

  const [machineLists, setMachineLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function getData() {
    await useGetData(API_URL.URL_MACHINE).then(res => {
      setMachineLists(res);
      setIsLoading(false);
    }).catch((error) => {
      console.error("Error fetching dataMC:", error);
      alert_failed();
    });
  };

  useEffect(() => {
    if (!modalOpen) {
      getData();
    }
  }, [modalOpen]);

  const handleDialogOpen = () => {
    setModalOpen(true);
  };

  const handleDataObj = (data = "") => {
    setDataObj(data);
  }

  // ลบเครื่องจักร
  const dropMachine = (el) => {
    alert_delete(el.machineName).then((result) => {
      if (result.isConfirmed) {
        (async () => {
          try {
            const machineID =  el.machineID;
            const res = await useDeleteData(API_URL.URL_DELETE_MC, { machineID });
            getData();
            alert_success();
          } catch (error) {
            console.error("Error deleting dataMC:", error);
            alert_failed();
          }
        })();
      }
    })
  };

  return (
    <>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <>
          <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
              <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
                <div color="white" className="flex justify-between items-center">
                  <Typography variant="h5">รายการเครื่องจักร</Typography>
                  <Button color="deep-orange"
                    onClick={() => {
                      handleDialogOpen();
                      handleDataObj();
                    }}>
                    <span><i className="fa-solid fa-plus fa-2x" /></span>
                    <span>เพิ่มเครื่องจักร</span>
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                <table className="w-full min-w-[640px] table-auto">
                  <thead>
                    <tr>
                      {["รายชื่อเครื่องจักร", "สถานะ", "หน่วยชิ้นงาน", "รีเจค", "การแจ้งเตือน", "แก้ไข", "ลบ"].map((el, index) => (
                        <th
                          key={el}
                          className={`border-b border-blue-gray-50 py-3 px-5 ${index > 0 ? 'text-center' : 'text-left'}`}
                        >
                          <Typography
                            variant="h6"
                            className="font-bold uppercase text-blue-gray-400"
                          >
                            {el}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {machineLists.map((el, key) => {
                      const className = `py-3 px-5 ${key === machineLists.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                        }`;

                      return (
                        <tr className="text-center" key={el.machineID}>
                          <td className={className}>
                            <div className="flex items-center gap-4">
                              <Avatar src={'../machine.png'} alt={'../machine.png'} size="sm" />
                              <div>
                                <Typography
                                  variant="small"
                                  color="blue-gray"
                                  className="font-semibold"
                                >
                                  {el.machineName}
                                </Typography>
                                <Typography className="text-xs font-normal text-blue-gray-500">
                                  ID {el.machineID}
                                </Typography>
                              </div>
                            </div>
                          </td>
                          <td className={className}>
                            <Chip
                              variant="gradient"
                              color={
                                el.Status == "ONLINE" ? "green" :
                                  el.Status == "START" ? "green" :
                                    el.Status == "STOP" ? "red" :
                                      el.Status == "OFFLINE" ? "blue-gray" : "blue-gray"
                              }
                              value={el.Status}
                              className={`py-0.5 text-[11px] font-medium text-center`}
                              style={{ width: "70px" }}
                            />
                          </td>
                          <td className={className}>
                            <Typography className="text-sm font-semibold text-blue-gray-600">
                              {el.unit}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Chip
                              variant="gradient"
                              color={
                                el.RejectType == "NC" ? "green" :
                                  el.RejectType == "NO" ? "red" : "red"
                              }
                              value={el.RejectType}
                              className={`py-0.5 text-[11px] font-medium text-center`}
                            />
                          </td>
                          <td className={className}>
                            <Chip
                              variant="gradient"
                              color={
                                el.Alert == "ON" ? "green" :
                                  el.Alert == "OFF" ? "red" : "red"
                              }
                              value={el.Alert}
                              className={`py-0.5 text-[11px] font-medium text-center`}
                            />
                          </td>
                          <td className={className}>
                            <Typography
                              as="a"
                              href="#"
                              className="text-sm underline font-bold text-yellow-600"
                              onClick={() => {
                                handleDataObj(el);
                                handleDialogOpen();
                              }}
                            >
                              Edit
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography
                              as="a"
                              href="#"
                              className="text-sm underline font-bold text-red-600"
                              onClick={() => dropMachine(el)}
                            >
                              Delete
                            </Typography>
                          </td>
                        </tr>
                      );
                    }
                    )}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </div>

          <FormMachine open={modalOpen} setOpen={setModalOpen} dataObj={dataObj} />
        </>

      )}
    </>
  );
}

export default MachineLists;
