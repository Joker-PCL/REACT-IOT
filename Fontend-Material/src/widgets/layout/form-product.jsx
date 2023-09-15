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

export function FormProduct({ open, setOpen, dataObj }) {
  const modalOpen = () => setOpen(!open);
  const [formData, setFormData] = useState({});
  const [machineLists, setMachineLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function getMachineLists() {
    await useGetData(API_URL.URL_MACHINE).then(res => {
      setMachineLists(res);
      setIsLoading(false);
    }).catch((error) => {
      console.error("Error fetching dataMC:", error);
      alert_failed();
    });
  }

  useEffect(() => {
    if (open) {
      setFormData(dataObj);
      getMachineLists();
    } else {
      setFormData({}); // ตั้งค่าเป็นข้อมูลว่างเมื่อปิด Modal
    }
  }, [open, dataObj]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // แก้ไขข้อมูลเครื่องจักร
    if (dataObj.id) {
      (async () => {
        await usePutData(API_URL.URL_UPDATE_PD, formData).then(() => {
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
        await usePostData(API_URL.URL_CREATE_PD, formData).then(() => {
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
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  function convertToDateTimeLocal(isoDateTime) {
    const date = new Date(isoDateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const dateTimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;

    return dateTimeLocal;
  }

  return (
    <>
      <Dialog open={open} size="xxl">
        <DialogHeader className="flex justify-center underline text-gray-600">เพิ่ม/แก้ไขรายการผลิต</DialogHeader>
        <>
          {isLoading ? (
            <h1>Loading...</h1>
          ) : (
            <DialogBody divider className="flex justify-center h-[80vh] overflow-y-scroll">
              <form className="mt-8 mb-20 w-[100%] xl:mx-20" onSubmit={handleSubmit}>
                <div className="form-add-machine mb-10 grid gap-y-10 gap-x-6 md:grid-cols-1 xl:grid-cols-2">
                  <div>
                    <Input
                      label="ไอดีเครื่องจักร (เลือกโดยระบบ)"
                      id="machineID"
                      name="machineID"
                      defaultValue={formData.machineID || ""}
                      type={"text"}
                      readOnly
                      success
                    />
                  </div>
                  <Select
                    id="machineName"
                    name="machineName"
                    label="ชื่อเครื่องจักร"
                    value={formData.machineName}
                    disabled={dataObj.machineName ? true : false}
                    required
                    onChange={(value) => {
                      setFormData((prevData) => ({
                        ...prevData,
                        machineName: value,
                      }));

                      const selectedMachine = machineLists.find((item) => item.machineName === value);
                      if (selectedMachine) {
                        setFormData({ machineID: selectedMachine.machineID });
                      } else {
                        setFormData({ machineID: "" });
                      }
                    }}
                  >
                    {
                      machineLists.map((list) => {
                        return (
                          <Option key={list.machineID} value={list.machineName}>{list.machineName}</Option>
                        )
                      })
                    }
                  </Select>
                  <Input
                    label="เลขที่ผลิต"
                    id="Lot"
                    name="Lot"
                    defaultValue={formData.Lot}
                    type="text"
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="รายการผลิต"
                    id="product"
                    name="product"
                    defaultValue={formData.product}
                    type="text"
                    onChange={handleChange}
                  />
                  <Input
                    label="ตัวคูณชิ้นงาน"
                    id="multiplier"
                    name="multiplier"
                    defaultValue={dataObj.multiplier || 1}
                    type="number"
                    onChange={handleChange}
                  />
                  <Input
                    label="ขนาดผลิต"
                    id="batchSize"
                    name="batchSize"
                    defaultValue={formData.batchSize}
                    type="number"
                    onChange={handleChange}
                  />
                  <Input
                    label="วันที่เริ่มผลิต"
                    id="start_production"
                    name="start_production"
                    defaultValue={formData.start_production ? convertToDateTimeLocal(formData.start_production) : ''}
                    type="datetime-local"
                    onChange={handleChange}
                  />
                  <Input
                    label="วันที่จบการผลิต"
                    id="end_production"
                    name="end_production"
                    defaultValue={formData.end_production ? convertToDateTimeLocal(formData.end_production) : ''}
                    type="datetime-local"
                    onChange={handleChange}
                  />
                  <Textarea
                    label="รายละเอียดเพิ่มเติม"
                    id="note"
                    name="note"
                    defaultValue={formData.note}
                    onChange={handleChange}
                  />
                </div>
                <>
                  <Typography className="flex justify-start mb-2 gap-5">
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
                <br />
                <br />
                <br />
                <br />
              </form>
            </DialogBody>
          )}
        </>
      </Dialog>
    </>
  );
}

FormProduct.displayName = "/src/widgets/layout/form-product.jsx";

export default FormProduct;
