import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Users,
  LogOut,
  Menu,
  X,
  User,
  QrCode,
  ArrowUpDown,
  FileText,
  Settings,
  Activity,
  Search,
  HelpCircle,
  Target,
  Trophy,
  Calculator,
  FolderHeart,
} from 'lucide-react';
import Swal from 'sweetalert2';
import NotificationSystem from '../components/Notifications/NotificationSystem';
import GlobalSearch from '../components/Search/GlobalSearch';

const sidebarLinkClass = ({ isActive }) =>
  `sidebar-link${isActive ? ' active' : ''}`;

const adminNavItems = [
  { to: '/', icon: Home, label: 'หน้าหลัก', end: true },
  { to: '/students', icon: Users, label: 'จัดการนักเรียน' },
  { to: '/transactions', icon: ArrowUpDown, label: 'จัดการรายการ' },
  { to: '/saving-goals', icon: Target, label: 'เป้าหมายการออม' },
  { to: '/savings-buckets', icon: FolderHeart, label: 'กระปุกออมเงินย่อย' },
  { to: '/leaderboard', icon: Trophy, label: 'อันดับการออมเงิน' },
  { to: '/interest-calculator', icon: Calculator, label: 'คำนวณดอกเบี้ย' },
  { to: '/reports', icon: FileText, label: 'รายงาน' },
  { to: '/settings', icon: Settings, label: 'ตั้งค่า' },
  { to: '/activity-log', icon: Activity, label: 'บันทึกกิจกรรม' },
  { to: '/help', icon: HelpCircle, label: 'ศูนย์ช่วยเหลือ' },
];

const studentNavItems = [
  { to: '/', icon: Home, label: 'หน้าหลัก', end: true },
  { to: '/my-qr', icon: QrCode, label: 'QR Code ของฉัน' },
  { to: '/saving-goals', icon: Target, label: 'เป้าหมายการออม' },
  { to: '/savings-buckets', icon: FolderHeart, label: 'กระปุกออมเงินย่อย' },
  { to: '/leaderboard', icon: Trophy, label: 'อันดับการออมเงิน' },
  { to: '/interest-calculator', icon: Calculator, label: 'คำนวณดอกเบี้ย' },
];

const MainLayout = ({ children }) => {
  const { user, logout, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  const navItems = isAdmin() ? adminNavItems : isStudent() ? studentNavItems : [];
  const showSidebar = navItems.length > 0;

  const handleLogout = () => {
    Swal.fire({
      title: 'ต้องการออกจากระบบ?',
      text: 'คุณต้องการออกจากระบบใช่หรือไม่',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'ใช่, ออกจากระบบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
        Swal.fire({
          title: 'ออกจากระบบสำเร็จ',
          icon: 'success',
          confirmButtonColor: '#4f46e5',
        });
      }
    });
  };

  const closeSidebar = () => setSidebarOpen(false);

  const renderSidebar = () => (
    <aside
      id="app-sidebar"
      className={`app-sidebar ${sidebarOpen ? 'is-open' : ''}`}
      aria-label="เมนูหลัก"
    >
      <div className="app-sidebar-inner">
        <p className="sidebar-label">เมนูหลัก</p>
        <ul className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={sidebarLinkClass}
                onClick={closeSidebar}
              >
                <Icon size={20} aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        ข้ามไปเนื้อหาหลัก
      </a>

      <nav className="navbar navbar-expand-lg navbar-dark app-navbar" aria-label="แถบนำทางด้านบน">
        <div className="container-fluid px-3 px-lg-4">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img
              src="https://img2.pic.in.th/unnamed-removebg-preview3a1bc4db8f4389e5.png"
              alt=""
              width={42}
              height={42}
            />
            <span>ระบบออมทรัพย์นักเรียน</span>
          </Link>

          {showSidebar && (
            <button
              className="navbar-toggler border-0 shadow-none"
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-expanded={sidebarOpen}
              aria-controls="app-sidebar"
              aria-label={sidebarOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            >
              {sidebarOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
            </button>
          )}

          <div className="collapse navbar-collapse show">
            <ul className="navbar-nav ms-auto align-items-center gap-1 gap-lg-2">
              <li className="nav-item">
                <button
                  type="button"
                  className="btn btn-nav-search btn-sm"
                  onClick={() => setShowGlobalSearch(true)}
                  aria-label="เปิดค้นหาทั้งระบบ"
                >
                  <Search size={16} className="me-1" aria-hidden="true" />
                  ค้นหา
                </button>
              </li>
              <li className="nav-item">
                <NotificationSystem />
              </li>
              <li className="nav-item d-none d-md-block">
                <span className="nav-link d-flex align-items-center py-2">
                  <User size={18} className="me-2" aria-hidden="true" />
                  <span>{user?.fullName}</span>
                </span>
              </li>
              <li className="nav-item">
                <span className="badge user-badge rounded-pill px-3 py-2">
                  {user?.role}
                </span>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className="btn btn-logout btn-sm"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="me-1" aria-hidden="true" />
                  ออกจากระบบ
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="d-flex flex-grow-1 position-relative">
        {sidebarOpen && showSidebar && (
          <button
            type="button"
            className="sidebar-backdrop d-md-none border-0"
            aria-label="ปิดเมนู"
            onClick={closeSidebar}
          />
        )}

        {showSidebar && renderSidebar()}

        <main id="main-content" className="app-main flex-grow-1" tabIndex={-1}>
          {children}
        </main>
      </div>

      <footer className="app-footer">
        <div className="container">
          <p>Copyright © 2026 ระบบออมทรัพย์นักเรียน | By ครูเปิงมางfc</p>
        </div>
      </footer>

      {showGlobalSearch && <GlobalSearch />}
    </div>
  );
};

export default MainLayout;
