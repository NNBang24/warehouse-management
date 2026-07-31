import {createSlice ,type PayloadAction} from '@reduxjs/toolkit' 

interface AuthState {
    user: string | null
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
        setAuthSuccess: (state, action: PayloadAction<{ user: string; token: string }>) => {
                state.user = action.payload.user ;
                state.token = action.payload.token ;
                localStorage.setItem('token' , action.payload.token) ;

        } ,
        logout: (state) => {
            state.user = null ; 
            state.token = null ; 
            localStorage.removeItem('token') ;
        }
    }
    
})

export const {setAuthSuccess , logout} = authSlice.actions ;
export default authSlice.reducer ;
