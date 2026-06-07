import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../config/apiClient';
import { Clock, User, Download, Search, Activity, Shield, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const ActivityLog = () => {
  const { isAdmin } = useAuth();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      setLoading(false);
      return;
    }
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await apiClient.get('/activity');
      const list = (response.data || []).map((a) => ({
        id: a.id,
        type: a.type,
        user: a.user,
        action: a.action,
        details: a.details ?? '',
        timestamp: new Date(a.timestamp),
        ip: a.ip ?? '',
      }));
      setActivities(list);
      setFilteredActivities(list);
    } catch (error) {
      console.error('Error fetching activities:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงบันทึกกิจกรรมได้',
        icon: 'error',
        confirmButtonColor: '#4f46e5',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = activities.filter(activity => {
      const matchesSearch = activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || activity.type === filterType;
      
      let matchesDate = true;
      if (filterDate !== 'all') {
        const activityDate = new Date(activity.timestamp);
        const now = new Date();
        const hoursAgo = filterDate === '24h' ? 24 : 
                        filterDate === '7d' ? 168 : 
                        filterDate === '30d' ? 720 : 0;
        const cutoffDate = new Date(now - hoursAgo * 3600000);
        matchesDate = activityDate >= cutoffDate;
      }

      return matchesSearch && matchesType && matchesDate;
    });
    setFilteredActivities(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterType, filterDate, activities]);

  const handleExport = () => {
    const csvContent = [
      ['รหัส', 'ประเภท', 'ผู้ใช้', 'การกระทำ', 'รายละเอียด', 'เวลา', 'IP'],
      ...filteredActivities.map(a => [
        a.id,
        a.type,
        a.user,
        a.action,
        a.details,
        new Date(a.timestamp).toLocaleString('th-TH'),
        a.ip
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'activity_log.csv';
    link.click();
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'login': return <User size={14} />;
      case 'transaction': return <Activity size={14} />;
      case 'student': return <User size={14} />;
      case 'security': return <Shield size={14} />;
      case 'system': return <Clock size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const getActivityBadge = (type) => {
    switch(type) {
      case 'login': return 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 d-inline-flex align-items-center gap-1.5';
      case 'transaction': return 'bg-success bg-opacity-10 text-success border border-success border-opacity-20 d-inline-flex align-items-center gap-1.5';
      case 'student': return 'bg-info bg-opacity-10 text-info border border-info border-opacity-20 d-inline-flex align-items-center gap-1.5';
      case 'security': return 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-20 d-inline-flex align-items-center gap-1.5';
      case 'system': return 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-20 d-inline-flex align-items-center gap-1.5';
      default: return 'bg-light text-dark border d-inline-flex align-items-center gap-1.5';
    }
  };

  const getActivityLabel = (type) => {
    switch(type) {
      case 'login': return 'เข้าสู่ระบบ';
      case 'transaction': return 'ทำรายการ';
      case 'student': return 'นักเรียน';
      case 'security': return 'ความปลอดภัย';
      case 'system': return 'ระบบ';
      default: return type;
    }
  };

  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = 3;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 2;
      }

      if (start > 2) {
        pageNumbers.push('...');
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  if (!isAdmin()) {
    return (
      <div className="text-center py-5">
        <h3>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h3>
      </div>
    );
  }

  return (
    <div className="activity-log-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">บันทึกกิจกรรม</h2>
          <p className="text-muted mb-0">ติดตามกิจกรรมทั้งหมดในระบบ</p>
        </div>
        <button 
          className="btn btn-outline-primary"
          onClick={handleExport}
        >
          <Download size={18} className="me-2" />
          Export
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
          <div className="metric-card metric-card--info">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="metric-label">กิจกรรมทั้งหมด</p>
                <h3 className="metric-value fw-bold mb-0">{activities.length}</h3>
                <small className="metric-hint text-muted">บันทึก</small>
              </div>
              <div className="icon-box">
                <Activity size={28} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
          <div className="metric-card metric-card--success">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="metric-label">วันนี้</p>
                <h3 className="metric-value fw-bold mb-0">
                  {activities.filter(a => new Date(a.timestamp) > new Date(Date.now() - 86400000)).length}
                </h3>
                <small className="metric-hint text-muted">กิจกรรม</small>
              </div>
              <div className="icon-box">
                <Clock size={28} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
          <div className="metric-card metric-card--primary">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="metric-label">รายการ</p>
                <h3 className="metric-value fw-bold mb-0">
                  {activities.filter(a => a.type === 'transaction').length}
                </h3>
                <small className="metric-hint text-muted">ธุรกรรม</small>
              </div>
              <div className="icon-box">
                <Activity size={28} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
          <div className="metric-card metric-card--danger">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="metric-label">ความปลอดภัย</p>
                <h3 className="metric-value fw-bold mb-0">
                  {activities.filter(a => a.type === 'security').length}
                </h3>
                <small className="metric-hint text-muted">เหตุการณ์</small>
              </div>
              <div className="icon-box">
                <Shield size={28} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card modern-card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ค้นหากิจกรรม..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">ทุกประเภท</option>
                <option value="login">เข้า/ออก ระบบ</option>
                <option value="transaction">รายการ</option>
                <option value="student">นักเรียน</option>
                <option value="security">ความปลอดภัย</option>
                <option value="system">ระบบ</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              >
                <option value="all">ทุกช่วงเวลา</option>
                <option value="24h">24 ชั่วโมงล่าสุด</option>
                <option value="7d">7 วันล่าสุด</option>
                <option value="30d">30 วันล่าสุด</option>
              </select>
            </div>
            <div className="col-md-2">
              <div className="text-muted small">
                {filteredActivities.length} รายการ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="card modern-card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : paginatedActivities.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="ps-4">ประเภท</th>
                      <th>ผู้ใช้</th>
                      <th>การกระทำ</th>
                      <th>รายละเอียด</th>
                      <th>เวลา</th>
                      <th className="pe-4">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedActivities.map((activity) => (
                      <tr key={activity.id}>
                        <td className="ps-4">
                          <span className={`badge ${getActivityBadge(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                            <span>{getActivityLabel(activity.type)}</span>
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="avatar-circle-sm bg-indigo bg-opacity-10 text-indigo d-flex align-items-center justify-content-center fw-bold rounded-circle" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                              {activity.user ? activity.user.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span className="fw-bold text-dark">{activity.user}</span>
                          </div>
                        </td>
                        <td className="fw-semibold text-dark">{activity.action}</td>
                        <td>
                          <span className="text-secondary small d-inline-block text-truncate" style={{ maxWidth: '280px' }} title={activity.details}>
                            {activity.details || '-'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1.5 text-muted small">
                            <Clock size={14} className="text-secondary me-1" />
                            <span>{new Date(activity.timestamp).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </div>
                        </td>
                        <td className="pe-4">
                          <code className="bg-light text-secondary px-2 py-1 rounded small border">{activity.ip || '-'}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-muted small">
                    หน้า {currentPage} จาก {totalPages}
                  </div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          ก่อนหน้า
                        </button>
                      </li>
                      {getPageNumbers().map((page, i) => (
                        <li 
                          key={i} 
                          className={`page-item ${currentPage === page ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => typeof page === 'number' && setCurrentPage(page)}
                            disabled={page === '...'}
                          >
                            {page}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          ถัดไป
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <Activity size={48} className="text-muted mb-3" />
              <p className="text-muted">ไม่พบกิจกรรม</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
