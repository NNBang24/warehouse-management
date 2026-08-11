import {createSlice ,type PayloadAction} from '@reduxjs/toolkit' 


export interface User {
    id?: string | number;
    username: string;
    email?: string;
    role?: string;
}
interface AuthState {
    user: User | null
    token: string | null
}
const initialState: AuthState = {
    user : null ,
    token : localStorage.getItem('token') 
}


const authSlice = createSlice({
    name : 'auth' ,
    initialState ,
    reducers : {
        setAuthSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
                state.user = action.payload.user ;
                state.token = action.payload.token ;
                localStorage.setItem('token' , action.payload.token) ;

        } ,
        logout: (state) => {
            state.user = null ; 
            state.token = null ; 
            localStorage.removeItem('token') ;
            localStorage.removeItem('user');
        }
    }
    
})

export const {setAuthSuccess , logout} = authSlice.actions ;
export default authSlice.reducer ;
