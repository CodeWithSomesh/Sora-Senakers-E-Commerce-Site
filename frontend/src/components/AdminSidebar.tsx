import { useAuth0 } from '@auth0/auth0-react';
import Divider from '@mui/material/Divider';
import { BadgePlus, CircleArrowOutUpRight, CircleDollarSign, Home, LogOut, ShoppingBag, Users, BarChart3, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useSidebar } from '../context/SidebarContext';


export default function AdminSidebar() {
  const { logout } = useAuth0();
  const location = useLocation();
  const path = location.pathname;
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-violet2 text-white rounded-md"
      >
        {isMobileOpen ? <X width={24} height={24} /> : <Menu width={24} height={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full flex flex-col bg-white border-r shadow-lg z-40 transition-all duration-300
        ${isCollapsed ? 'w-[80px]' : 'w-[350px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="relative">
          <Link to={"/"} className={`text-3xl font-bold tracking-tight font-inter text-center my-4 block ${isCollapsed ? 'text-2xl' : ''}`}>
            {isCollapsed ? 'SR' : 'SoRa Sneakers'}
          </Link>

          {/* Collapse Toggle Button (Desktop Only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -right-3 bg-violet2 text-white rounded-full p-1.5 hover:bg-violet3 transition-colors shadow-md items-center justify-center"
          >
            {isCollapsed ? <ChevronRight width={18} height={18} /> : <ChevronLeft width={18} height={18} />}
          </button>
        </div>

        <Divider />

        {/* Navigation Links */}
        <div className='flex-grow overflow-auto'>
          <Link to="/admin/manageHomePage"
          className={`flex ${isCollapsed ? 'justify-center' : 'justify-center'} items-center my-4 gap-3 mx-6 py-4 hidden
          rounded-md hover:bg-violet2 hover:text-white ${path == "/admin/manageHomePage" ? "bg-violet2 hover:bg-violet3 text-white" : ""}`}>
            <Home width={36} height={36} />
            {!isCollapsed && <p className='text-2xl font-inter font-semibold'>Home Page Details</p>}
          </Link>

          <Link to="/admin/orderDetails" className={`flex ${isCollapsed ? 'justify-center mx-3 my-2' : 'justify-center'} items-center my-4 gap-3 mx-6 py-4
          rounded-md hover:bg-violet2 hover:text-white ${path == "/admin/orderDetails" ? "bg-violet2 hover:bg-violet3 text-white" : ""}`}>
            <CircleDollarSign width={36} height={36} className={isCollapsed ? '' : '-ml-[63px]'} />
            {!isCollapsed && <p className='text-2xl font-inter font-semibold'>Order Details</p>}
          </Link>

          <Link to="/admin/manageProducts" className={`flex ${isCollapsed ? 'justify-center mx-3 my-2' : 'justify-center'} items-center my-4 gap-3 mx-6 py-4
          rounded-md hover:bg-violet2 hover:text-white ${path == "/admin/manageProducts" ? "bg-violet2 hover:bg-violet3 text-white" : ""}`}>
            <ShoppingBag width={36} height={36} className={isCollapsed ? '' : '-ml-[38px]'} />
            {!isCollapsed && <p className='text-2xl font-inter font-semibold'>Product Details</p>}
          </Link>

          <Link to="/admin/addProducts"
          className={`flex ${isCollapsed ? 'justify-center mx-3 my-2' : 'justify-center'} items-center my-4 gap-3
          mx-6 py-4 rounded-md hover:bg-violet2 hover:text-white ${path == "/admin/addProducts" ? "bg-violet2 hover:bg-violet3 text-white" : ""}`}>
            <BadgePlus width={36} height={36} className={isCollapsed ? '' : '-ml-[70px]'} />
            {!isCollapsed && <p className='text-2xl font-inter font-semibold'>Add Product</p>}
          </Link>

          <Link to="/admin/userManagement"
          className={`flex ${isCollapsed ? 'justify-center mx-3 my-2' : 'justify-center'} items-center my-4 gap-3
          mx-6 py-4 rounded-md hover:bg-violet2 hover:text-white ${path == "/admin/userManagement" ? "bg-violet2 hover:bg-violet3 text-white" : ""}`}>
            <Users width={36} height={36} className={isCollapsed ? '' : '-ml-[65px]'} />
            {!isCollapsed && <p className='text-2xl font-inter font-semibold'>User Details</p>}
          </Link>

          <Link to="/admin/analytics"
          className={`flex ${isCollapsed ? 'justify-center mx-3 my-2' : 'justify-center'} items-center my-4 gap-3
          mx-6 py-4 rounded-md hover:bg-violet2 hover:text-white ${path == "/admin/analytics" ? "bg-violet2 hover:bg-violet3 text-white" : ""}`}>
            <BarChart3 width={36} height={36} className={isCollapsed ? '' : '-ml-[95px]'} />
            {!isCollapsed && <p className='text-2xl font-inter font-semibold'>Analytics</p>}
          </Link>
        </div>

        {/* Bottom Actions */}
        <div className='border-t w-full'></div>

        <Link to="/" className={`flex ${isCollapsed ? 'justify-center mx-3 my-2' : 'justify-center'} items-center mx-6 gap-4 py-4 my-4 rounded-md hover:bg-violet2 hover:text-white`}>
          <CircleArrowOutUpRight width={30} height={30} className={isCollapsed ? '' : '-ml-[82px]'} />
          {!isCollapsed && <p className='text-2xl font-inter font-semibold'>Exit Admin</p>}
        </Link>

        <Link to="" onClick={() => logout()} className={`flex ${isCollapsed ? 'justify-center mx-3 my-2' : 'justify-center'} items-center mb-4 mx-6 gap-3 py-4 rounded-md hover:bg-violet2 hover:text-white`}>
          <LogOut width={36} height={36} className={isCollapsed ? '' : '-ml-[120px]'} />
          {!isCollapsed && <p className='text-2xl font-inter font-semibold'>Logout</p>}
        </Link>
      </div>
    </>
  );
}
