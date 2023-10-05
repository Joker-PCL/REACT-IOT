import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    Typography,
    Input,
    Textarea,
    Select,
    Option
} from "@material-tailwind/react";

import { API_URL } from "@/configs";
import { useGetData, usePostData, usePutData } from '@/data'
import { alert_success, alert_failed } from "@/widgets/alert";
import { convertToDateLocal, convertTimeLocal, timeDifFormat, SumOfDuration } from "@/configs";

export function FormWorkShift({ open, setOpen, dataObj }) {
    const formOpen = () => setOpen(!open);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (open) {
            setFormData(dataObj);
        } else {
            setFormData({}); // ตั้งค่าเป็นข้อมูลว่างเมื่อปิด Modal
        }
    }, [open, dataObj]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (dataObj.wsID) {
            (async () => {
                await usePutData(API_URL.URL_UPDATE_WS, formData).then(() => {
                    formOpen();
                    alert_success();
                }).catch((error) => {
                    console.error("Error fetching dataMC:", error);
                    alert_failed();
                });
            })();
        } else {
            (async () => {
                await usePostData(API_URL.URL_CREATE_WS, formData).then((res) => {
                    formOpen();
                    alert_success();
                }).catch((error) => {
                    console.error("Error fetching dataMC:", error);
                    // if (error.response.status === 404) {
                    //     setErrorMsg(error.response.data);
                    // }
                });
            })();
        }
    };

    const updateData = (key, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [key]: value,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        updateData(name, value);
    }

    const handleSumTime = (e) => {
        const divEL = e.target.closest('.work-time');
        const sWork = divEL.querySelector('.sWork').value;
        const eWork = divEL.querySelector('.eWork').value;

        const sTime = convertTimeLocal(sWork);
        const eTime = convertTimeLocal(eWork);

        const timeDifference = (eTime < sTime ? eTime.setDate(eTime.getDate() + 1) : eTime) - sTime;
        const timeDif = timeDifFormat(timeDifference);

        const ptEl = divEL.querySelector('.tWork');
        ptEl.value = timeDif;

        updateData(ptEl.name, timeDif);

        const work_shift = e.target.closest('.work-shift');
        const total_day_el = work_shift.querySelectorAll('.tWork-day');
        const total_night_el = work_shift.querySelectorAll('.tWork-night');

        const total_day = Array.from(total_day_el).map(element => {
            return element.value || "00:00";
        });

        const total_day_sum = SumOfDuration(total_day);
        updateData("tw_day_shift", total_day_sum);

        const total_night = Array.from(total_night_el).map(element => {
            return element.value || "00:00";
        });

        const total_night_sum = SumOfDuration(total_night);
        updateData("tw_night_shift", total_night_sum);

        const total_time_sum = SumOfDuration([total_day_sum, total_night_sum]);
        console.log(total_time_sum)
        updateData("total_work_time", total_time_sum);
    }

    return (
        <>
            {!formData || <>
                <Dialog open={open} size="xxl">
                    <DialogBody divider className="grid overflow-y-scroll xl:px-20">
                        <form onSubmit={handleSubmit}>
                            <div className="flex justify-center xl:col-span-2 text-[24px] font-bold underline">ช่วงเวลาการทำงาน</div>
                            <div className="my-10 grid gap-y-6 xl:col-span-2">
                                <div className="grid gap-y-6 gap-x-6 md:grid-cols-2 xl:col-span-2">
                                    <Input
                                        label="เริ่มกะวันที่ *"
                                        id="start_work"
                                        name="start_work"
                                        defaultValue={convertToDateLocal(dataObj.start_work)}
                                        type="date"
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label="สิ้นสุดกะวันที่ *"
                                        id="end_work"
                                        name="end_work"
                                        defaultValue={convertToDateLocal(dataObj.end_work)}
                                        type="date"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-y-6 gap-x-6 md:grid-cols-3 xl:col-span-2 xl:grid-cols-3 xl:col-span-2">
                                    <Input
                                        label="รวมเวลาทำงาน(กะกลางวัน)"
                                        id="tw_day_shift"
                                        name="tw_day_shift"
                                        defaultValue={formData.tw_day_shift}
                                        type="time"
                                        readOnly
                                    />
                                    <Input
                                        label="รวมเวลาทำงาน(กะกลางคืน)"
                                        id="tw_night_shift"
                                        name="tw_night_shift"
                                        defaultValue={formData.tw_night_shift}
                                        type="time"
                                        readOnly
                                    />
                                    <Input
                                        label="รวมเวลาทำงาน"
                                        id="total_work_time"
                                        name="total_work_time"
                                        defaultValue={formData.total_work_time}
                                        type="time"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="work-shift grid gap-y-6 xl:col-span-2">
                                <div className="flex justify-center xl:col-span-2 text-[24px] font-bold underline">ช่วงเวลาการทำงาน(กะเช้า)</div>
                                <div className="work-time grid gap-y-6 gap-x-6 md:grid-cols-3 xl:col-span-2 xl:grid-cols-3 xl:col-span-2">
                                    <Input
                                        label="กะเช้าเริ่มเวลา *"
                                        id="sw_day_1"
                                        name="sw_day_1"
                                        className="sWork"
                                        defaultValue={formData.sw_day_1}
                                        type="time"
                                        onChange={(e) => { handleChange(e); handleSumTime(e); }}
                                    />
                                    <Input
                                        label="สิ้นสุดกะเช้าเวลา *"
                                        id="ew_day_1"
                                        name="ew_day_1"
                                        className="eWork"
                                        defaultValue={formData.ew_day_1}
                                        type="time"
                                        onChange={(e) => { handleChange(e); handleSumTime(e); }}
                                    />
                                    <Input
                                        label="รวมเวลากะเช้า"
                                        id="tw_day_1"
                                        name="tw_day_1"
                                        className="tWork tWork-day"
                                        defaultValue={formData.tw_day_1}
                                        type="time"
                                        onChange={handleChange}
                                        success
                                        readOnly
                                    />
                                </div>
                                <div className="work-time grid gap-y-6 gap-x-6 md:grid-cols-3 xl:col-span-2 xl:grid-cols-3 xl:col-span-2">
                                    <Input
                                        label="กะบ่ายเริ่มเวลา *"
                                        id="sw_day_2"
                                        name="sw_day_2"
                                        className="sWork"
                                        defaultValue={formData.sw_day_2}
                                        type="time"
                                        onChange={(e) => { handleChange(e); handleSumTime(e); }}
                                    />
                                    <Input
                                        label="สิ้นสุดกะบ่ายเวลา *"
                                        id="ew_day_2"
                                        name="ew_day_2"
                                        className="eWork"
                                        defaultValue={formData.ew_day_2}
                                        type="time"
                                        onChange={(e) => { handleChange(e); handleSumTime(e); }}
                                    />
                                    <Input
                                        label="รวมเวลากะบ่าย"
                                        id="tw_day_2"
                                        name="tw_day_2"
                                        className="tWork tWork-day"
                                        defaultValue={formData.tw_day_2}
                                        type="time"
                                        onChange={handleChange}
                                        success
                                        readOnly
                                    />
                                </div>
                                <div className="work-time grid gap-y-6 gap-x-6 md:grid-cols-3 xl:col-span-2 xl:grid-cols-3 xl:col-span-2">
                                    <Input
                                        label="โอทีเริ่มเวลา *"
                                        id="sw_day_ot"
                                        name="sw_day_ot"
                                        className="sWork"
                                        defaultValue={formData.sw_day_ot}
                                        type="time"
                                        onChange={(e) => { handleChange(e); handleSumTime(e); }}
                                    />
                                    <Input
                                        label="สิ้นสุดโอทีเวลา *"
                                        id="ew_day_ot"
                                        name="ew_day_ot"
                                        className="eWork"
                                        defaultValue={formData.ew_day_ot}
                                        type="time"
                                        onChange={(e) => { handleChange(e); handleSumTime(e); }}
                                    />
                                    <Input
                                        label="รวมเวลาโอที"
                                        id="tw_day_ot"
                                        name="tw_day_ot"
                                        className="tWork tWork-day"
                                        defaultValue={formData.tw_day_ot}
                                        type="time"
                                        onChange={handleChange}
                                        success
                                        readOnly
                                    />
                                </div>

                                <div className="flex justify-center xl:col-span-2 text-[24px] font-bold underline">ช่วงเวลาการทำงาน(กะกลางคืน)</div>
                                <div className="work-time grid gap-y-6 gap-x-6 md:grid-cols-3 xl:col-span-2 xl:grid-cols-3 xl:col-span-2">
                                    <Input
                                        label="กะกลางคืนเริ่ม *"
                                        id="sw_night_1"
                                        name="sw_night_1"
                                        className="sWork"
                                        defaultValue={formData.sw_night_1}
                                        type="time"
                                        onChange={(e) => { handleChange(e); handleSumTime(e); }}
                                    />
                                    <Input
                                        label="สิ้นสุดกะกลางคืน *"
                                        id="ew_night_1"
                                        name="ew_night_1"
                                        className="eWork"
                                        defaultValue={formData.ew_night_1}
                                        type="time"
                                        onChange={(e) => { handleChange(e); handleSumTime(e); }}
                                    />
                                    <Input
                                        label="รวมเวลากะกลางคืน"
                                        id="tw_night_1"
                                        name="tw_night_1"
                                        className="tWork tWork-night"
                                        defaultValue={formData.tw_night_1}
                                        type="time"
                                        onChange={handleChange}
                                        success
                                        readOnly
                                    />
                                </div>
                                <div className="work-time grid gap-y-6 gap-x-6 md:grid-cols-3 xl:col-span-2 xl:grid-cols-3 xl:col-span-2">
                                    <Input
                                        label="กะกลางคืนเริ่มเวลา(หลังพัก)*"
                                        id="sw_night_2"
                                        name="sw_night_2"
                                        className="sWork"
                                        defaultValue={formData.sw_night_2}
                                        type="time"
                                        onChange={(e) => { handleChange(e); handleSumTime(e); }}
                                    />
                                    <Input
                                        label="สิ้นสุดกะกลางคืน(หลังพัก)*"
                                        id="ew_night_2"
                                        name="ew_night_2"
                                        className="eWork"
                                        defaultValue={formData.ew_night_2}
                                        type="time"
                                        onChange={(e) => { handleChange(e); handleSumTime(e); }}

                                    />
                                    <Input
                                        label="รวมเวลากะกลางคืน(หลังพัก)"
                                        id="tw_night_2"
                                        name="tw_night_2"
                                        className="tWork tWork-night"
                                        defaultValue={formData.tw_night_2}
                                        type="time"
                                        onChange={handleChange}
                                        success
                                        readOnly
                                    />
                                </div>
                                <div className="work-time grid gap-y-6 gap-x-6 md:grid-cols-3 xl:col-span-2 xl:grid-cols-3 xl:col-span-2">
                                    <Input
                                        label="โอทีเริ่มเวลา *"
                                        id="sw_night_ot"
                                        name="sw_night_ot"
                                        className="sWork"
                                        defaultValue={formData.sw_night_ot}
                                        type="time"
                                        onChange={(e) => { handleChange(e); handleSumTime(e); }}
                                    />
                                    <Input
                                        label="สิ้นสุดโอทีเวลา *"
                                        id="ew_night_ot"
                                        name="ew_night_ot"
                                        className="eWork"
                                        defaultValue={formData.ew_night_ot}
                                        type="time"
                                        onChange={(e) => { handleChange(e); handleSumTime(e); }}
                                    />
                                    <Input
                                        label="รวมเวลาโอที"
                                        id="tw_night_ot"
                                        name="tw_night_ot"
                                        className="tWork tWork-night"
                                        defaultValue={formData.tw_night_ot}
                                        type="time"
                                        onChange={handleChange}
                                        success
                                        readOnly
                                    />
                                </div>
                            </div>

                            <Typography className="my-10 flex justify-start gap-5 xl:col-span-2">
                                <Button color="blue" className="py-2" type="submit">
                                    <span><i className="fa-regular fa-floppy-disk fa-2x" /></span>
                                    <span>บันทึก</span>
                                </Button>
                                <Button color="red" className="py-2" onClick={formOpen}>
                                    <span><i className="fa-solid fa-xmark fa-2x" /></span>
                                    <span>Cancel</span>
                                </Button>
                            </Typography>
                        </form>
                    </DialogBody>
                </Dialog>
            </>
            }
        </>
    );
}

FormWorkShift.displayName = "/src/pages/subpages/FormWorkShift.jsx";

export default FormWorkShift;
