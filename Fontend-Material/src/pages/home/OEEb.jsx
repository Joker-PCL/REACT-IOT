import React from "react"
import { TblFunc } from "@/data"

export function OEEb() {
  const dataSet = [
    {
      "id": "1",
      "date": "2011/04/25",
      "machine": "Blister3",
      "sTime": "8:00",
      "eTime": "10:00",
      "timePassed": "4:00",
      "total": "6000",
      "totalQTY": "5880",
      "totalNC": "80",
      "average": "25",
      "setSpeed": "25",
      "setWorkTime": "8",
      "availability_PCT": "80%",
      "speed_PCT": "80%",
      "qty_PCT": "80%",
      "oee": "80%",
    },
    {
      "id": "1",
      "date": "2011/04/25",
      "machine": "Blister3",
      "sTime": "8:00",
      "eTime": "10:00",
      "timePassed": "4:00",
      "total": "6000",
      "totalQTY": "5880",
      "totalNC": "80",
      "average": "25",
      "setSpeed": "25",
      "setWorkTime": "8",
      "availability_PCT": "80%",
      "speed_PCT": "80%",
      "qty_PCT": "80%",
      "oee": "80%",
    },
  ]

  return (
    <div className="mt-12">
      <TblFunc data={dataSet} />
    </div>
  )
}