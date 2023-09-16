import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Menu,
  Avatar,
  Button,
} from "@material-tailwind/react";

import { FormProduct } from "@/widgets/form";
import { Loading } from "@/widgets/layout";
import { useGetData, useDeleteData } from '@/data'
import { API_URL } from "@/configs";

import { alert_success, alert_failed, alert_delete } from "@/widgets/alert";
import { dateFormat } from "@/configs";

export function ProductList() {
  const [processList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [dataObj, setDataObj] = useState([]);

  async function getData() {
    await useGetData(API_URL.URL_PRODUCT).then(res => {
      setProductList(res);
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

  // ลบรายการผลิต
  const dropProduct = (el) => {
    alert_delete(`${el.product} Lot.${el.Lot}`).then((result) => {
      if (result.isConfirmed) {
        (async () => {
          try {
            const id = el.id;
            const res = await useDeleteData(API_URL.URL_DELETE_PD, { id });
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
        <Loading />
      ) : (
        <>
          <div className="mt-12">
            <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-1">
              <Card className="h-full w-full">
                <CardHeader
                  floated={false}
                  shadow={false}
                  color="transparent"
                  className="m-0 flex items-center justify-between p-6"
                >
                  <div>
                    <Typography variant="h5" color="blue-gray" className="mb-1">
                      รายการผลิต
                    </Typography>
                  </div>
                  <Menu placement="left-start">
                    <Button
                      className="py-2"
                      onClick={() => {
                        handleDialogOpen();
                        handleDataObj();
                      }}
                    >
                      <span><i className="fa-solid fa-plus fa-2x" /></span>
                      <span>เพิ่มรายการ</span>
                    </Button>
                  </Menu>
                </CardHeader>
                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                  <table className="w-full min-w-max table-auto text-left" id="productList">
                    <thead>
                      <tr>
                        {["เครื่องจักร", "เลขที่ผลิต", "รายการผลิต", "ขนาดผลิต", "วันที่เริ่มผลิต", "วันที่จบการผลิต", "แก้ไข", "ลบ"].map(
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
                      {processList.map((el, key) => {
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
                                    {el.machineName}
                                  </Typography>
                                  <Typography className="text-xs font-normal text-blue-gray-500">
                                    ID {el.machineID}
                                  </Typography>
                                </div>
                              </div>
                            </td>
                            <td className={className}>
                              <Typography
                                variant="small"
                                className="text-xs font-medium text-blue-gray-600"
                              >
                                {el.Lot}
                              </Typography>
                            </td>
                            <td className={className}>
                              <Typography
                                variant="small"
                                className="text-xs font-medium text-blue-gray-600"
                              >
                                {el.product}
                              </Typography>
                            </td>
                            <td className={className}>
                              <Typography
                                variant="small"
                                className="text-xs font-medium text-blue-gray-600"
                              >
                                {Number(el.batchSize).toLocaleString()}
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
                                onClick={() => dropProduct(el)}
                              >
                                Delete
                              </Typography>
                            </td>
                            {/* <td className={className}>
                        <div className="w-10/12">
                          <Typography
                            variant="small"
                            className="mb-1 block text-xs font-medium text-blue-gray-600"
                          >
                            {100}%
                          </Typography>
                          <Progress
                            value={100}
                            variant="gradient"
                            color={100 === 100 ? "green" : "blue"}
                            className="h-1"
                          />
                        </div>
                      </td> */}
                          </tr>
                        );
                      }
                      )}
                    </tbody>
                  </table>
                </CardBody>
              </Card>
              <FormProduct open={modalOpen} setOpen={setModalOpen} dataObj={dataObj} />
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default ProductList;
