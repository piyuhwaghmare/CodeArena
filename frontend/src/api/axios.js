import axios from 'axios';

const api = axios.create({
    baseURL: 'http://15.206.170.214:3000',    //URL: For Backend API
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'       //Data is in JSON format
    }
});

// Response interceptor
api.interceptors.response.use(
    // Success — just return response
    (response) => response,

    // Error — check if 401
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried
        // and not a refresh/login request itself
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/api/auth/refresh') &&
            !originalRequest.url.includes('/api/auth/login')
        ) {
            originalRequest._retry = true;

            try {
                // Call refresh endpoint
                // refresh_token cookie sent automatically
                await api.post('/api/auth/refresh');

                // Retry original request
                // new access_token cookie set automatically
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh failed — token expired or invalid
                // Redirect to login
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);


export default api;