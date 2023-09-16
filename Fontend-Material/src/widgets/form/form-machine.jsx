import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  Typography,
  Input,
  Switch,
  Select,
  Option
} from "@material-tailwind/react";

import { API_URL } from "@/configs";
import { usePostData, usePutData } from '@/data'
import { alert_success, alert_failed } from "@/widgets/alert";

export function FormMachine({ open, setOpen, dataObj }) {
  const modalOpen = () => setOpen(!open);
  const [formData, setFormData] = useState({});

  const [errMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (open) {
      setFormData(dataObj);
    } else {
      setFormData({}); // ตั้งค่าเป็นข้อมูลว่างเมื่อปิด Modal
    }
  }, [open, dataObj]);

  const handleSubmit = (e) => {
    console.log(formData)
    e.preventDefault();
    // แก้ไขข้อมูลเครื่องจักร
    if (dataObj.machineID) {
      (async () => {
        await usePutData(API_URL.URL_UPDATE_MC, formData).then(() => {
          modalOpen();
          alert_success();
        }).catch((error) => {
          console.error("Error fetching dataMC:", error);
          alert_failed();
        });
      })();
    } // เพิ่มรายการเครื่องจักร
    else {
      (async () => {
        await usePostData(API_URL.URL_CREATE_MC, formData).then(() => {
          modalOpen();
          alert_success();
        }).catch((error) => {
          console.error("Error fetching dataMC:", error);
          if (error.response.status === 404) {
            setErrorMsg(error.response.data);
          }
        });
      })();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // อัปเดตค่า formData โดยใช้ชื่อและค่าที่เปลี่ยนแปลง
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrorMsg(false)
  }

  const handleSumTime = (e) => {
    const divEL = e.target.closest('.work-time');
    const sWork = divEL.querySelector('.sWork').value;
    const eWork = divEL.querySelector('.eWork').value;

    let sHours, sMinutes, eHours, eMinutes;
    sHours = Number(sWork.split(":")[0]);
    sMinutes = Number(sWork.split(":")[1]);
    eHours = Number(eWork.split(":")[0]);
    eMinutes = Number(eWork.split(":")[1]);

    const sTime = new Date();
    sTime.setHours(sHours);
    sTime.setMinutes(sMinutes);

    const eTime = new Date();
    eTime.setHours(eHours);
    eTime.setMinutes(eMinutes);

    const timeDifference = (eTime < sTime ? eTime.setDate(eTime.getDate() + 1) : eTime) - sTime;
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const timeDifFormat = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    console.log(timeDifFormat)
    const ptEl = divEL.querySelector('.pt').name;
    setFormData({ ...formData, [ptEl]: timeDifFormat });
  }

  return (
    <>
      <Dialog open={open} size="xxl">
        <DialogHeader className="flex justify-center underline text-gray-600">เพิ่ม/แก้ไขรายการเครื่องจักร</DialogHeader>
        <DialogBody divider className="h-[80vh] overflow-y-scroll">
          <form className="mt-8 mb-20 w-[100%] md:px-12 xl:px-20" onSubmit={handleSubmit}>
            <div className="form-add-machine mb-10 grid gap-y-10 gap-x-6 md:grid-cols-1 xl:grid-cols-2">
              <div className="work-time grid gap-y-10 gap-x-6 md:grid-cols-2 xl:col-span-2">
                <div>
                  <Input
                    label="ไอดีเครื่องจักร *"
                    id="machineID"
                    name="machineID"
                    defaultValue={dataObj.machineID || ""}
                    type={"number"}
                    onChange={handleChange}
                    readOnly={!!dataObj.machineID}
                    required
                    success={dataObj.machineID ? true : false}
                    error={errMsg ? true : false}
                  />
                  <Typography
                    variant="small"
                    color="red"
                    className="mt-2 flex items-center gap-1 font-normal"
                  >
                    {errMsg}
                  </Typography>
                </div>
                <Input
                  label="ชื่อเครื่องจักร *"
                  id="machineName"
                  name="machineName"
                  defaultValue={formData.machineName}
                  type="text"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="work-time grid gap-y-10 gap-x-6 md:grid-cols-2 xl:col-span-2">
                <Input
                  label="ชั่วโมงการทำงาน *"
                  id="workTimeDF"
                  name="workTimeDF"
                  defaultValue={formData.workTimeDF}
                  type="number"
                  onChange={handleChange}
                  required
                />
                <Input
                  label="ความเร็วเครื่องโดยเฉลี่ย *"
                  id="speedDF"
                  name="speedDF"
                  defaultValue={formData.speedDF}
                  type="number"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="work-time grid gap-y-10 gap-x-6 md:grid-cols-2 xl:col-span-2">
                <Input
                  label="หน่วยชิ้นงาน *"
                  id="unit"
                  name="unit"
                  defaultValue={formData.unit}
                  type="text"
                  onChange={handleChange}
                  required
                />
                <Select
                  label="ชนิด Reject"
                  id="RejectType"
                  name="RejectType"
                  animate={{
                    mount: { y: 0 },
                    unmount: { y: 25 },
                  }}
                  value={formData.RejectType || "NC"} // กำหนดค่าเริ่มต้นที่เลือก
                  onChange={(value) => {
                    setFormData((prevData) => ({
                      ...prevData,
                      RejectType: value,
                    }));
                  }}
                  required
                >
                  <Option value="NO">NO</Option>
                  <Option value="NC">NC</Option>
                </Select>
              </div>
              <div className="work-time grid gap-y-10 gap-x-6 md:grid-cols-2 xl:col-span-2">
                <Input
                  label="ไลน์ Token"
                  id="LineToken"
                  name="LineToken"
                  defaultValue={formData.LineToken}
                  type="text"
                  onChange={handleChange}
                  required={formData.Alert == "ON" ? true : false}
                />

                <Input
                  label="ระยะเวลาก่อนการแจ้งเตือน(นาที)"
                  id="AlertTime"
                  name="AlertTime"
                  defaultValue={dataObj.AlertTime || 15}
                  type="number"
                  onChange={handleChange}
                />
              </div>
              <Switch
                className="xl:col-span-2"
                id="Alert"
                name="Alert"
                label="เปิดแจ้งเตือนผ่านไลน์กลุ่มตามเวลาที่กำหนด"
                checked={formData.Alert === "ON" ? true : false}
                onChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    Alert: e.target.checked ? "ON" : "OFF",
                  }));
                }}
                className="h-full w-full checked:bg-[#2ec946]"
                containerProps={{
                  className: "w-11 h-6",
                }}
                circleProps={{
                  className: "before:hidden left-0.5 border-none",
                }}
                ripple={true}
              />

              <div className="flex justify-center xl:col-span-2 text-[24px] font-bold underline">ช่วงเวลาการทำงาน(กะเช้า)</div>
              <div className="work-time grid gap-y-10 gap-x-6 md:grid-cols-3 xl:col-span-2 xl:grid-cols-3 xl:col-span-2">
                <Input
                  label="กะเช้าเริ่มเวลา *"
                  id="sWork1"
                  name="sWork1"
                  className="sWork"
                  defaultValue={formData.sWork1}
                  type="time"
                  onChange={(e) => { handleChange(e); handleSumTime(e); }}
                  required
                />
                <Input
                  label="สิ้นสุดกะเช้าเวลา *"
                  id="eWork1"
                  name="eWork1"
                  className="eWork"
                  defaultValue={formData.eWork1}
                  type="time"
                  onChange={(e) => { handleChange(e); handleSumTime(e); }}
                  required
                />
                <Input
                  label="รวมเวลากะเช้า"
                  id="pt1"
                  name="pt1"
                  className="pt"
                  defaultValue={formData.pt1}
                  type="time"
                  onChange={handleChange}
                  success
                  readOnly
                />
              </div>
              <div className="work-time grid gap-y-10 gap-x-6 md:grid-cols-3 xl:col-span-2 xl:grid-cols-3 xl:col-span-2">
                <Input
                  label="กะบ่ายเริ่มเวลา *"
                  id="sWork2"
                  name="sWork2"
                  className="sWork"
                  defaultValue={formData.sWork2}
                  type="time"
                  onChange={(e) => { handleChange(e); handleSumTime(e); }}
                  required
                />
                <Input
                  label="สิ้นสุดกะบ่ายเวลา *"
                  id="eWork2"
                  name="eWork2"
                  className="eWork"
                  defaultValue={formData.eWork2}
                  type="time"
                  onChange={(e) => { handleChange(e); handleSumTime(e); }}
                  required
                />
                <Input
                  label="รวมเวลากะบ่าย"
                  id="pt2"
                  name="pt2"
                  className="pt"
                  defaultValue={formData.pt2}
                  type="time"
                  onChange={handleChange}
                  success
                  readOnly
                />
              </div>

              <div className="flex justify-center xl:col-span-2 text-[24px] font-bold underline">ช่วงเวลาการทำงาน(กะกลางคืน)</div>
              <div className="work-time grid gap-y-10 gap-x-6 md:grid-cols-3 xl:col-span-2 xl:grid-cols-3 xl:col-span-2">
                <Input
                  label="กะกลางคืนเริ่ม *"
                  id="sWork3"
                  name="sWork3"
                  className="sWork"
                  defaultValue={formData.sWork3}
                  type="time"
                  onChange={(e) => { handleChange(e); handleSumTime(e); }}
                  required
                />
                <Input
                  label="สิ้นสุดกะกลางคืน *"
                  id="eWork3"
                  name="eWork3"
                  className="eWork"
                  defaultValue={formData.eWork3}
                  type="time"
                  onChange={(e) => { handleChange(e); handleSumTime(e); }}
                  required
                />
                <Input
                  label="รวมเวลากะกลางคืน"
                  id="pt3"
                  name="pt3"
                  className="pt"
                  defaultValue={formData.pt3}
                  type="time"
                  onChange={handleChange}
                  success
                  readOnly
                />
              </div>
              <div className="work-time grid gap-y-10 gap-x-6 md:grid-cols-3 xl:col-span-2 xl:grid-cols-3 xl:col-span-2">
                <Input
                  label="กะกลางคืนเริ่มเวลา(หลังพัก) *"
                  id="sWork4"
                  name="sWork4"
                  className="sWork"
                  defaultValue={formData.sWork4}
                  type="time"
                  onChange={(e) => { handleChange(e); handleSumTime(e); }}
                  required
                />
                <Input
                  label="สิ้นสุดกะกลางคืน(หลังพัก) *"
                  id="eWork4"
                  name="eWork4"
                  className="eWork"
                  defaultValue={formData.eWork4}
                  type="time"
                  onChange={(e) => { handleChange(e); handleSumTime(e); }}
                  required
                />
                <Input
                  label="รวมเวลากะกลางคืน(หลังพัก)"
                  id="pt4"
                  name="pt4"
                  className="pt"
                  defaultValue={formData.pt4}
                  type="time"
                  onChange={handleChange}
                  success
                  readOnly
                />
              </div>
              <>
                <Typography className="flex justify-start mb-2 gap-5 xl:col-span-2">
                  <Button color="blue" className="py-2" type="submit">
                    <span><i className="fa-regular fa-floppy-disk fa-2x" /></span>
                    <span>บันทึก</span>
                  </Button>
                  <Button color="red" className="py-2" onClick={modalOpen}>
                    <span><i className="fa-solid fa-xmark fa-2x" /></span>
                    <span>Cancel</span>
                  </Button>
                </Typography>
              </>
            </div>
            <br />
            <br />
          </form>
        </DialogBody>
      </Dialog>
    </>
  );
}

FormMachine.displayName = "/src/widgets/layout/form-machine.jsx";

export default FormMachine;
