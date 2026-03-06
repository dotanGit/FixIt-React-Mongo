import axios, { CanceledError, AxiosError, type InternalAxiosRequestConfig } from "axios";

export { CanceledError };

const apiClient = axios.create({
    baseURL:  "https://localhost:3000/",
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('Token expired, attempting to refresh...');
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                console.log('No refresh token found, redirecting to login');
                localStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                console.log('Refreshing token...');
                const response = await apiClient.post('/users/refresh-token', { refreshToken });
                const { token, refreshToken: newRefreshToken } = response.data;
                
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', newRefreshToken);
                
                if (originalRequest.headers) {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                }
                
                console.log('Token refreshed successfully, retrying original request');
                return apiClient(originalRequest);
            } catch {
                console.log('Token refresh failed, redirecting to login');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;