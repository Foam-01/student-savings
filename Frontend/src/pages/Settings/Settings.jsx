import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../config/apiClient';
import { Settings, User, Shield, Bell, Palette, Database, Save, Key } from 'lucide-react';
import Swal from 'sweetalert2';

const SettingsPage = () => {
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    schoolName: 'ระบบออมทรัพย์นักเรียน',
    currency: 'THB',
    language: 'th',
    theme: 'light',
    notifications: true,
    autoBackup: true,
    backupFrequency: 'daily'
  });
  const [adminUsers, setAdminUsers] = useState([]);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    password: '',
    fullName: ''
  });

  useEffect(() => {
    if (!isAdmin()) return;
    fetchAdminUsers();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiClient.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const response = await apiClient.get('/auth/admins');
      setAdminUsers(response.data);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await apiClient.put('/settings', settings);
      Swal.fire({
        title: 'บันทึกสำเร็จ',
        text: 'บันทึกการตั้งค่าเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonColor: '#ec4899'
      });
    } catch (error) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกการตั้งค่าได้',
        icon: 'error',
        confirmButtonColor: '#667eea'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.username || !newAdmin.password || !newAdmin.fullName) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูลให้ครบ',
        text: 'กรุณากรอกข้อมูลทั้งหมด',
        icon: 'warning',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    try {
      await apiClient.post('/auth/register-admin', newAdmin);
      Swal.fire({
        title: 'เพิ่ม Admin สำเร็จ',
        text: 'เพิ่มผู้ดูแลระบบเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonColor: '#667eea'
      });
      setShowAddAdminModal(false);
      setNewAdmin({ username: '', password: '', fullName: '' });
      fetchAdminUsers();
    } catch (error) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.message || 'ไม่สามารถเพิ่ม Admin ได้',
        icon: 'error',
        confirmButtonColor: '#667eea'
      });
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (adminId === user?.id) {
      Swal.fire({
        title: 'ไม่สามารถลบ',
        text: 'ไม่สามารถลบตัวเองได้',
        icon: 'warning',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'ต้องการลบ Admin?',
      text: 'การลบ Admin จะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#667eea',
      confirmButtonText: 'ใช่, ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/auth/admin/${adminId}`);
        Swal.fire({
          title: 'ลบสำเร็จ',
          text: 'ลบ Admin เรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#667eea'
        });
        fetchAdminUsers();
      } catch (error) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบ Admin ได้',
          icon: 'error',
          confirmButtonColor: '#667eea'
        });
      }
    }
  };

  if (!isAdmin()) {
    return (
      <div className="text-center py-5">
        <h3>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h3>
      </div>
    );
  }

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">ตั้งค่าระบบ</h2>
          <p className="text-muted mb-0">จัดการการตั้งค่าและผู้ดูแลระบบ</p>
        </div>
      </div>

      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card modern-card">
            <div className="card-body">
              <div className="nav flex-column nav-pills">
                <button
                  className={`nav-link text-start mb-2 ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User size={18} className="me-2" />
                  ข้อมูลส่วนตัว
                </button>
                <button
                  className={`nav-link text-start mb-2 ${activeTab === 'general' ? 'active' : ''}`}
                  onClick={() => setActiveTab('general')}
                >
                  <Settings size={18} className="me-2" />
                  ตั้งค่าทั่วไป
                </button>
                <button
                  className={`nav-link text-start mb-2 ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <Shield size={18} className="me-2" />
                  ความปลอดภัย
                </button>
                <button
                  className={`nav-link text-start mb-2 ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell size={18} className="me-2" />
                  การแจ้งเตือน
                </button>
                <button
                  className={`nav-link text-start mb-2 ${activeTab === 'admins' ? 'active' : ''}`}
                  onClick={() => setActiveTab('admins')}
                >
                  <Key size={18} className="me-2" />
                  จัดการ Admin
                </button>
                <button
                  className={`nav-link text-start mb-2 ${activeTab === 'backup' ? 'active' : ''}`}
                  onClick={() => setActiveTab('backup')}
                >
                  <Database size={18} className="me-2" />
                  สำรองข้อมูล
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="col-lg-9">
          <div className="card modern-card">
            <div className="card-body">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <>
                  <h5 className="fw-bold mb-4">ข้อมูลส่วนตัว</h5>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ชื่อผู้ใช้</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user?.username || ''}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ชื่อ-นามสกุล</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user?.fullName || ''}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">บทบาท</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user?.role || ''}
                      disabled
                    />
                  </div>
                </>
              )}

              {/* General Settings */}
              {activeTab === 'general' && (
                <>
                  <h5 className="fw-bold mb-4">ตั้งค่าทั่วไป</h5>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ชื่อโรงเรียน/สถาบัน</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.schoolName}
                      onChange={(e) => setSettings({...settings, schoolName: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">สกุลเงิน</label>
                    <select
                      className="form-select"
                      value={settings.currency}
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                    >
                      <option value="THB">บาทไทย (THB)</option>
                      <option value="USD">ดอลลาร์สหรัฐ (USD)</option>
                      <option value="EUR">ยูโร (EUR)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ภาษา</label>
                    <select
                      className="form-select"
                      value={settings.language}
                      onChange={(e) => setSettings({...settings, language: e.target.value})}
                    >
                      <option value="th">ไทย</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ธีม</label>
                    <select
                      className="form-select"
                      value={settings.theme}
                      onChange={(e) => setSettings({...settings, theme: e.target.value})}
                    >
                      <option value="light">สว่าง</option>
                      <option value="dark">มืด</option>
                      <option value="auto">อัตโนมัติ</option>
                    </select>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSaveSettings}
                    disabled={loading}
                  >
                    <Save size={18} className="me-2" />
                    {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <>
                  <h5 className="fw-bold mb-4">ความปลอดภัย</h5>
                  <div className="alert alert-info">
                    <Shield size={18} className="me-2" />
                    ระบบใช้ JWT Token สำหรับการยืนยันตัวตน
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">เปลี่ยนรหัสผ่าน</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="กรอกรหัสผ่านใหม่"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ยืนยันรหัสผ่าน</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                    />
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => Swal.fire({
                      title: 'เปลี่ยนรหัสผ่านสำเร็จ',
                      icon: 'success',
                      confirmButtonColor: '#667eea'
                    })}
                  >
                    เปลี่ยนรหัสผ่าน
                  </button>
                </>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <>
                  <h5 className="fw-bold mb-4">การแจ้งเตือน</h5>
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                      />
                      <label className="form-check-label fw-bold">
                        เปิดการแจ้งเตือน
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        defaultChecked
                      />
                      <label className="form-check-label">
                        แจ้งเตือนเมื่อมีรายการใหม่
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        defaultChecked
                      />
                      <label className="form-check-label">
                        แจ้งเตือนเมื่อมีนักเรียนใหม่
                      </label>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSaveSettings}
                    disabled={loading}
                  >
                    <Save size={18} className="me-2" />
                    {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </>
              )}

              {/* Admin Management */}
              {activeTab === 'admins' && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">จัดการ Admin</h5>
                    <button 
                      className="btn btn-success"
                      onClick={() => setShowAddAdminModal(true)}
                    >
                      <User size={18} className="me-2" />
                      เพิ่ม Admin
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>ชื่อผู้ใช้</th>
                          <th>ชื่อ-นามสกุล</th>
                          <th>บทบาท</th>
                          <th>จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.map((admin) => (
                          <tr key={admin.id}>
                            <td className="fw-bold">{admin.username}</td>
                            <td>{admin.fullName}</td>
                            <td>
                              <span className="badge bg-primary">{admin.role}</span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteAdmin(admin.id)}
                                disabled={admin.id === user?.id}
                              >
                                ลบ
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Backup Settings */}
              {activeTab === 'backup' && (
                <>
                  <h5 className="fw-bold mb-4">สำรองข้อมูล</h5>
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.autoBackup}
                        onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                      />
                      <label className="form-check-label fw-bold">
                        สำรองข้อมูลอัตโนมัติ
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ความถี่การสำรอง</label>
                    <select
                      className="form-select"
                      value={settings.backupFrequency}
                      onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                    >
                      <option value="daily">รายวัน</option>
                      <option value="weekly">รายสัปดาห์</option>
                      <option value="monthly">รายเดือน</option>
                    </select>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={() => Swal.fire({
                        title: 'สำรองข้อมูลสำเร็จ',
                        icon: 'success',
                        confirmButtonColor: '#667eea'
                      })}
                    >
                      <Database size={18} className="me-2" />
                      สำรองข้อมูลทันที
                    </button>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => Swal.fire({
                        title: 'กู้คืนข้อมูลสำเร็จ',
                        icon: 'success',
                        confirmButtonColor: '#667eea'
                      })}
                    >
                      กู้คืนข้อมูล
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">เพิ่ม Admin ใหม่</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddAdminModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddAdmin}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ชื่อผู้ใช้</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAdmin.username}
                      onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                      placeholder="กรอกชื่อผู้ใช้"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">รหัสผ่าน</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                      placeholder="กรอกรหัสผ่าน"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ชื่อ-นามสกุล</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAdmin.fullName}
                      onChange={(e) => setNewAdmin({...newAdmin, fullName: e.target.value})}
                      placeholder="กรอกชื่อ-นามสกุล"
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddAdminModal(false)}>
                  ยกเลิก
                </button>
                <button type="button" className="btn btn-primary" onClick={handleAddAdmin}>
                  เพิ่ม Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
