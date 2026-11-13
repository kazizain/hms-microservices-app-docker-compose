import axios, { type InternalAxiosRequestConfig } from 'axios'
const axiosInstance = axios.create({
    baseURL: "http://20.239.225.142:9000"
    //baseURL: "https://hms-gateway-service.livelycoast-b05a0b25.uaenorth.azurecontainerapps.io"
})

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // console.log("interceptor: ", config)
        const token = localStorage.getItem("token");
        if(token && config.headers){
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    }
)

export default axiosInstance;
