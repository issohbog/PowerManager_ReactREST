import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Menu from './pages/User/Menu'
import './components/css/reset.css';
import AdminLayout from './components/Admin/layout/AdminLayout';
import SeatStatus from './pages/Admin/SeatStatus';
import ProductList from './pages/Admin/ProductList';
import Logs from './pages/Admin/Logs';
import TodayHistoryList from './pages/Admin/TodayHistoryList';
import Sales from './pages/Admin/Sales';
import UserList from './pages/Admin/UserList';
import LoginPage from './pages/LoginPage';
import LoginContextProvider from './contexts/LoginContext';

const App = () => {
  return (
  <BrowserRouter>
    <LoginContextProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/menu" element={<Menu />} />

        {/* 관리자 페이지 */}
        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="seat-status" />} />   {/* /admin → /admin/seat-status */}
            <Route path="seat-status" element={<SeatStatus />} />
            <Route path="product-list" element={<ProductList />} />
            <Route path="user-list" element={<UserList />} />
            <Route path="sales" element={<Sales />} />
            <Route path="logs" element={<Logs />} />
            <Route path="todayhistory" element={<TodayHistoryList />} />
        </Route>

        

      </Routes>
    </LoginContextProvider>
  </BrowserRouter>
  )
}

export default App