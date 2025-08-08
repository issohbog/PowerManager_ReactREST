import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import SidebarLeft from './SidebarLeft'
import SidebarRight from './SidebarRight'



const AdminLayout = () => {
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
            <SidebarRight />
        </div>
    </>
  )
}

export default AdminLayout