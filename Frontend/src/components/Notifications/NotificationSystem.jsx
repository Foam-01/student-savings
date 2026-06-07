import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../config/apiClient';
import Swal from 'sweetalert2';

const NotificationSystem = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notification');
      const list = (response.data || []).map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        time: new Date(n.time),
        read: n.read,
      }));
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await apiClient.put(`/notification/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notification/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    const wasUnread = notifications.find((n) => n.id === id)?.read === false;
    try {
      await apiClient.delete(`/notification/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = () => {
    Swal.fire({
      title: 'ลบการแจ้งเตือนทั้งหมด?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#4f46e5',
      confirmButtonText: 'ใช่, ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete('/notification');
          setNotifications([]);
          setUnreadCount(0);
        } catch (error) {
          console.error('Error clearing notifications:', error);
        }
      }
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'transaction': return '💰';
      case 'student': return '👤';
      case 'system': return '⚙️';
      case 'alert': return '⚠️';
      default: return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'transaction': return 'text-success';
      case 'student': return 'text-primary';
      case 'system': return 'text-info';
      case 'alert': return 'text-warning';
      default: return 'text-muted';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    return `${days} วันที่แล้ว`;
  };

  if (!user) return null;

  return (
    <div className="notification-system position-relative">
      <button
        type="button"
        className="btn btn-light position-relative"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="การแจ้งเตือน"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
            <span className="visually-hidden">ข้อความที่ยังไม่อ่าน</span>
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="dropdown-backdrop"
            onClick={() => setShowDropdown(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
          />
          <div
            className="dropdown-menu show position-absolute"
            style={{
              right: 0,
              width: '380px',
              maxHeight: '500px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">การแจ้งเตือน</h6>
              <div className="d-flex gap-2">
                {unreadCount > 0 && (
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={markAllAsRead}>
                    <Check size={14} className="me-1" />
                    อ่านทั้งหมด
                  </button>
                )}
                {notifications.length > 0 && (
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={clearAll}>
                    <Trash2 size={14} className="me-1" />
                    ลบทั้งหมด
                  </button>
                )}
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-5">
                <Bell size={48} className="text-muted mb-3" />
                <p className="text-muted">ไม่มีการแจ้งเตือน</p>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`list-group-item list-group-item-action ${!notification.read ? 'bg-light' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification.id);
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-1">
                          <span className="me-2">{getNotificationIcon(notification.type)}</span>
                          <span className={`fw-bold ${getNotificationColor(notification.type)}`}>
                            {notification.title}
                          </span>
                          {!notification.read && (
                            <span className="badge bg-primary ms-2">ใหม่</span>
                          )}
                        </div>
                        <p className="mb-1 small text-muted">{notification.message}</p>
                        <small className="text-muted">{formatTime(notification.time)}</small>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm text-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-2 border-top">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary w-100"
                onClick={() => setShowDropdown(false)}
              >
                <Settings size={14} className="me-2" />
                ปิด
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationSystem;
