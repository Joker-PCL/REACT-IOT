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

import { FormWorkShift } from "@/widgets/form";
import { WorkShiftTable } from "@/widgets/layout";
import { convertToDateTimeLocal } from "@/configs";

export function WorkShift({ open, setOpen, dataObj }) {
    const modalOpen = () => setOpen(!open);
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const [formWorkShiftOpen, setFormWorkShiftOpen] = useState(false);

    useEffect(() => {
        if (open) {
            setFormData(dataObj);
            setIsLoading(false);
        } else {
            setFormData({}); // ตั้งค่าเป็นข้อมูลว่างเมื่อปิด Modal
        }
    }, [open, dataObj]);

    const handleFormWorkShiftOpen = () => {
        setFormWorkShiftOpen(!formWorkShiftOpen);
    };

    return (
        <>
            <Dialog open={open} size="xxl">
                <DialogHeader className="flex justify-center underline text-gray-600">ช่วงเวลาการทำงาน</DialogHeader>
                <>
                    {isLoading ? (
                        <h1>Loading...</h1>
                    ) : (
                        <DialogBody divider className="grid overflow-y-scroll">
                            <div className="mt-8 w-[100%] md:px-20 xl:px-20">
                                <div className="grid gap-y-8 gap-x-8 md:grid-cols-1 xl:grid-cols-2">
                                    <div className="work-time grid gap-y-10 gap-x-6 md:grid-cols-2 xl:col-span-2 xl:grid-cols-2 xl:col-span-2">
                                        <Input
                                            variant="static"
                                            label="เลขที่ผลิต"
                                            id="Lot"
                                            name="Lot"
                                            defaultValue={formData.Lot}
                                            type="text"
                                            readOnly
                                        />
                                        <Input
                                            variant="static"
                                            label="รายการผลิต"
                                            id="product"
                                            name="product"
                                            defaultValue={formData.product}
                                            type="text"
                                            readOnly
                                        />
                                    </div>
                                    <div className="work-time grid gap-y-10 gap-x-6 md:grid-cols-2 xl:col-span-2 xl:grid-cols-2 xl:col-span-2">
                                        <Input
                                            variant="static"
                                            label="วันที่เริ่มผลิต"
                                            id="start_production"
                                            name="start_production"
                                            defaultValue={convertToDateTimeLocal(dataObj.start_production)}
                                            type="datetime-local"
                                            readOnly
                                        />
                                        <Input
                                            variant="static"
                                            label="จบการผลิต"
                                            id="end_production"
                                            name="end_production"
                                            defaultValue={convertToDateTimeLocal(dataObj.end_production)}
                                            type="datetime-local"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <FormWorkShift open={formWorkShiftOpen} setOpen={setFormWorkShiftOpen} dataObj={dataObj} />
                            </div>
                            <WorkShiftTable setOpen={modalOpen} dataObj={dataObj} />
                        </DialogBody>
                    )}
                </>
            </Dialog>

        </>
    );
}

WorkShift.displayName = "/src/pages/subpages/WorkShift.jsx";

export default WorkShift;
