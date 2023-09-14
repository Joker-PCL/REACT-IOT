import React, { useState, useEffect } from 'react'
import { TblOEE } from '@/data';

import { useGetData } from '@/data'
import { API_URL } from "@/configs";

export function OEEa() {
    const [dataObj, setDataObj] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    async function getData() {
        await useGetData(API_URL.URL_OEE).then(res => {
            setDataObj(res);
            setIsLoading(false);
            console.log(res)
        }).catch((error) => {
            console.error("Error fetching dataMC:", error);
            alert_failed();
        });
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <>
            {isLoading ? (
                <h1>Loading...</h1>
            ) : (
                <>
                    <TblOEE data={dataObj} />
                </>
            )}
        </>
    );
}

export default OEEa