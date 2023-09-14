import React, { useState, useRef, useEffect } from 'react'
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { Button } from "@material-tailwind/react";

const formatterProgress = {
    min: 0,
    max: 100,
    color: ["red", "orange", "green"],
    legendColor: "#fff",
    legendAlign: "center",
}

const columns = [
    { title: "วันที่", field: "date", width: 100, headerWordWrap: true, },
    { title: "เครื่องจักร", field: "machineName", width: 150, headerWordWrap: true, headerFilter: "input" },
    { title: "เวลาเริ่ม", field: "sTime", width: 100, headerWordWrap: true, },
    { title: "เวลาสิ้นสุด", field: "eTime", width: 100, headerWordWrap: true, },
    { title: "เวลาที่ใช้ไป", field: "periodTime", width: 100, headerWordWrap: true, },
    { title: "ผลผลิตที่ได้", field: "total", width: 100, headerWordWrap: true, },
    { title: "ปริมาณของดี", field: "totalQty", width: 100, headerWordWrap: true, },
    { title: "ปริมาณของเสีย", field: "totalNC", width: 100, headerWordWrap: true, },
    { title: "ผลผลิต/นาที", field: "average", width: 100, headerWordWrap: true, },
    { title: "Speed ตามแผน", field: "speedDF", width: 100, headerWordWrap: true, },
    { title: "เวลาตามแผน(ชม.)", field: "workTimeDF", width: 100, headerWordWrap: true, },

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

    { title: "Q", field: "qtyPCT", hozAlign: "right", headerWordWrap: true, width: 65 },
    {
        title: "Quality", field: "qtyPCT",
        width: 150, formatter: "progress", formatterParams: formatterProgress
    },
    { title: "O", field: "OEE", hozAlign: "right", headerWordWrap: true, width: 65 },
    {
        title: "OEE", field: "OEE",
        width: 150, formatter: "progress", formatterParams: formatterProgress
    },
];

const tableOptions = {
    layout: "fitColumns",
    pagination: "local",
    paginationSize: 6,
    paginationSizeSelector: [3, 6, 8, 10],
    paginationCounter: "rows",
    groupBy: "machineName",
    initialSort: [
        { column: "date", dir: "asc" },
    ],
    printAsHtml: true,
    rowFormatter: function (row) {
        row.getElement().classList.add("table-primary"); //mark rows with age greater than or equal to 18 as successful;
    },
};

export function TblOEE({ data }) {
    const tableRef = useRef(null);
    const [table, setTable] = useState(null)

    useEffect(() => {
        if (tableRef.current) {
            setTable(new Tabulator(tableRef.current,
                {
                    debugInvalidOptions: false,
                    data,
                    columns,
                    printAsHtml: true,
                    printHeader: "<h1>Example Table Header<h1>",
                    printFooter: "<h2>Example Table Footer<h2>",
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
            <div className='mt-8 mb-2 flex justify-start gap-2'>
                <Button color="indigo" className="" onClick={handleDownLoadCSV}>ดาวน์โหลด CSV</Button>
                <Button color="blue-gray" className="px-12" onClick={handlePrint}>PRINT</Button>
            </div>
            <div>
                <div ref={tableRef}></div>
            </div>
        </>
    );
}

export default TblOEE