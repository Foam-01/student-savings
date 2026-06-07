import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../config/apiClient';
import {
  FolderHeart,
  Book,
  Gamepad,
  Heart,
  Target,
  Wallet,
  Gift,
  ShoppingBag,
  Bike,
  Plane,
  Home,
  School,
  Plus,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Search,
  Filter,
  HelpCircle,
  Info,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';

const iconMap = {
  book: { component: Book, label: 'การศึกษา 📚', color: '#3b82f6' },
  gamepad: { component: Gamepad, label: 'ความบันเทิง/เกม 🎮', color: '#ec4899' },
  heart: { component: Heart, label: 'ฉุกเฉิน/สุขภาพ 🩺', color: '#ef4444' },
  target: { component: Target, label: 'เป้าหมายระยะยาว 🎯', color: '#10b981' },
  wallet: { component: Wallet, label: 'ค่าใช้จ่ายทั่วไป 💼', color: '#6366f1' },
  gift: { component: Gift, label: 'ของขวัญ/รางวัล 🎁', color: '#f59e0b' },
  shopping: { component: ShoppingBag, label: 'ช้อปปิ้ง 🛍️', color: '#8b5cf6' },
  bike: { component: Bike, label: 'พาหนะ/เดินทาง 🚲', color: '#06b6d4' },
  plane: { component: Plane, label: 'ท่องเที่ยว ✈️', color: '#14b8a6' },
  home: { component: Home, label: 'บ้าน/ครอบครัว 🏠', color: '#a855f7' },
  school: { component: School, label: 'กิจกรรมโรงเรียน 🏫', color: '#f43f5e' }
};

const RenderIcon = ({ name, size = 20, className = "", color = undefined }) => {
  const iconInfo = iconMap[name.toLowerCase()] || iconMap.wallet;
  const IconComp = iconInfo.component;
  return <IconComp size={size} className={className} style={color ? { color } : {}} />;
};

const SavingsBuckets = () => {
  const { user, isAdmin, isStudent } = useAuth();
  
  // Student States
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'transfer'
  const [selectedBucket, setSelectedBucket] = useState(null);

  // Form fields for create/edit
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('wallet');

  // Form fields for transfer
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDirection, setTransferDirection] = useState('allocate'); // 'allocate' (in), 'deallocate' (out)

  // Interactive Calculator State
  const [calcInput, setCalcInput] = useState('100');

  // Admin States
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentBuckets, setStudentBuckets] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassroom, setFilterClassroom] = useState('all');
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    if (isStudent()) {
      fetchSummary();
    } else if (isAdmin()) {
      fetchStudents();
    }
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/savingsbucket/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching savings buckets:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลกระปุกออมเงินได้',
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/transaction/students');
      setStudents(response.data);
      
      const classes = [...new Set(response.data.map(s => s.classroom).filter(Boolean))];
      setClassrooms(classes);
    } catch (error) {
      console.error('Error fetching students:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลรายชื่อนักเรียนได้',
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentBuckets = async (studentId) => {
    setAdminLoading(true);
    try {
      const response = await apiClient.get(`/savingsbucket/summary/${studentId}`);
      setStudentBuckets(response.data);
    } catch (error) {
      console.error('Error fetching student buckets:', error);
      setStudentBuckets(null);
      Swal.fire({
        title: 'ไม่พบข้อมูล',
        text: 'ไม่พบกระปุกออมเงินของนักเรียนคนนี้ หรือเกิดข้อผิดพลาด',
        icon: 'warning',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    fetchStudentBuckets(student.id);
  };

  // Preset Auto Allocation (50/30/20)
  const handleAutoAllocate = async () => {
    const result = await Swal.fire({
      title: 'ต้องการจัดสรรเงินอัตโนมัติ?',
      text: 'ระบบจะนำเงินออมรวมทั้งหมดของคุณไปแยกใส่ 3 กระปุกหลัก คือ เรียน (50%), ความฝัน (30%), จำเป็น (20%) ซึ่งจะทับค่าเดิมในกระปุกหลักเหล่านี้',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ตกลง, จัดสรรเลย!',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#64748b'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await apiClient.post('/savingsbucket/auto-allocate');
        setSummary(response.data);
        Swal.fire({
          title: 'จัดงบประมาณสำเร็จ! 🎉',
          text: 'เงินออมของคุณถูกจัดสรรลงกระปุกหลักเรียบร้อยแล้ว ลองเข้าไปดูสัดส่วนได้เลย',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
      } catch (error) {
        console.error('Auto allocate error:', error);
        Swal.fire({
          title: 'ไม่สามารถจัดสรรได้',
          text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการเรียกใช้บริการ',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Open Modals
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setName('');
    setDescription('');
    setIcon('wallet');
    setShowModal(true);
  };

  const handleOpenEditModal = (bucket) => {
    setModalMode('edit');
    setSelectedBucket(bucket);
    setName(bucket.name);
    setDescription(bucket.description || '');
    setIcon(bucket.icon);
    setShowModal(true);
  };

  const handleOpenTransferModal = (bucket) => {
    setModalMode('transfer');
    setSelectedBucket(bucket);
    setTransferAmount('');
    setTransferDirection('allocate');
    setShowModal(true);
  };

  // Submit Create/Edit
  const handleSaveBucket = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      Swal.fire({
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกชื่อกระปุกออมเงิน',
        icon: 'warning',
        confirmButtonColor: '#6366f1'
      });
      return;
    }

    const payload = { name, description, icon };
    setLoading(true);
    try {
      if (modalMode === 'create') {
        await apiClient.post('/savingsbucket', payload);
        Swal.fire({
          title: 'สร้างกระปุกย่อยสำเร็จ',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
      } else {
        await apiClient.put(`/savingsbucket/${selectedBucket.id}`, payload);
        Swal.fire({
          title: 'อัปเดตข้อมูลสำเร็จ',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
      }
      setShowModal(false);
      fetchSummary();
    } catch (error) {
      console.error('Save bucket error:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit Transfer
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    const amountVal = parseFloat(transferAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      Swal.fire({
        title: 'จำนวนเงินไม่ถูกต้อง',
        text: 'กรุณากรอกจำนวนเงินมากกว่า 0',
        icon: 'warning',
        confirmButtonColor: '#6366f1'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(`/savingsbucket/${selectedBucket.id}/transfer`, {
        amount: amountVal,
        direction: transferDirection
      });
      setSummary(response.data);
      setShowModal(false);
      Swal.fire({
        title: 'ดำเนินการสำเร็จ',
        text: `ทำการโอนเงิน ${amountVal.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท สำเร็จแล้ว`,
        icon: 'success',
        confirmButtonColor: '#10b981'
      });
    } catch (error) {
      console.error('Transfer error:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.message || 'ยอดเงินไม่เพียงพอ หรือคำขอไม่ถูกต้อง',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete Bucket
  const handleDeleteBucket = async (bucketId, bucketName, allocatedAmt) => {
    const result = await Swal.fire({
      title: `ลบกระปุก "${bucketName}"?`,
      text: allocatedAmt > 0 
        ? `เงินสะสมทั้งหมดในกระปุกนี้จำนวน ${allocatedAmt.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท จะถูกโอนคืนเข้าสู่กระปุกหลักอัตโนมัติ`
        : 'คุณต้องการลบกระปุกย่อยนี้ใช่หรือไม่',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await apiClient.delete(`/savingsbucket/${bucketId}`);
        Swal.fire({
          title: 'ลบกระปุกสำเร็จ',
          text: 'ลบกระปุกและคืนเงินเข้าบัญชีหลักแล้ว',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
        fetchSummary();
      } catch (error) {
        console.error('Delete bucket error:', error);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบกระปุกย่อยได้',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
        setLoading(false);
      }
    }
  };

  // Filtered Students for Admin
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClassroom === 'all' || student.classroom === filterClassroom;
    return matchesSearch && matchesClass;
  });

  // Simulator helper values
  const getSimValue = (percent) => {
    const inputVal = parseFloat(calcInput);
    if (isNaN(inputVal) || inputVal <= 0) return 0;
    return (inputVal * percent) / 100;
  };

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="page-title d-flex align-items-center gap-2 m-0 font-display fw-bold">
            <FolderHeart size={28} className="text-brand-primary" />
            ระบบกระปุกเงินออมย่อย (Envelope System)
          </h1>
          <p className="text-secondary m-0">
            {isStudent() 
              ? 'จัดงบประมาณการออม แบ่งสัดส่วนกระปุกออมเงินย่อยเพื่อตอบโจทย์ทุกความฝันและเป้าหมาย' 
              : 'สำหรับครูผู้สอน: ตรวจสอบและดูแลทักษะการจัดสรรงบประมาณ (Budgeting) ของนักเรียน'}
          </p>
        </div>
        
        {isStudent() && (
          <div className="d-flex gap-2">
            <button 
              type="button" 
              className="btn btn-outline-primary d-flex align-items-center gap-1 shadow-sm px-3 py-2 rounded-3"
              onClick={handleAutoAllocate}
              disabled={loading}
            >
              <Sparkles size={16} />
              จัดสรรอัตโนมัติ (50/30/20)
            </button>
            <button 
              type="button" 
              className="btn btn-primary d-flex align-items-center gap-1 shadow-sm px-3 py-2 rounded-3"
              onClick={handleOpenCreateModal}
              disabled={loading}
            >
              <Plus size={18} />
              สร้างกระปุกย่อยใหม่
            </button>
          </div>
        )}
      </div>

      {/* STUDENT INTERFACE */}
      {isStudent() && (
        <>
          {/* KPI Summary Cards */}
          <div className="row mb-4 g-3">
            <div className="col-md-4">
              <div className="metric-card metric-card--primary">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="metric-label">ยอดเงินออมรวมในบัญชีหลัก</span>
                    <h3 className="metric-value">
                      ฿{summary?.totalBalance?.toLocaleString('th-TH', { minimumFractionDigits: 2 }) || '0.00'}
                    </h3>
                    <span className="metric-hint">ยอดออมทั้งหมดในระบบ</span>
                  </div>
                  <div className="icon-box">
                    <Wallet size={22} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="metric-card metric-card--success">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="metric-label">จัดสรรลงกระปุกย่อยแล้ว</span>
                    <h3 className="metric-value">
                      ฿{summary?.allocatedBalance?.toLocaleString('th-TH', { minimumFractionDigits: 2 }) || '0.00'}
                    </h3>
                    <span className="metric-hint">
                      {summary?.totalBalance > 0 
                        ? `${((summary.allocatedBalance / summary.totalBalance) * 100).toFixed(0)}% ของเงินออมรวม`
                        : 'ยังไม่มีสัดส่วนการโอน'}
                    </span>
                  </div>
                  <div className="icon-box">
                    <FolderHeart size={22} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="metric-card metric-card--info">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="metric-label">เงินคงเหลือยังไม่ได้จัดสรร</span>
                    <h3 className="metric-value">
                      ฿{summary?.unallocatedBalance?.toLocaleString('th-TH', { minimumFractionDigits: 2 }) || '0.00'}
                    </h3>
                    <span className="metric-hint">รอแยกไปใส่กระปุกย่อย</span>
                  </div>
                  <div className="icon-box">
                    <Info size={22} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4 g-4">
            {/* Interactive Tutorial */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-light">
                <div className="p-4 bg-indigo text-white position-relative" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' }}>
                  <h4 className="fw-bold m-0 font-display d-flex align-items-center gap-2">
                    <HelpCircle size={20} />
                    มารู้จักการจัดงบแบบ 50/30/20
                  </h4>
                  <p className="small text-indigo-light m-0 mt-2 opacity-90">
                    วิธีการจัดสรรงบประมาณที่ง่ายและได้ผลดีที่สุด ช่วยบริหารการออมเงินโดยแบ่งความต้องการเป็น 3 ประเภท
                  </p>
                  <div className="position-absolute bottom-0 end-0 opacity-10 p-2">
                    <TrendingUp size={80} />
                  </div>
                </div>
                
                <div className="card-body p-4 d-flex flex-column gap-3">
                  <div className="d-flex gap-3 align-items-start">
                    <div className="rounded-circle bg-primary-subtle text-primary p-2 flex-shrink-0" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <strong>50%</strong>
                    </div>
                    <div>
                      <h5 className="fw-bold m-0 text-dark small" style={{ fontSize: '0.95rem' }}>กระปุกเพื่อการเรียน 📚</h5>
                      <p className="text-secondary small m-0">ใช้สำหรับค่าเทอม, อุปกรณ์การเรียน, หนังสือเรียน, ดินสอปากกา</p>
                    </div>
                  </div>

                  <div className="d-flex gap-3 align-items-start">
                    <div className="rounded-circle bg-pink-subtle text-pink p-2 flex-shrink-0" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fce7f3', color: '#db2777' }}>
                      <strong>30%</strong>
                    </div>
                    <div>
                      <h5 className="fw-bold m-0 text-dark small" style={{ fontSize: '0.95rem' }}>กระปุกตามล่าความฝัน 🎮</h5>
                      <p className="text-secondary small m-0">ใช้สำหรับของเล่น, บอร์ดเกม, ของขวัญตามใจตัวเอง, กิจกรรมบันเทิง</p>
                    </div>
                  </div>

                  <div className="d-flex gap-3 align-items-start">
                    <div className="rounded-circle bg-success-subtle text-success p-2 flex-shrink-0" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <strong>20%</strong>
                    </div>
                    <div>
                      <h5 className="fw-bold m-0 text-dark small" style={{ fontSize: '0.95rem' }}>กระปุกเงินใช้ยามจำเป็น 🩺</h5>
                      <p className="text-secondary small m-0">เงินสำรองฉุกเฉิน, ยารักษาโรคยามป่วย, ค่าเดินทางด่วน, สิ่งจำเป็นที่คาดไม่ถึง</p>
                    </div>
                  </div>

                  <hr className="my-2" />

                  {/* Simulator */}
                  <div className="bg-white p-3 rounded-3 shadow-xs border">
                    <label className="form-label text-dark fw-bold small">ทดลองคำนวณแบ่งสัดส่วนเงินออม (บาท):</label>
                    <div className="input-group input-group-sm mb-3">
                      <span className="input-group-text bg-light border-end-0">฿</span>
                      <input 
                        type="number" 
                        className="form-control bg-light border-start-0 text-dark fw-bold"
                        value={calcInput}
                        onChange={(e) => setCalcInput(e.target.value)}
                        placeholder="กรอกจำนวนเงิน"
                        min="0"
                      />
                    </div>
                    
                    <div className="d-flex flex-column gap-2 text-dark small">
                      <div className="d-flex justify-content-between">
                        <span className="text-secondary">📚 เพื่อการเรียน (50%):</span>
                        <span className="fw-bold">฿{getSimValue(50).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-secondary">🎮 ตามล่าความฝัน (30%):</span>
                        <span className="fw-bold">฿{getSimValue(30).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-secondary">🩺 เงินยามจำเป็น (20%):</span>
                        <span className="fw-bold">฿{getSimValue(20).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buckets List */}
            <div className="col-lg-8">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-brand-primary" role="status">
                    <span className="visually-hidden">กำลังโหลด...</span>
                  </div>
                  <p className="mt-2 text-secondary">กำลังโหลดข้อมูลกระปุกย่อย...</p>
                </div>
              ) : summary?.buckets?.length === 0 ? (
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white h-100 d-flex flex-column justify-content-center align-items-center">
                  <div className="p-3 bg-light rounded-circle mb-3">
                    <FolderHeart size={48} className="text-secondary" />
                  </div>
                  <h4 className="fw-bold text-dark font-display mb-2">ยังไม่มีกระปุกออมเงินย่อย</h4>
                  <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                    เริ่มสร้างวินัยทางการเงินด้วยการแยกกระปุกออมเงินของคุณ หรือคลิกปุ่ม "จัดสรรอัตโนมัติ" เพื่อเริ่มต้นใช้งานแบบแนะนำ 50/30/20
                  </p>
                  <div className="d-flex gap-2">
                    <button 
                      type="button" 
                      className="btn btn-outline-primary px-4 py-2 rounded-3"
                      onClick={handleAutoAllocate}
                    >
                      <Sparkles size={16} className="me-1" />
                      จัดสรรอัตโนมัติ (50/30/20)
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary px-4 py-2 rounded-3"
                      onClick={handleOpenCreateModal}
                    >
                      <Plus size={16} className="me-1" />
                      สร้างกระปุกแรกเลย
                    </button>
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  <h4 className="fw-bold text-dark font-display m-0 d-flex align-items-center gap-2">
                    <FolderHeart className="text-indigo" size={22} />
                    รายการกระปุกย่อยของคุณ ({summary?.buckets?.length} กระปุก)
                  </h4>
                  
                  <div className="row g-3">
                    {summary?.buckets?.map((bucket) => {
                      const percentageOfTotal = summary.totalBalance > 0 
                        ? (bucket.allocatedAmount / summary.totalBalance) * 100 
                        : 0;
                      const iconColor = iconMap[bucket.icon.toLowerCase()]?.color || '#6366f1';
                      
                      return (
                        <div className="col-md-6" key={bucket.id}>
                          <div className="card border-0 shadow-sm rounded-4 h-100 p-4 transition-card bg-white position-relative overflow-hidden">
                            {/* Decorative corner indicator */}
                            <div 
                              className="position-absolute top-0 end-0" 
                              style={{ width: '4px', height: '100%', backgroundColor: iconColor }}
                            />
                            
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div className="d-flex align-items-center gap-3">
                                <div 
                                  className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                                  style={{ backgroundColor: `${iconColor}15` }}
                                >
                                  <RenderIcon name={bucket.icon} size={24} color={iconColor} />
                                </div>
                                <div>
                                  <h5 className="fw-bold m-0 text-dark text-truncate" style={{ maxWidth: '180px' }}>{bucket.name}</h5>
                                  <span className="badge rounded-pill text-secondary bg-light mt-1" style={{ fontSize: '0.75rem' }}>
                                    คิดเป็น {percentageOfTotal.toFixed(0)}% ของยอดรวม
                                  </span>
                                </div>
                              </div>

                              <div className="d-flex gap-1">
                                <button 
                                  type="button" 
                                  className="btn btn-light btn-sm text-secondary p-1 rounded-2"
                                  onClick={() => handleOpenEditModal(bucket)}
                                  title="แก้ไข"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  type="button" 
                                  className="btn btn-light btn-sm text-danger p-1 rounded-2"
                                  onClick={() => handleDeleteBucket(bucket.id, bucket.name, bucket.allocatedAmount)}
                                  title="ลบกระปุก"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            <p className="text-secondary small text-truncate-2 mb-3" style={{ height: '38px' }}>
                              {bucket.description || 'ไม่มีคำอธิบาย'}
                            </p>

                            <div className="bg-light p-3 rounded-3 mb-3 d-flex justify-content-between align-items-center">
                              <span className="text-secondary small fw-medium">ยอดเงินสะสม:</span>
                              <span className="fw-bold text-dark font-display" style={{ fontSize: '1.25rem' }}>
                                ฿{bucket.allocatedAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="mb-3">
                              <div className="progress rounded-pill" style={{ height: '8px' }}>
                                <div 
                                  className="progress-bar rounded-pill"
                                  role="progressbar" 
                                  style={{ 
                                    width: `${percentageOfTotal}%`, 
                                    backgroundColor: iconColor
                                  }} 
                                  aria-valuenow={percentageOfTotal} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                />
                              </div>
                            </div>

                            <button 
                              type="button" 
                              className="btn btn-indigo btn-sm w-100 d-flex align-items-center justify-content-center gap-1 py-2 rounded-3"
                              onClick={() => handleOpenTransferModal(bucket)}
                            >
                              <ArrowRightLeft size={14} />
                              โอนเงินเข้า / ออก
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ADMIN INTERFACE */}
      {isAdmin() && (
        <div className="row g-4">
          {/* Students Sidebar Filter */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h4 className="fw-bold text-dark font-display mb-3 d-flex align-items-center gap-2">
                <Search size={20} className="text-brand-primary" />
                ค้นหานักเรียน
              </h4>
              
              <div className="mb-3">
                <label className="form-label text-dark fw-bold small">ค้นหาด้วยชื่อหรือรหัสผ่าน:</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-secondary"><Search size={16} /></span>
                  <input 
                    type="text" 
                    className="form-control bg-light border-start-0" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="พิมพ์ชื่อ หรือรหัสนักเรียน..."
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-dark fw-bold small">ชั้นเรียน / ห้อง:</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-secondary"><Filter size={16} /></span>
                  <select 
                    className="form-select bg-light border-start-0" 
                    value={filterClassroom}
                    onChange={(e) => setFilterClassroom(e.target.value)}
                  >
                    <option value="all">ทั้งหมดทุกชั้นเรียน</option>
                    {classrooms.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <hr />

              <h5 className="fw-bold text-dark small mb-2">รายชื่อนักเรียน ({filteredStudents.length} คน)</h5>
              <div className="student-scroll-list d-flex flex-column gap-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-4 text-secondary small">ไม่พบข้อมูลนักเรียน</div>
                ) : (
                  filteredStudents.map((student) => {
                    const isSelected = selectedStudent?.id === student.id;
                    return (
                      <button 
                        key={student.id}
                        type="button"
                        className={`btn btn-light text-start p-3 rounded-3 d-flex justify-content-between align-items-center border-0 ${isSelected ? 'bg-primary-subtle text-primary fw-bold' : ''}`}
                        onClick={() => handleSelectStudent(student)}
                      >
                        <div>
                          <div className="text-truncate" style={{ maxWidth: '180px' }}>{student.fullName}</div>
                          <div className="text-secondary small mt-1">ห้อง {student.classroom || 'ไม่ระบุ'} | ID: {student.username}</div>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <span className="badge user-badge rounded-pill text-indigo" style={{ fontSize: '0.75rem', backgroundColor: '#e0e7ff' }}>
                            ฿{student.balance.toLocaleString('th-TH')}
                          </span>
                          <ChevronRight size={16} />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Student Buckets Detail View */}
          <div className="col-lg-8">
            {!selectedStudent ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white h-100 d-flex flex-column justify-content-center align-items-center min-h-[450px]">
                <div className="p-3 bg-light rounded-circle mb-3">
                  <FolderHeart size={48} className="text-secondary" />
                </div>
                <h4 className="fw-bold text-dark font-display mb-2">ยังไม่ได้เลือกนักเรียน</h4>
                <p className="text-secondary m-0" style={{ maxWidth: '380px' }}>
                  กรุณาเลือกรายชื่อนักเรียนทางแถบด้านซ้าย เพื่อตรวจสอบประวัติและการจัดสรรงบประมาณกระปุกเงินออมย่อย
                </p>
              </div>
            ) : adminLoading ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white h-100 d-flex flex-column justify-content-center align-items-center">
                <div className="spinner-border text-brand-primary mb-3" role="status">
                  <span className="visually-hidden">กำลังโหลด...</span>
                </div>
                <p className="text-secondary">กำลังดึงข้อมูลการแบ่งสัดส่วนกระปุกออมเงินของ {selectedStudent.fullName}...</p>
              </div>
            ) : !studentBuckets ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white h-100 d-flex flex-column justify-content-center align-items-center">
                <div className="p-3 bg-light rounded-circle mb-3">
                  <Info size={36} className="text-warning" />
                </div>
                <h4 className="fw-bold text-dark font-display mb-2">ไม่พบกระปุกออมเงิน</h4>
                <p className="text-secondary">นักเรียนท่านนี้ยังไม่มีข้อมูลกระปุกเงินออมย่อยในระบบ</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {/* Student Info & KPI header */}
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h4 className="fw-bold text-dark font-display m-0">กระปุกเงินออมย่อยของ {selectedStudent.fullName}</h4>
                      <p className="text-secondary small m-0 mt-1">ห้อง {selectedStudent.classroom} | ID: {selectedStudent.username}</p>
                    </div>
                    <span className="badge bg-indigo rounded-pill px-3 py-2">
                      ยอดคงเหลือในบัญชี: ฿{selectedStudent.balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="row g-2 text-dark small mt-2">
                    <div className="col-4 border-end text-center">
                      <div className="text-secondary small">จัดสรรแล้ว:</div>
                      <div className="fw-bold mt-1 text-success font-display" style={{ fontSize: '1.1rem' }}>
                        ฿{studentBuckets.allocatedBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-secondary" style={{ fontSize: '0.7rem' }}>
                        ({selectedStudent.balance > 0 ? ((studentBuckets.allocatedBalance / selectedStudent.balance) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                    <div className="col-4 border-end text-center">
                      <div className="text-secondary small">ไม่ได้จัดสรร:</div>
                      <div className="fw-bold mt-1 text-info font-display" style={{ fontSize: '1.1rem' }}>
                        ฿{studentBuckets.unallocatedBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-secondary" style={{ fontSize: '0.7rem' }}>
                        ({selectedStudent.balance > 0 ? ((studentBuckets.unallocatedBalance / selectedStudent.balance) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                    <div className="col-4 text-center">
                      <div className="text-secondary small">กระปุกย่อยที่มี:</div>
                      <div className="fw-bold mt-1 text-brand-primary font-display" style={{ fontSize: '1.1rem' }}>
                        {studentBuckets.buckets.length} กระปุก
                      </div>
                      <span className="text-secondary" style={{ fontSize: '0.7rem' }}>ในระบบทั้งหมด</span>
                    </div>
                  </div>
                </div>

                {/* Student Buckets Detail Grid */}
                <h5 className="fw-bold text-dark font-display m-0 mt-2">การแบ่งกระปุกย่อยของนักเรียน:</h5>
                {studentBuckets.buckets.length === 0 ? (
                  <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                    <p className="text-secondary m-0">นักเรียนคนนี้ยังไม่ได้ทำการสร้างกระปุกออมเงินย่อย</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {studentBuckets.buckets.map((bucket) => {
                      const percentageOfTotal = selectedStudent.balance > 0 
                        ? (bucket.allocatedAmount / selectedStudent.balance) * 100 
                        : 0;
                      const iconColor = iconMap[bucket.icon.toLowerCase()]?.color || '#6366f1';
                      
                      return (
                        <div className="col-md-6" key={bucket.id}>
                          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white position-relative overflow-hidden">
                            <div 
                              className="position-absolute top-0 end-0" 
                              style={{ width: '4px', height: '100%', backgroundColor: iconColor }}
                            />

                            <div className="d-flex align-items-center gap-3 mb-2">
                              <div 
                                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: `${iconColor}15` }}
                              >
                                <RenderIcon name={bucket.icon} size={20} color={iconColor} />
                              </div>
                              <div className="text-truncate">
                                <h5 className="fw-bold m-0 text-dark small" style={{ fontSize: '1rem' }}>{bucket.name}</h5>
                                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                  คิดเป็น {percentageOfTotal.toFixed(0)}% ของยอดรวม
                                </span>
                              </div>
                            </div>

                            <p className="text-secondary small mb-3 text-truncate-2" style={{ height: '36px', fontSize: '0.825rem' }}>
                              {bucket.description || 'ไม่มีคำอธิบาย'}
                            </p>

                            <div className="bg-light p-2 rounded-2 mb-2 d-flex justify-content-between align-items-center">
                              <span className="text-secondary small" style={{ fontSize: '0.8rem' }}>ยอดออมสะสม:</span>
                              <span className="fw-bold text-dark font-display" style={{ fontSize: '1.15rem' }}>
                                ฿{bucket.allocatedAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                              </span>
                            </div>

                            <div className="progress rounded-pill" style={{ height: '6px' }}>
                              <div 
                                className="progress-bar rounded-pill" 
                                role="progressbar" 
                                style={{ 
                                  width: `${percentageOfTotal}%`, 
                                  backgroundColor: iconColor
                                }} 
                                aria-valuenow={percentageOfTotal} 
                                aria-valuemin="0" 
                                aria-valuemax="100"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOOTSTRAP MODALS */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              
              {/* MODAL HEADER */}
              <div className="modal-header bg-indigo text-white border-0 py-3" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
                <h5 className="modal-title font-display fw-bold">
                  {modalMode === 'create' && 'สร้างกระปุกออมเงินย่อยใหม่ 🗂️'}
                  {modalMode === 'edit' && `แก้ไขกระปุก "${selectedBucket?.name}" ✏️`}
                  {modalMode === 'transfer' && `โอนเงินระหว่างกระปุกย่อย 💸`}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                />
              </div>

              {/* MODAL BODY */}
              <div className="modal-body p-4 bg-white text-dark">
                {modalMode === 'transfer' ? (
                  // Transfer Form
                  <form onSubmit={handleTransferSubmit}>
                    <div className="mb-3">
                      <label className="form-label text-dark fw-bold small">ทิศทางการโอนย้ายเงิน:</label>
                      <div className="row g-2">
                        <div className="col-6">
                          <button
                            type="button"
                            className={`btn w-100 py-3 rounded-3 d-flex flex-column align-items-center gap-1 border ${transferDirection === 'allocate' ? 'btn-primary border-primary' : 'btn-light text-secondary'}`}
                            onClick={() => setTransferDirection('allocate')}
                          >
                            <span style={{ fontSize: '1.3rem' }}>📥</span>
                            <span className="small fw-bold">โอนเข้ากระปุกย่อย</span>
                            <span className="text-secondary" style={{ fontSize: '0.65rem' }}>ดึงเงินออกจากบัญชีหลัก</span>
                          </button>
                        </div>
                        <div className="col-6">
                          <button
                            type="button"
                            className={`btn w-100 py-3 rounded-3 d-flex flex-column align-items-center gap-1 border ${transferDirection === 'deallocate' ? 'btn-primary border-primary' : 'btn-light text-secondary'}`}
                            onClick={() => setTransferDirection('deallocate')}
                          >
                            <span style={{ fontSize: '1.3rem' }}>📤</span>
                            <span className="small fw-bold">โอนกลับบัญชีหลัก</span>
                            <span className="text-secondary" style={{ fontSize: '0.65rem' }}>คืนเงินสู่ยอดออมหลัก</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 bg-light p-3 rounded-3 text-secondary small">
                      {transferDirection === 'allocate' ? (
                        <div>
                          ยอดเงินในบัญชีหลักที่พร้อมจัดสรร: <strong className="text-dark font-display">฿{summary?.unallocatedBalance?.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong>
                        </div>
                      ) : (
                        <div>
                          ยอดเงินคงเหลือในกระปุก "{selectedBucket?.name}": <strong className="text-dark font-display">฿{selectedBucket?.allocatedAmount?.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="transferAmt" className="form-label text-dark fw-bold small">จำนวนเงินที่ต้องการโอน (บาท):</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-secondary">฿</span>
                        <input
                          type="number"
                          id="transferAmt"
                          className="form-control bg-light border-start-0 text-dark fw-bold font-display"
                          style={{ fontSize: '1.2rem' }}
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                      <button type="button" className="btn btn-light w-50 py-2 rounded-3" onClick={() => setShowModal(false)}>
                        ยกเลิก
                      </button>
                      <button type="submit" className="btn btn-primary w-50 py-2 rounded-3" disabled={loading}>
                        ยืนยันการโอนเงิน
                      </button>
                    </div>
                  </form>
                ) : (
                  // Create or Edit Form
                  <form onSubmit={handleSaveBucket}>
                    <div className="mb-3">
                      <label htmlFor="bucketName" className="form-label text-dark fw-bold small">ชื่อกระปุกออมเงิน:</label>
                      <input 
                        type="text" 
                        id="bucketName"
                        className="form-control bg-light border" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="เช่น เพื่อซื้อหนังสือสอบ, ทริปทัศนศึกษา..."
                        required
                        maxLength={100}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="bucketDesc" className="form-label text-dark fw-bold small">คำอธิบายเพิ่มเติม:</label>
                      <textarea 
                        id="bucketDesc"
                        className="form-control bg-light border" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="รายละเอียดเป้าหมาย หรือประโยคที่ช่วยสร้างแรงบันดาลใจ..."
                        rows="3"
                        maxLength={500}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-dark fw-bold small">เลือกไอคอนกระปุก:</label>
                      <div className="icon-grid d-flex flex-wrap gap-2 p-3 bg-light rounded-3 border" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        {Object.keys(iconMap).map((iconKey) => {
                          const iconInfo = iconMap[iconKey];
                          const isSelected = icon === iconKey;
                          return (
                            <button
                              key={iconKey}
                              type="button"
                              className={`btn p-2 rounded-3 border-0 d-flex flex-column align-items-center justify-content-center gap-1 ${isSelected ? 'bg-primary text-white shadow-sm' : 'bg-white text-secondary'}`}
                              style={{ width: '80px', height: '65px', fontSize: '0.65rem' }}
                              onClick={() => setIcon(iconKey)}
                            >
                              <RenderIcon name={iconKey} size={18} color={isSelected ? '#ffffff' : iconInfo.color} />
                              <span className="text-truncate fw-medium w-100" style={{ fontSize: '0.625rem' }}>
                                {iconInfo.label.split(' ')[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                      <button type="button" className="btn btn-light w-50 py-2 rounded-3" onClick={() => setShowModal(false)}>
                        ยกเลิก
                      </button>
                      <button type="submit" className="btn btn-primary w-50 py-2 rounded-3" disabled={loading}>
                        {modalMode === 'create' ? 'สร้างกระปุกย่อย' : 'บันทึกการแก้ไข'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsBuckets;
