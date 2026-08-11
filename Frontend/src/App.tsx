import './App.css'
import 'antd/dist/reset.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginScreen } from './screens/login/LoginScreen'
import {PurchaseOrderListScreen} from './screens/purchase-orders/PurchaseOrderListScreen'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/purchase-orders" element={<PurchaseOrderListScreen />} />
 
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App