import React, { useState, useRef, useEffect } from 'react'
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { Button, Input } from "@material-tailwind/react";
import {
    dateFormat, timeDifFormat, timeToMinutes, multiplyTime,
    SumOfDuration, sumStringNumber, avgStringDecimal, avgStringPercentage
} from "@/configs";

const formatterProgress = {
    min: 0,
    max: 100,
    color: ["red", "orange", "green"],
    legendColor: "#fff",
    legendAlign: "center",
}

const tableOptions = {
    layout: "fitColumns",
    pagination: "local",
    paginationSize: 25,
    paginationSizeSelector: [25, 50, 100, 150, 300, 500],
    paginationCounter: "rows",
    groupBy: "machineName",
    dataTree: true,
    dataTreeStartExpanded: true,
    // initialSort: [
    //     { column: "date", dir: "asc" },
    // ],
    printAsHtml: true,
    rowFormatter: function (row) {
        row.getElement().classList.add("table-primary"); //mark rows with age greater than or equal to 18 as successful;
    },
}

const columns = [
    { title: "เริ่มวันที่", field: "sDate", width: 100, headerWordWrap: true, },
    { title: "ถึงวันที่", field: "eDate", width: 100, headerWordWrap: true, },
    { title: "เครื่องจักร", field: "machineName", width: 150, headerWordWrap: true, headerFilter: "input" },
    { title: "เลขที่ผลิต", field: "lotnumber", width: 75, headerWordWrap: true },
    { title: "รายชื่อยา", field: "product", width: 200, headerWordWrap: true },
    { title: "รายการกะ", field: "workshift", width: 150, headerWordWrap: true },
    { title: "เวลาเริ่ม", field: "sTime", width: 100, headerWordWrap: true, },
    { title: "เวลาสิ้นสุด", field: "eTime", width: 100, headerWordWrap: true, },
    { title: "เวลาตามแผน", field: "plannedTime", width: 100, headerWordWrap: true, },
    { title: "เวลาที่ใช้ไป", field: "periodTime", width: 100, headerWordWrap: true, },
    { title: "ผลผลิตที่ได้", field: "total", width: 100, headerWordWrap: true, },
    { title: "ปริมาณของดี", field: "totalQty", width: 100, headerWordWrap: true, },
    { title: "ปริมาณของเสีย", field: "totalNC", width: 100, headerWordWrap: true, },
    { title: "ผลผลิต/นาที", field: "average", width: 100, headerWordWrap: true, },
    { title: "Speed ตามแผน", field: "setSpeed", width: 100, headerWordWrap: true, },

    // Progress
    { title: "A", field: "availability", hozAlign: "right", width: 65 },
    {
        title: "Availability", field: "availability",
        width: 150, formatter: "progress", formatterParams: formatterProgress
    },
    { title: "P", field: "performance", hozAlign: "right", width: 65 },
    {
        title: "Performance", field: "performance",
        width: 150, formatter: "progress", formatterParams: formatterProgress
    },

    { title: "Q", field: "quality", hozAlign: "right", headerWordWrap: true, width: 65 },
    {
        title: "Quality", field: "quality",
        width: 150, formatter: "progress", formatterParams: formatterProgress
    },
    { title: "O", field: "OEE", hozAlign: "right", headerWordWrap: true, width: 65 },
    {
        title: "OEE", field: "OEE",
        width: 150, formatter: "progress", formatterParams: formatterProgress
    },
]

const dataTable = (dataObj) => {
    // data children format
    const create_children = (arr) => {
        const plannedTime = multiplyTime(arr.plannedTime, arr.work_days);
        const availability = Number(arr.online_min / timeToMinutes(plannedTime) * 100).toFixed(2);
        const performance = (Number(arr.average) / (Number(arr._setSpeed) * Number(arr._multiplier)) * 100).toFixed(2);
        const quality = (Number(arr.totalQty) / Number(arr.total) * 100).toFixed(2);

        return {
            workshift: arr.workshift,
            sTime: arr.sTime,
            eTime: arr.eTime,
            plannedTime: plannedTime,
            periodTime: arr.online_min > 0 ? timeDifFormat(Number(arr.online_min) * 1000 * 60) : "",   // minutes to time format hh:mm
            total: arr.total > 0 ? Number(arr.total).toLocaleString() : null,
            totalQty: arr.totalQty > 0 ? Number(arr.totalQty).toLocaleString() : null,
            totalNC: arr.totalNC > 0 ? Number(arr.totalNC).toLocaleString() : null,
            average: arr.average > 0 ? Number(arr.average).toFixed(2) : null,
            availability: availability > 0 ? availability + '%' : "",
            performance: performance > 0 ? performance + '%' : "",
            quality: quality > 0 ? quality + '%' : "",
            OEE: availability > 0 && performance > 0 && quality > 0 ?
                ((availability / 100 * performance / 100 * quality / 100) * 100).toFixed(2) + "%" : ""
        }
    }

    const results = dataObj.map((d) => {
        const ws = d.workshift;
        const dataRow = {
            sDate: new Date(d.start_work).toLocaleString('en-GB', dateFormat).split(',')[0],
            eDate: new Date(d.end_work).toLocaleString('en-GB', dateFormat).split(',')[0],
            machineName: d.machineName,
            lotnumber: d.Lot,
            product: d.product,
            workshift: "รวมทุกกะ",
            sTime: d.sShift,
            eTime: d.eShift,
            plannedTime: multiplyTime(d.total_work_time, d.work_days),
            periodTime: "timeDuration_function",
            total: "8,500",
            totalQty: "8,420",
            totalNC: "80",
            average: "12.35",
            setSpeed: `${d.setSpeed} * ${d.multiplier}`,
            availability: "63.80%",
            performance: "52.17%",
            quality: "99.06%",
            OEE: "32.97%",
            _children: [
                create_children({
                    workshift: "กะเช้า",
                    _setSpeed: d.setSpeed,
                    _multiplier: d.multiplier,
                    online_min: ws.online_day_1,
                    sTime: d.sw_day_1,
                    eTime: d.ew_day_1,
                    plannedTime: d.tw_day_1,
                    work_days: d.work_days,
                    total: ws.total_day_1,
                    totalQty: ws.qty_day_1,
                    totalNC: ws.nc_day_1,
                    average: ws.avg_day_1,
                }),
                create_children({
                    workshift: "กะเช้า(หลังพัก)",
                    _setSpeed: d.setSpeed,
                    _multiplier: d.multiplier,
                    online_min: ws.online_day_2,
                    sTime: d.sw_day_2,
                    eTime: d.ew_day_2,
                    plannedTime: d.tw_day_2,
                    work_days: d.work_days,
                    total: ws.total_day_2,
                    totalQty: ws.qty_day_2,
                    totalNC: ws.nc_day_2,
                    average: ws.avg_day_2,
                }),
                create_children({
                    workshift: "โอทีกะเช้า",
                    _setSpeed: d.setSpeed,
                    _multiplier: d.multiplier,
                    online_min: ws.online_day_ot,
                    sTime: d.sw_day_ot,
                    eTime: d.ew_day_ot,
                    plannedTime: d.tw_day_ot,
                    work_days: d.work_days,
                    total: ws.total_day_ot,
                    totalQty: ws.qty_day_ot,
                    totalNC: ws.nc_day_ot,
                    average: ws.avg_day_ot,
                }),
                create_children({
                    workshift: "กะกลางคืน",
                    _setSpeed: d.setSpeed,
                    _multiplier: d.multiplier,
                    online_min: ws.online_night_1,
                    sTime: d.sw_night_1,
                    eTime: d.ew_night_1,
                    plannedTime: d.tw_night_1,
                    work_days: d.work_days,
                    total: ws.total_night_1,
                    totalQty: ws.qty_night_1,
                    totalNC: ws.nc_night_1,
                    average: ws.avg_night_1,
                }),
                create_children({
                    workshift: "กะกลางคืน(หลังพัก)",
                    _setSpeed: d.setSpeed,
                    _multiplier: d.multiplier,
                    online_min: ws.online_night_2,
                    sTime: d.sw_night_2,
                    eTime: d.ew_night_2,
                    plannedTime: d.tw_night_2,
                    work_days: d.work_days,
                    total: ws.total_night_2,
                    totalQty: ws.qty_night_2,
                    totalNC: ws.nc_night_2,
                    average: ws.avg_night_2,
                }),
                create_children({
                    workshift: "โอทีกะกลางคืน",
                    _setSpeed: d.setSpeed,
                    _multiplier: d.multiplier,
                    online_min: ws.online_night_ot,
                    sTime: d.sw_night_ot,
                    eTime: d.ew_night_ot,
                    plannedTime: d.tw_night_ot,
                    work_days: d.work_days,
                    total: ws.total_night_ot,
                    totalQty: ws.qty_night_ot,
                    totalNC: ws.nc_night_ot,
                    average: ws.avg_night_ot,
                }),
            ]
        }

        const firstRow = {};
        dataRow._children.forEach(child => {
            Object.keys(child).forEach(key => {
                if (child[key]) {
                    if (!firstRow[key]) {
                        firstRow[key] = [];
                    }
                    firstRow[key].push(child[key]);
                }
            });
        });

        console.log(firstRow)

        return {
            ...dataRow,
            periodTime: SumOfDuration(firstRow.periodTime),
            total: sumStringNumber(firstRow.total).toLocaleString(),
            totalQty: sumStringNumber(firstRow.totalQty).toLocaleString(),
            totalNC: sumStringNumber(firstRow.totalNC).toLocaleString(),
            average: avgStringDecimal(firstRow.average),
            availability: avgStringPercentage(firstRow.availability),
            performance: avgStringPercentage(firstRow.performance),
            quality: avgStringPercentage(firstRow.quality),
            OEE: avgStringPercentage(firstRow.OEE)
        };
    });

    return results;
}

export function TblOEE({ data }) {
    const tableRef = useRef(null);
    const [table, setTable] = useState(null)

    useEffect(() => {
        const data_rows = dataTable(data);
        console.log(data_rows)
        if (tableRef.current) {
            setTable(new Tabulator(tableRef.current,
                {
                    debugInvalidOptions: false,
                    data: data_rows,
                    columns,
                    printAsHtml: true,
                    ...tableOptions,
                }
            ))
        }
    }, [data]);

    function handleDownLoadCSV() {
        const today = new Date().toLocaleString("en-GB").split(" ")[0]
        table.download("csv", `OEE-${today}.csv`);
    };

    function handlePrint() {
        table.print(false, true);
    };

    return (
        <>
            <div className='mt-8 mb-2 flex flex-wrap justify-between gap-2'>
                <div className='grid md:grid-cols-2 xl:grid-cols-2 gap-2'>
                    <Button color="indigo" className="" onClick={handleDownLoadCSV}>ดาวน์โหลด CSV</Button>
                    <Button color="blue-gray" className="px-12" onClick={handlePrint}>PRINT</Button>
                </div>
                <div className='grid md:grid-cols-2 xl:grid-cols-2 gap-2'>
                    <Input
                        label="เริ่มวันที่"
                        type='datetime-local'
                    />
                    <Input
                        label="ถึงวันที่"
                        type='datetime-local'
                    />
                </div>
            </div>
            <div>
                <div ref={tableRef}></div>
            </div>
        </>
    );
}

export default TblOEE