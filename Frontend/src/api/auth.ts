import { apiClient } from "./apiClient";

export const loginRequest = async (credentials: { emailOrName: string; password: string }) => {
    const response = await apiClient.post('/auth/login' ,credentials) ; 
    return response.data ;
} ;