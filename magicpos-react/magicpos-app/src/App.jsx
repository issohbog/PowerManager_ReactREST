import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Menu from './pages/User/Menu'
import './components/css/reset.css';
import AdminLayout from './components/Admin/layout/AdminLayout';
import SeatStatus from './pages/Admin/SeatStatus';
import ProductList from './pages/Admin/ProductList';
import UserList from './pages/Admin/UserList';

const App = () => {
  return (
  <BrowserRouter>
    <Routes>
      <Route path="/menu" element={<Menu />} />

      {/* 관리자 페이지 */}
      <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="seat-status" />} />   {/* /admin → /admin/seat-status */}
          <Route path="seat-status" element={<SeatStatus />} />
          <Route path="product-list" element={<ProductList />} />
          <Route path="user-list" element={<UserList />} />
      </Route>

      

    </Routes>
  </BrowserRouter>
  )
}

export default App