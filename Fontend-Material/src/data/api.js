import axios from 'axios';
import { API_URL } from "@/configs";

export const useGetData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const usePostData = async (url, dataObj) => {
  try {
    const response = await axios.post(url, dataObj)
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const usePutData = async (url, dataObj) => {
  try {
    const response = await axios.put(url, dataObj)
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const useDeleteData = async (url, dataObj) => {
  try {
    const response = await axios.delete(url, { data: dataObj, headers: API_URL.CONTENT_TYPE })
    return response.data;
  } catch (error) {
    throw error;
  }
}
