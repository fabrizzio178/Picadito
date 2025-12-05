import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

export const login = async (mail, password) => {
    const res = await axios.post(`${API_URL}/login`, {mail, password});
    return res.data;
}

export const register = async (datos) => {
    const res = await axios.post(`${API_URL}/registrar`, datos);
    return res.data;

}