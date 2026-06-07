import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../config/apiClient';
import { UserPlus, Search, Edit, Trash2, Download, Eye, Users } from 'lucide-react';
import Swal from 'sweetalert2';

const Students = () => {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({
    username: '',
    password: '',
    fullName: '',
    classroom: 'ม.1/1',
  });
  const [editStudent, setEditStudent] = useState({
    id: null,
    username: '',
    fullName: '',
    classroom: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      setLoading(false);
      return;
    }
    fetchStudents();
  }, []);

  const normalizeStudent = (s) => ({
    id: s.id ?? s.Id,
    username: s.username ?? s.Username ?? '',
    fullName: s.fullName ?? s.FullName ?? '',
    balance: Number(s.balance ?? s.Balance ?? 0),
    qrCodeData: s.qrCodeData ?? s.QrCodeData ?? '',
    classroom: s.classroom ?? s.Classroom ?? 'ไม่ระบุ',
    createdAt: s.createdAt ?? s.CreatedAt,
  });

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get('/transaction/students');
      const list = Array.isArray(response.data) ? response.data.map(normalizeStudent) : [];
      setStudents(list);
      setFilteredStudents(list);
    } catch (error) {
      console.error('Error fetching students:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลนักเรียนได้',
        icon: 'error',
        confirmButtonColor: '#667eea'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = students.filter((student) => {
      const fullName = (student.fullName ?? student.FullName ?? '').toString();
      const username = (student.username ?? student.Username ?? '').toString();
      const balance = Number(student.balance ?? student.Balance ?? 0);
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        fullName.toLowerCase().includes(term) || username.toLowerCase().includes(term);
      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'withBalance' && balance > 0) ||
        (filterStatus === 'noBalance' && balance === 0);
      return matchesSearch && matchesFilter;
    });
    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, students]);

  const handleDeleteStudent = async (studentId) => {
    const result = await Swal.fire({
      title: 'ต้องการลบนักเรียน?',
      text: 'การลบนักเรียนจะลบข้อมูลรายการทั้งหมดด้วย',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#667eea',
      confirmButtonText: 'ใช่, ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/transaction/student/${studentId}`);
        Swal.fire({
          title: 'ลบสำเร็จ',
          text: 'ลบนักเรียนเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#667eea'
        });
        fetchStudents();
      } catch (error) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบนักเรียนได้',
          icon: 'error',
          confirmButtonColor: '#667eea'
        });
      }
    }
  };

  const handleEditStudent = (student) => {
    setEditStudent({
      id: student.id,
      username: student.username,
      fullName: student.fullName,
      classroom: student.classroom ?? '',
    });
    setShowEditModal(true);
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/transaction/student/${editStudent.id}`, {
        fullName: editStudent.fullName,
        classroom: editStudent.classroom,
      });
      Swal.fire({
        title: 'อัปเดตสำเร็จ',
        text: 'อัปเดตข้อมูลนักเรียนเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonColor: '#667eea'
      });
      setShowEditModal(false);
      fetchStudents();
    } catch (error) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถอัปเดตข้อมูลได้',
        icon: 'error',
        confirmButtonColor: '#667eea'
      });
    }
  };

  const handleExportStudents = () => {
    const csvContent = [
      ['รหัส', 'ชื่อ-นามสกุล', 'ชื่อผู้ใช้', 'ยอดเงินออม', 'QR Code', 'วันที่สร้าง'],
      ...filteredStudents.map(s => [
        s.id,
        s.fullName,
        s.username,
        s.balance,
        s.qrCodeData,
        new Date(s.createdAt).toLocaleDateString('th-TH')
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'students.csv';
    link.click();
  };

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

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

  const handleAddStudent = async (e) => {
    e.preventDefault();

    if (!newStudent.username || !newStudent.password || !newStudent.fullName) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูลให้ครบ',
        text: 'กรุณากรอกข้อมูลทั้งหมด',
        icon: 'warning',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    setLoading(true);

    Swal.fire({
      title: 'กำลังบันทึกข้อมูล...',
      text: 'กรุณารอสักครู่',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      await apiClient.post('/transaction/student/create', newStudent);
      
      Swal.close();
      Swal.fire({
        title: 'บันทึกข้อมูลสำเร็จ',
        text: 'เพิ่มนักเรียนเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonColor: '#667eea'
      }).then(() => {
        setShowAddModal(false);
        setNewStudent({ username: '', password: '', fullName: '', classroom: 'ม.1/1' });
        fetchStudents();
      });
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.message || 'ไม่สามารถเพิ่มนักเรียนได้',
        icon: 'error',
        confirmButtonColor: '#667eea'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  if (!isAdmin()) {
    return (
      <div className="empty-state">
        <Users size={56} className="text-muted" aria-hidden="true" />
        <h3 className="h5 mt-2">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h3>
        <p className="text-muted mb-0">หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
      </div>
    );
  }

  return (
    <div className="students-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">จัดการนักเรียน</h2>
          <p className="text-muted mb-0">จัดการข้อมูลนักเรียนทั้งหมด</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary"
            onClick={handleExportStudents}
          >
            <Download size={18} className="me-2" />
            Export
          </button>
          <button 
            className="btn btn-success"
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus size={18} className="me-2" />
            เพิ่มนักเรียน
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card modern-card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ค้นหาชื่อ, ชื่อผู้ใช้..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">ทั้งหมด</option>
                <option value="withBalance">มียอดเงิน</option>
                <option value="noBalance">ไม่มียอดเงิน</option>
              </select>
            </div>
            <div className="col-md-3">
              <div className="text-muted small">
                แสดง {filteredStudents.length} จาก {students.length} คน
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card modern-card">
        <div className="card-body">
          {loading ? (
            <div className="loading-screen py-5" role="status" aria-live="polite">
              <div className="spinner-border" aria-hidden="true" />
              <p>กำลังโหลดรายชื่อนักเรียน...</p>
            </div>
          ) : paginatedStudents.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>รหัส</th>
                      <th>ชื่อ-นามสกุล</th>
                      <th>ห้องเรียน</th>
                      <th>ชื่อผู้ใช้</th>
                      <th>ยอดเงินออม</th>
                      <th>QR Code</th>
                      <th>วันที่สร้าง</th>
                      <th>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <span className="badge bg-light text-dark">#{student.id}</span>
                        </td>
                        <td className="fw-bold">{student.fullName}</td>
                        <td>
                          <span className="badge text-bg-light border">{student.classroom}</span>
                        </td>
                        <td>
                          <code className="small">{student.username}</code>
                        </td>
                        <td className="fw-bold">
                          <span className={student.balance > 0 ? 'text-success' : 'text-muted'}>
                            {formatCurrency(student.balance)}
                          </span>
                        </td>
                        <td>
                          <code className="small text-muted">{student.qrCodeData?.substring(0, 15)}...</code>
                        </td>
                        <td className="text-muted small">
                          {new Date(student.createdAt).toLocaleDateString('th-TH')}
                        </td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleViewStudent(student)}
                              title="ดูรายละเอียด"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditStudent(student)}
                              title="แก้ไข"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteStudent(student.id)}
                              title="ลบ"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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
            <div className="empty-state">
              <Users size={56} className="text-muted" aria-hidden="true" />
              <p className="text-muted mb-3">
                {students.length === 0 ? 'ยังไม่มีนักเรียนในระบบ' : 'ไม่พบนักเรียนตามเงื่อนไขที่ค้นหา'}
              </p>
              {students.length === 0 && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => setShowAddModal(true)}
                >
                  <UserPlus size={18} className="me-2" aria-hidden="true" />
                  เพิ่มนักเรียนคนแรก
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">เพิ่มนักเรียนใหม่</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddStudent}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ชื่อผู้ใช้</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newStudent.username}
                      onChange={(e) => setNewStudent({...newStudent, username: e.target.value})}
                      placeholder="กรอกชื่อผู้ใช้"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">รหัสผ่าน</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newStudent.password}
                      onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                      placeholder="กรอกรหัสผ่าน"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ห้องเรียน</label>
                    <select
                      className="form-select"
                      value={newStudent.classroom}
                      onChange={(e) => setNewStudent({ ...newStudent, classroom: e.target.value })}
                    >
                      {['ม.1/1', 'ม.1/2', 'ม.2/1', 'ม.2/2', 'ม.3/1', 'ม.3/2', 'ม.4/1', 'ม.4/2', 'ม.5/1', 'ม.5/2', 'ม.6/1'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ชื่อ-นามสกุล</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newStudent.fullName}
                      onChange={(e) => setNewStudent({...newStudent, fullName: e.target.value})}
                      placeholder="กรอกชื่อ-นามสกุล"
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  ยกเลิก
                </button>
                <button type="button" className="btn btn-primary" onClick={handleAddStudent} disabled={loading}>
                  {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">รายละเอียดนักเรียน</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="text-muted small">รหัส</label>
                  <p className="fw-bold">#{selectedStudent.id}</p>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">ชื่อ-นามสกุล</label>
                  <p className="fw-bold">{selectedStudent.fullName}</p>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">ชื่อผู้ใช้</label>
                  <p className="fw-bold">{selectedStudent.username}</p>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">ยอดเงินออม</label>
                  <p className="fw-bold text-success">{formatCurrency(selectedStudent.balance)}</p>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">QR Code</label>
                  <p className="fw-bold"><code>{selectedStudent.qrCodeData}</code></p>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">วันที่สร้าง</label>
                  <p className="fw-bold">{new Date(selectedStudent.createdAt).toLocaleDateString('th-TH')}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setShowViewModal(false)}>
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">แก้ไขข้อมูลนักเรียน</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateStudent}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ชื่อผู้ใช้</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editStudent.username}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ห้องเรียน</label>
                    <select
                      className="form-select"
                      value={editStudent.classroom}
                      onChange={(e) => setEditStudent({ ...editStudent, classroom: e.target.value })}
                    >
                      {['ม.1/1', 'ม.1/2', 'ม.2/1', 'ม.2/2', 'ม.3/1', 'ม.3/2', 'ม.4/1', 'ม.4/2', 'ม.5/1', 'ม.5/2', 'ม.6/1'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ชื่อ-นามสกุล</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editStudent.fullName}
                      onChange={(e) => setEditStudent({...editStudent, fullName: e.target.value})}
                      placeholder="กรอกชื่อ-นามสกุล"
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  ยกเลิก
                </button>
                <button type="button" className="btn btn-primary" onClick={handleUpdateStudent}>
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
