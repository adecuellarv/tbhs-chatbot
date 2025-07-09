import axios from "axios";
import { FIREBASE_URL_GET, FIREBASE_URL_POST } from "./common"

export const getHistory = async (userId) => {
  try {
    if(!userId) return;

    const resp = await axios.get(`${FIREBASE_URL_GET}?userId=${userId}`);
    if(resp?.data) return resp?.data;
  } catch (error) {
    return;
  }
}

export const sendHistory = async (data) => {
  try {
    if(!data) return;

    const resp = await axios.post(FIREBASE_URL_POST, data);
    if(resp?.data) return resp?.data;
  } catch (error) {
    return;
  }
}