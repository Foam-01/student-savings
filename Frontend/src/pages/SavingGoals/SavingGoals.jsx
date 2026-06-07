import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../config/apiClient';
import { Target, Plus, Edit2, Trash2, CheckCircle, Calendar, Trophy, AlertCircle, Search, Filter } from 'lucide-react';
import Swal from 'sweetalert2';
import FinancialInsights from '../../components/FinancialInsights/FinancialInsights';

const SavingGoals = () => {
  const { user, isAdmin, isStudent } = useAuth();
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Admin filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassroom, setFilterClassroom] = useState('all');
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      if (isAdmin()) {
        const response = await apiClient.get('/savinggoal/all');
        setGoals(response.data);
        setFilteredGoals(response.data);
        
        // Extract classrooms for filter
        const classes = [...new Set(response.data.map(g => g.classroom ?? 'ไม่ระบุ'))].filter(Boolean);
        setClassrooms(classes);
      } else {
        const response = await apiClient.get(`/savinggoal/student/${user?.id}`);
        setGoals(response.data);
        setFilteredGoals(response.data);
      }
    } catch (error) {
      console.error('Error fetching saving goals:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลเป้าหมายการออมได้',
        icon: 'error',
        confirmButtonColor: '#667eea'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      const filtered = goals.filter(goal => {
        const matchesSearch = 
          goal.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          goal.studentUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          goal.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = filterClassroom === 'all' || (goal.classroom ?? 'ไม่ระบุ') === filterClassroom;
        return matchesSearch && matchesClass;
      });
      setFilteredGoals(filtered);
    } else {
      setFilteredGoals(goals);
    }
  }, [searchTerm, filterClassroom, goals]);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setTitle('');
    setDescription('');
    setTargetAmount('');
    setTargetDate('');
    setShowModal(true);
  };

  const handleOpenEditModal = (goal) => {
    setModalMode('edit');
    setSelectedGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setTargetAmount(goal.targetAmount);
    setTargetDate(goal.targetDate ? goal.targetDate.split('T')[0] : '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount || parseFloat(targetAmount) <= 0) {
      Swal.fire({
        title: 'ข้อมูลไม่ถูกต้อง',
        text: 'กรุณากรอกชื่อเป้าหมายและยอดเงินเป้าหมายให้ถูกต้อง',
        icon: 'warning',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    const payload = {
      title,
      description,
      targetAmount: parseFloat(targetAmount),
      targetDate: targetDate ? new Date(targetDate).toISOString() : null
    };

    try {
      if (modalMode === 'create') {
        await apiClient.post('/savinggoal', payload);
        Swal.fire({
          title: 'สร้างเป้าหมายสำเร็จ',
          text: 'เริ่มการออมเพื่อเป้าหมายของคุณได้เลย!',
          icon: 'success',
          confirmButtonColor: '#667eea'
        });
      } else {
        await apiClient.put(`/savinggoal/${selectedGoal.id}`, payload);
        Swal.fire({
          title: 'อัปเดตเป้าหมายสำเร็จ',
          text: 'แก้ไขข้อมูลเป้าหมายเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#667eea'
        });
      }
      setShowModal(false);
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกเป้าหมายได้',
        icon: 'error',
        confirmButtonColor: '#667eea'
      });
    }
  };

  const handleDelete = async (goalId) => {
    const result = await Swal.fire({
      title: 'ต้องการลบเป้าหมาย?',
      text: 'เป้าหมายนี้จะถูกลบออกจากระบบอย่างถาวร',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#667eea',
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/savinggoal/${goalId}`);
        Swal.fire({
          title: 'ลบสำเร็จ',
          text: 'ลบเป้าหมายการออมเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#667eea'
        });
        fetchGoals();
      } catch (error) {
        console.error('Error deleting goal:', error);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบเป้าหมายได้',
          icon: 'error',
          confirmButtonColor: '#667eea'
        });
      }
    }
  };

  const handleToggleStatus = async (goalId) => {
    try {
      await apiClient.patch(`/savinggoal/${goalId}/toggle`);
      fetchGoals();
    } catch (error) {
      console.error('Error toggling goal status:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถอัปเดตสถานะเป้าหมายได้',
        icon: 'error',
        confirmButtonColor: '#667eea'
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่มีกำหนด';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Student specific statistics
  const totalGoalsCount = goals.length;
  const completedGoalsCount = goals.filter(g => g.isCompleted).length;
  const activeGoalsCount = totalGoalsCount - completedGoalsCount;

  return (
    <div className="saving-goals-container">
      {/* Page Header */}
      <header className="page-header d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="page-title fw-bold">เป้าหมายการออมเงิน</h1>
          <p className="page-subtitle text-muted">
            {isStudent() ? 'วางแผนออมเงินเพื่อสิ่งที่คุณต้องการและติดตามความก้าวหน้า' : 'ติดตามและช่วยเหลือเป้าหมายการออมของนักเรียนทุกคน'}
          </p>
        </div>
        {isStudent() && (
          <button className="btn btn-success px-4 py-2" onClick={handleOpenCreateModal}>
            <Plus size={18} className="me-2" />
            สร้างเป้าหมายใหม่
          </button>
        )}
      </header>

      {/* Metrics for Students */}
      {isStudent() && (
        <>
          <div className="row mb-4 g-3">
            <div className="col-md-4">
              <div className="metric-card metric-card--primary">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="metric-label">ยอดเงินออมปัจจุบัน</p>
                    <h3 className="metric-value fw-bold mb-0">{formatCurrency(user?.balance || 0)}</h3>
                    <small className="metric-hint">เงินออมสะสมจริงในบัญชี</small>
                  </div>
                  <div className="icon-box">
                    <Trophy size={28} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="metric-card metric-card--warning">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="metric-label">กำลังออม</p>
                    <h3 className="metric-value fw-bold mb-0">{activeGoalsCount}</h3>
                    <small className="metric-hint">เป้าหมายที่รอให้บรรลุ</small>
                  </div>
                  <div className="icon-box">
                    <Target size={28} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="metric-card metric-card--success">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="metric-label">ออมสำเร็จแล้ว</p>
                    <h3 className="metric-value fw-bold mb-0">{completedGoalsCount}</h3>
                    <small className="metric-hint">เป้าหมายที่บรรลุเรียบร้อย</small>
                  </div>
                  <div className="icon-box">
                    <CheckCircle size={28} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-12">
              <FinancialInsights />
            </div>
          </div>
        </>
      )}

      {/* Search and Filters for Admin */}
      {isAdmin() && (
        <div className="card modern-card mb-4 border-0 shadow-sm">
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
                    placeholder="ค้นหาชื่อนักเรียน, รหัสนักเรียน หรือเป้าหมาย..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <Filter size={18} />
                  </span>
                  <select
                    className="form-select"
                    value={filterClassroom}
                    onChange={(e) => setFilterClassroom(e.target.value)}
                  >
                    <option value="all">ทุกชั้นเรียน</option>
                    {classrooms.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-2 d-flex align-items-center">
                <span className="text-muted small">{filteredGoals.length} รายการ</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-indigo" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="text-muted mt-2">กำลังโหลดข้อมูลเป้าหมายการออม...</p>
        </div>
      ) : filteredGoals.length > 0 ? (
        isStudent() ? (
          /* Student Card Grid */
          <div className="row g-4">
            {filteredGoals.map((goal) => {
              const isGoalCompleted = goal.isCompleted || (user?.balance >= goal.targetAmount);
              const progressColor = isGoalCompleted ? 'bg-success' : goal.progressPercentage >= 75 ? 'bg-info' : goal.progressPercentage >= 40 ? 'bg-primary' : 'bg-warning';
              
              return (
                <div className="col-lg-4 col-md-6" key={goal.id}>
                  <div className={`card h-100 border-0 shadow-sm position-relative overflow-hidden ${goal.isCompleted ? 'border-start border-success border-4' : ''}`} style={{ transition: 'transform 0.2s', borderRadius: '16px' }}>
                    {/* Goal Header */}
                    <div className="card-body d-flex flex-column justify-content-between p-4">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className={`badge ${goal.isCompleted ? 'bg-success bg-opacity-10 text-success' : 'bg-light text-muted'} px-3 py-2 rounded-pill`}>
                            {goal.isCompleted ? 'สำเร็จแล้ว' : 'กำลังออมเงิน'}
                          </span>
                          <div className="dropdown">
                            <button className="btn btn-link text-muted p-0 border-0 shadow-none" type="button" data-bs-toggle="dropdown">
                              <Edit2 size={16} className="cursor-pointer" onClick={() => handleOpenEditModal(goal)} />
                            </button>
                          </div>
                        </div>

                        <h3 className="h5 fw-bold text-dark mb-2">{goal.title}</h3>
                        <p className="text-muted small mb-4">{goal.description || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>
                      </div>

                      {/* Progress Area */}
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="small text-muted">ความคืบหน้า</span>
                          <span className="small fw-bold">{goal.progressPercentage}%</span>
                        </div>
                        <div className="progress mb-3" style={{ height: '8px', borderRadius: '4px' }}>
                          <div 
                            className={`progress-bar ${progressColor}`} 
                            role="progressbar" 
                            style={{ width: `${goal.progressPercentage}%` }} 
                            aria-valuenow={goal.progressPercentage} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          />
                        </div>

                        <div className="d-flex justify-content-between align-items-center text-dark small mb-3">
                          <div>
                            <span className="text-muted d-block small">ยอดปัจจุบัน</span>
                            <span className="fw-bold">{formatCurrency(user?.balance || 0)}</span>
                          </div>
                          <div className="text-end">
                            <span className="text-muted d-block small">เป้าหมาย</span>
                            <span className="fw-bold text-indigo">{formatCurrency(goal.targetAmount)}</span>
                          </div>
                        </div>

                        {/* Additional Info / Warnings */}
                        <div className="border-top pt-3 d-flex justify-content-between align-items-center">
                          <span className="text-muted small d-flex align-items-center">
                            <Calendar size={14} className="me-1" />
                            {formatDate(goal.targetDate)}
                          </span>
                          
                          {/* Complete status actions */}
                          <div className="d-flex gap-2">
                            <button 
                              className={`btn btn-sm ${goal.isCompleted ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                              onClick={() => handleToggleStatus(goal.id)}
                            >
                              {goal.isCompleted ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(goal.id)}
                              title="ลบเป้าหมาย"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Admin Goals Table */
          <div className="card modern-card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">นักเรียน</th>
                      <th>ชั้นเรียน</th>
                      <th>เป้าหมายการออม</th>
                      <th>ยอดเป้าหมาย</th>
                      <th style={{ width: '250px' }}>ความคืบหน้า</th>
                      <th>สถานะ</th>
                      <th>วันที่สิ้นสุด</th>
                      <th className="pe-4 text-end">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGoals.map((goal) => {
                      const progressColor = goal.isCompleted ? 'bg-success' : goal.progressPercentage >= 75 ? 'bg-info' : goal.progressPercentage >= 40 ? 'bg-primary' : 'bg-warning';
                      return (
                        <tr key={goal.id}>
                          <td className="ps-4">
                            <div className="fw-bold">{goal.studentName}</div>
                            <div className="text-muted small">@{goal.studentUsername}</div>
                          </td>
                          <td>
                            <span className="badge text-bg-light border">{goal.classroom || 'ไม่ระบุ'}</span>
                          </td>
                          <td>
                            <div className="fw-semibold">{goal.title}</div>
                            {goal.description && <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>{goal.description}</div>}
                          </td>
                          <td className="fw-bold text-indigo">{formatCurrency(goal.targetAmount)}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                <div 
                                  className={`progress-bar ${progressColor}`}
                                  style={{ width: `${goal.progressPercentage}%` }} 
                                />
                              </div>
                              <span className="small fw-semibold">{goal.progressPercentage}%</span>
                            </div>
                            <small className="text-muted">ปัจจุบัน: {formatCurrency(goal.currentSavings)}</small>
                          </td>
                          <td>
                            <span className={`badge ${goal.isCompleted ? 'bg-success' : 'bg-warning'} px-2.5 py-1.5`}>
                              {goal.isCompleted ? 'สำเร็จ' : 'กำลังออม'}
                            </span>
                          </td>
                          <td className="text-muted small">{formatDate(goal.targetDate)}</td>
                          <td className="pe-4 text-end">
                            <button 
                              className="btn btn-sm btn-outline-danger border-0" 
                              onClick={() => handleDelete(goal.id)}
                              title="ลบเป้าหมาย"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="text-center py-5 card modern-card border-0 shadow-sm">
          <div className="card-body py-5">
            <div className="p-3 bg-light rounded-circle d-inline-block text-muted mb-3">
              <Target size={48} />
            </div>
            <h3 className="fw-bold text-dark">ยังไม่มีเป้าหมายการออมเงิน</h3>
            <p className="text-muted">
              {isStudent() ? 'มาเริ่มต้นตั้งเป้าหมายแรกเพื่อจูงใจในการออมเงินของคุณกันเถอะ!' : 'ยังไม่มีนักเรียนคนใดตั้งเป้าหมายในระบบขณะนี้'}
            </p>
            {isStudent() && (
              <button className="btn btn-success px-4 py-2 mt-2" onClick={handleOpenCreateModal}>
                <Plus size={18} className="me-2" />
                สร้างเป้าหมายการออมเป็นคนแรก
              </button>
            )}
          </div>
        </div>
      )}

      {/* Goal Modal (Create / Edit) */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                <h5 className="modal-title fw-bold text-dark">
                  {modalMode === 'create' ? 'สร้างเป้าหมายการออมใหม่' : 'แก้ไขเป้าหมายการออม'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">ชื่อเป้าหมาย <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="เช่น ซื้อเครื่องเขียนใหม่, ออมเงินเพื่อการเรียน" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">รายละเอียดเพิ่มเติม</label>
                    <textarea 
                      className="form-control" 
                      rows="3" 
                      placeholder="บอกเหตุผลหรือรายละเอียดเพิ่มเติมสำหรับเป้าหมายนี้..." 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">ยอดเงินเป้าหมาย (บาท) <span className="text-danger">*</span></label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="1" 
                      step="any"
                      placeholder="เช่น 500" 
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">วันที่คาดหวังว่าจะสำเร็จ</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0 pb-4 px-4">
                  <button type="button" className="btn btn-outline-secondary px-4 py-2" onClick={() => setShowModal(false)}>ยกเลิก</button>
                  <button type="submit" className="btn btn-indigo px-4 py-2 text-white" style={{ backgroundColor: '#4f46e5' }}>
                    {modalMode === 'create' ? 'บันทึกเป้าหมาย' : 'บันทึกการแก้ไข'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingGoals;
