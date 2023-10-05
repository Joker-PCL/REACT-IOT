const host = import.meta.env.VITE_HOSTNAME;
export const API_URL = {
    CONTENT_TYPE: { 'Content-Type': 'application/json' },
    URL_MACHINE: `${host}/dashboard/dataListsMC`,
    URL_SETTING: `${host}/dashboard`,
    URL_DASHBOARD: `${host}/dashboard`,
    URL_DETAIL: `${host}/dashboard/machineDetail`,
    URL_OEE: `${host}/oee`,
    URL_PRODUCT: `${host}/productCRUD`,
    URL_MACHINE_PD: `${host}/productCRUD/machineLists`,
    URL_CREATE_PD: `${host}/productCRUD/create`,
    URL_DELETE_PD: `${host}/productCRUD/delete`,
    URL_UPDATE_PD: `${host}/productCRUD/update`,
    URL_WS: `${host}/workShift`,
    URL_CREATE_WS: `${host}/workShift/create`,
    URL_DELETE_WS: `${host}/workShift/delete`,
    URL_UPDATE_WS: `${host}/workShift/update`,
    URL_MC: `${host}/machineCRUD`,
    URL_CREATE_MC: `${host}/machineCRUD/create`,
    URL_DELETE_MC: `${host}/machineCRUD/delete`,
    URL_UPDATE_MC: `${host}/machineCRUD/update`,
}

export default API_URL;