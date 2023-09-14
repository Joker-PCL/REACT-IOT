const host = "http://192.168.10.7:3000";
export const API_URL = {
    CONTENT_TYPE: { 'Content-Type': 'application/json' },
    URL_MACHINE: `${host}/api/dataListsMC`,
    URL_SETTING: `${host}/api/dashboard`,
    URL_DASHBOARD: `${host}/api/dashboard`,
    URL_PRODUCT: `${host}/api/productLists`,
    URL_DETAIL: `${host}/api/machineDetail`,
    URL_OEE: `${host}/api/oee`,
    URL_CREATE_PD: `${host}/api/createPD`,
    URL_DELETE_PD: `${host}/api/deletePD`,
    URL_UPDATE_PD: `${host}/api/updatePD`,
    URL_CREATE_MC: `${host}/api/createMC`,
    URL_DELETE_MC: `${host}/api/deleteMC`,
    URL_UPDATE_MC: `${host}/api/updateMC`,
    // URL_AEMACHINE: 
}

export default API_URL;