import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // If you are using cookies/session
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;
