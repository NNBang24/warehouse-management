import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginScreen } from './screens/login/LoginScreen'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/login" element={<LoginScreen />} />

        {/* Nếu người dùng vào đường dẫn trống hoặc sai, tự động đá về /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App