import React, { useEffect, useRef } from "react"
import $ from 'jquery'
import 'datatables.net-responsive-dt';

export function TblFunc(props) {
    console.log(props)
    const tableRef = useRef()

    useEffect(() => {
        const table = $(tableRef.current).DataTable(
            {
                data: props.data,
                columns: [
                    { data: 'date' },
                    { data: 'machine' },
                    { data: 'sTime' },
                    { data: 'eTime' },
                    { data: 'timePassed' },
                    {
                        className: 'persentag',
                        data: 'total',
                    },
                    { data: 'totalQTY' },
                    { data: 'totalNC' },
                    { data: 'average' },
                    { data: 'setSpeed' },
                    { data: 'setWorkTime' },
                    { data: 'availability_PCT' },
                    { data: 'speed_PCT' },
                    { data: 'qty_PCT' },
                    { data: 'oee' },
                ],
                scrollX: true,
                // กำหนดเมนูแสดงจำนวนแถว
                lengthMenu: [
                    [5, 10, 15, 20, 50, 100, -1],
                    ["5", "10", "15", "20", "50", "100", "ทั้งหมด"],
                ],

                // order: [[0, 'desc']],
                ordering: true,
                iDisplayLength: 10,
                responsive: false,

                //ภาษาไทย
                language: {
                    sProcessing: "กำลังดำเนินการ...",
                    sLengthMenu: "แสดง _MENU_ รายการ",
                    sZeroRecords: "ไม่พบข้อมูล",
                    sInfo: "แสดง _START_ ถึง _END_ จาก _TOTAL_ รายการ",
                    sInfoEmpty: "แสดง 0 ถึง 0 จาก 0 รายการ",
                    sInfoFiltered: "(กรองข้อมูลจาก _MAX_ รายการ)",
                    sInfoPostFix: "",
                    sSearch: "ค้นหา:",
                    sUrl: "",
                    oPaginate: {
                        sFirst: "หน้าแรก",
                        sPrevious: "ก่อนหน้า",
                        sNext: "ถัดไป",
                        sLast: "หน้าสุดท้าย",
                    },
                },
            }
        );

        return function () {
            table.destroy()
        }
    }, [props])

    return (
        <table className="display nowrap" width="100%" ref={tableRef}>
            <thead className="">
                <tr>
                    <th>วันที่</th>
                    <th>เครื่องจักร</th>
                    <th>เวลาเริ่ม</th>
                    <th>เวลาสิ้นสุด</th>
                    <th>เวลาที่ใช้ไป</th>
                    <th>ผลผลิตที่ได้</th>
                    <th>ปริมาณของดี</th>
                    <th>ปริมาณของเสีย</th>
                    <th>ผลผลิต/นาที</th>
                    <th>Speed ตามแผน</th>
                    <th>เวลาทำงานตามแผน</th>
                    <th>Availability</th>
                    <th>Performance</th>
                    <th>Quality</th>
                    <th>OEE</th>
                </tr>
            </thead>
        </table>
    )
}