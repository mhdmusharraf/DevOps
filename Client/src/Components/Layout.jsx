// src/components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Sections/Header'; 
import Sidebar from '../Sections/Sidebar';
import SidebarLecturer from '../Sections/SidebarLecturer';
const Layout = ({ bgColor,isLecturer }) => {
  return (
    <div className="w-full h-screen flex justify-between items-start">
  {!isLecturer ?  <Sidebar /> : <SidebarLecturer/>}
      <div className={`w-full lg:w-4/5 grow bg-${bgColor}-100 h-screen overflow-y-auto flex flex-col justify-start items-center gap-4 p-4`}>
        <Header bgColor={bgColor} />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
