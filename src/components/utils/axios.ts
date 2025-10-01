import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL

// Create axios instance with base URL
const instance = axios.create({
    baseURL: API_URL, // Update this with your backend URL
});

export default instance;
