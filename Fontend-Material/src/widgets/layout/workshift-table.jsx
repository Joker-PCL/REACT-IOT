import React, { useState, useEffect } from "react";
import {
    Typography,
    Card,
    CardHeader,
    CardBody,
    Menu,
    Avatar,
    Button,
    IconButton
} from "@material-tailwind/react";

import { Loading } from "@/widgets/layout";
import { useGetData, useDeleteData } from '@/data'
import { FormWorkShift } from "@/widgets/form";
import { API_URL } from "@/configs";

import { alert_success, alert_failed, alert_delete } from "@/widgets/alert";
import { dateFormat } from "@/configs";

export function WorkShiftTable({ setOpen, dataObj }) {
    const [isLoading, setIsLoading] = useState(true);
    const [formWorkShiftOpen, setFormWorkShiftOpen] = useState(false);
    const [formWorkShiftData, setFormWorkShiftData] = useState({});

    const [WorkShift, setWorkShift] = useState({});

    const getWorkShift = async function (LotNumber) {
        try {
            const res = await useGetData(`${API_URL.URL_WS}/${LotNumber}`);
            setWorkShift(res);
            setIsLoading(false);
        } catch (error) {
            alert_failed(error);
        }
    }

    const deleteWorkShift = async function (el) {
        const sWork = new Date(el.start_work).toLocaleDateString('en-GB', dateFormat).split(',')[0];
        const eWork = new Date(el.end_work).toLocaleDateString('en-GB', dateFormat).split(',')[0];
        alert_delete(`${sWork} ถึง ${eWork}`).then((result) => {
            if (result.isConfirmed) {
                (async () => {
                    try {
                        const wsID = el.wsID;
                        await useDeleteData(API_URL.URL_DELETE_WS, { wsID });
                        getWorkShift(el.Lot);
                        alert_success();
                    } catch (error) {
                        console.error("Error deleting dataMC:", error);
                        alert_failed();
                    }
                })();
            }
        })
    }

    const handleFormWorkShiftOpen = () => {
        setFormWorkShiftOpen(true);
    }

    useEffect(() => {
        if (!formWorkShiftOpen) {
            getWorkShift(dataObj.Lot);
        }
    }, [formWorkShiftOpen]);


    return (
        <>
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    <div className="grid grid-cols-1 mt-10 xl:px-10">
                        <Card>
                            <CardHeader
                                floated={false}
                                shadow={false}
                                color="transparent"
                                className="m-0 flex items-center justify-between p-6"
                            >
                                <Typography className="flex gap-2">
                                    <Menu className="flex justify-end gap-2 left-start">
                                        <Button color="gray" className="py-2" onClick={() => { setOpen(false); }}>
                                            <span><i className="fa-solid fa-backward fa-2x" /></span>
                                            <span>กลับ</span>
                                        </Button>
                                        <Button
                                            className="py-2"
                                            onClick={async () => {
                                                await setFormWorkShiftData({
                                                    machineID: dataObj.machineID,
                                                    Lot: dataObj.Lot,
                                                    product: dataObj.product
                                                });
                                                handleFormWorkShiftOpen()
                                            }}
                                        >
                                            <span><i className="fa-solid fa-plus fa-2x" /></span>
                                            <span>เพิ่มรายการ</span>
                                        </Button>
                                    </Menu>
                                </Typography>
                            </CardHeader>
                            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                                <table className="w-full min-w-max table-auto text-left" id="productList">
                                    <thead>
                                        <tr>
                                            {["เริ่มผลิตวันที่", "ถึงวันที่", "รายการกะ", "เริ่มเวลา", "สิ้นสุดเวลา", "แก้ไข", "ลบ"].map(
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
                                        {WorkShift.map((el, key) => {
                                            const className = `py-3 px-5 ${key === el.length - 1
                                                ? ""
                                                : "border-b border-blue-gray-50"
                                                }`;

                                            return (
                                                <>
                                                    <tr  className="bg-lime-400">
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                {new Date(el.start_work).toLocaleDateString('en-GB', dateFormat).split(',')[0]}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                {new Date(el.end_work).toLocaleDateString('en-GB', dateFormat).split(',')[0]}
                                                            </Typography>
                                                        </td>

                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                กะเช้า
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                {el.sw_day_1 || ""}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                {el.ew_day_1 || ""}
                                                            </Typography>
                                                        </td>

                                                        <td className={className}>
                                                            <Button
                                                                color="green"
                                                                className="py-1 px-1 w-[75px] justify-center text-white"
                                                                onClick={async () => {
                                                                    await setFormWorkShiftData(el);
                                                                    handleFormWorkShiftOpen()
                                                                }}
                                                            >
                                                                Edit
                                                            </Button>
                                                        </td>
                                                        <td className={className}>
                                                            <Button
                                                                color="red"
                                                                className="py-1 px-1 w-[75px] justify-center"
                                                                onClick={() => deleteWorkShift(el)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td></td>
                                                        <td></td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                กะบ่าย
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                {el.sw_day_2 || ""}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                {el.ew_day_2 || ""}
                                                            </Typography>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td></td>
                                                        <td></td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                โอที(ช่วงเช้า)
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                {el.sw_day_ot || ""}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                {el.ew_day_ot || ""}
                                                            </Typography>
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td></td>
                                                        <td></td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                กะกลางคืน
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                {el.sw_night_1 || ""}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                {el.ew_night_1 || ""}
                                                            </Typography>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td></td>
                                                        <td></td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                กะกลางคืน(หลังพัก)
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                {el.sw_night_2 || ""}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                {el.ew_night_2 || ""}
                                                            </Typography>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td></td>
                                                        <td></td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                โอที(กะกลางคืน)
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                {el.sw_night_ot || ""}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs font-medium text-blue-gray-600"
                                                            >
                                                                {el.ew_night_ot || ""}
                                                            </Typography>
                                                        </td>
                                                    </tr>
                                                </>
                                            );
                                        }
                                        )}
                                    </tbody>
                                </table>
                            </CardBody>
                        </Card>
                    </div>

                    <FormWorkShift open={formWorkShiftOpen} setOpen={setFormWorkShiftOpen} dataObj={formWorkShiftData} />
                </>
            )}
        </>
    )
}

export default WorkShiftTable;