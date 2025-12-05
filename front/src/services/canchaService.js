import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/canchas";

export const getCanchas = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching canchas:", error);
        throw error;
    }
};

export const getTurnosDeCancha = async (id) => {
    try {
        const res = await axios.get(`${API_URL}/${id}/turnos`);
        return res.data;
    } catch (error) {
        console.error("Error fetching turnos for cancha:", error);
        throw error;
    }
};

export const createCancha = async (payload) => {
    try {
        const { data } = await axios.post(API_URL, payload);
        return data;
    } catch (error) {
        console.error("Error creating cancha:", error);
        throw error;
    }
};

export const updateCancha = async (id, payload) => {
    try {
        const { data } = await axios.put(`${API_URL}/${id}`, payload);
        return data;
    } catch (error) {
        console.error("Error updating cancha:", error);
        throw error;
    }
};

export const deleteCancha = async (id) => {
    try {
        const { data } = await axios.delete(`${API_URL}/${id}`);
        return data;
    } catch (error) {
        console.error("Error deleting cancha:", error);
        throw error;
    }
};