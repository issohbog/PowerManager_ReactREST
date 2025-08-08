import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Menu from './pages/User/Menu'
import './components/css/reset.css';

const App = () => {
  return (
  <BrowserRouter>
    <Routes>
      <Route path="/menu" element={<Menu />} />
    </Routes>
  </BrowserRouter>
  )
}

export default App