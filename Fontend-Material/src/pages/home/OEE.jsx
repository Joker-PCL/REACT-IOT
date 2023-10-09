import React, { useState, useEffect } from 'react'
import { TblOEE } from '@/data';

import { useGetData } from '@/data'
import { API_URL } from "@/configs";
import { Loading } from "@/widgets/layout";
import { alert_failed } from '@/widgets/alert';

export function OEE() {
    const [dataObj, setDataObj] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    async function getData() {
        await useGetData(API_URL.URL_OEE).then(res => {
            setDataObj(res);
            setIsLoading(false);
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
                <Loading />
            ) : (
                <>
                    <TblOEE data={dataObj} />
                </>
            )}
        </>
    );
}

export default OEE