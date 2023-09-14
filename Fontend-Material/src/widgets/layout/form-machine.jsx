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
    e.preventDefault();
    // แก้ไขข้อมูลเครื่องจักร
    if (dataObj.machineID) {
      (async () =>  {
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
      (async () =>  {
        await usePostData(API_URL.URL_CREATE_MC, formData).then(() => {
          modalOpen();
          alert_success();
        }).catch((error) => {
          console.error("Error fetching dataMC:", error);
          alert_failed();
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
  }

  return (
    <>
      <Dialog open={open} size="xxl">
        <DialogHeader className="flex justify-center underline text-gray-600">เพิ่ม/แก้ไขรายการเครื่องจักร</DialogHeader>
        <DialogBody divider className="main-detail h-[80vh] overflow-y-scroll">
          <form className="mt-8 mb-5" onSubmit={handleSubmit}>
            <div className="form-add-machine mb-20">
              <div>
                <Input
                  label="ไอดีเครื่องจักร"
                  id="machineID"
                  name="machineID"
                  defaultValue={dataObj.machineID || ""}
                  type={"number"}
                  onChange={handleChange}
                  readOnly={!!dataObj.machineID}
                  required
                  error={dataObj.machineID ? true : false}
                />
                <Typography
                  variant="small"
                  color="red"
                  className="mt-2 flex items-center gap-1 font-normal"
                >
                  {errMsg && "ไอดีเครื่องจักรนี้มีอยู่แล้ว"}
                </Typography>
              </div>
              <Input
                label="ชื่อเครื่องจักร"
                id="machineName"
                name="machineName"
                defaultValue={formData.machineName}
                type="text"
                onChange={handleChange}
                required
              />
              <Input
                label="Speed เครื่อง"
                id="speedDF"
                name="speedDF"
                defaultValue={formData.speedDF}
                type="number"
                onChange={handleChange}
                required
              />
              <Input
                label="หน่วยชิ้นงาน"
                id="unit"
                name="unit"
                defaultValue={formData.unit}
                type="text"
                onChange={handleChange}
                required
              />
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
              <Switch
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
            </div>
            <>
              <Typography className="flex justify-end mb-2 gap-5">
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
          </form>
        </DialogBody>
      </Dialog>
    </>
  );
}

FormMachine.displayName = "/src/widgets/layout/form-machine.jsx";

export default FormMachine;
