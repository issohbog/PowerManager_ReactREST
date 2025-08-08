import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import SidebarLeft from './SidebarLeft'
import SidebarRight from './SidebarRight'
import OrderPopupContainer from '../../../containers/Admin/OrderPopupContainer'

const AdminLayout = () => {
  // ✅ OrderPopup 상태 관리
  const [showOrderPopup, setShowOrderPopup] = useState(false)

  // ✅ OrderPopup 토글 함수
  const handleOrderPopupToggle = () => {
    setShowOrderPopup(prev => !prev)
    console.log('🔄 OrderPopup 토글:', !showOrderPopup)
  }

  // ✅ OrderPopup 닫기 함수
  const handleOrderPopupClose = () => {
    setShowOrderPopup(false)
    console.log('❌ OrderPopup 닫기')
  }

  return (
    <>
        <Header />
        <div className="admin-container">
            <SidebarLeft />
            <main className='admin-main'>
                <div className="admin-content">
                  <Outlet />  {/* 여기에 각 메뉴 내용이 들어옴 */}
                </div>
            </main>
            <SidebarRight onOrderPopupToggle={handleOrderPopupToggle} />
        </div>
        {/* ✅ OrderPopup 모달 */}
        <OrderPopupContainer
          isVisible={showOrderPopup}
          onClose={handleOrderPopupClose}
        />
    </>
  )
}

export default AdminLayout