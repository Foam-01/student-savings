import React, { useState, useEffect } from 'react';
import apiClient from '../../config/apiClient';
import Swal from 'sweetalert2';

const TransactionModal = ({ show, onHide, onSuccess }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [transactionType, setTransactionType] = useState('Deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [scanMode, setScanMode] = useState(false);

  useEffect(() => {
    if (show) {
      fetchStudents();
    }
  }, [show]);

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get('/transaction/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลนักเรียนได้',
        icon: 'error',
        confirmButtonColor: '#667eea'
      });
    }
  };

  const handleQrCodeScan = async () => {
    if (!qrCode.trim()) {
      Swal.fire({
        title: 'กรุณากรอก QR Code',
        text: 'กรุณากรอกข้อมูล QR Code',
        icon: 'warning',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    try {
      const response = await apiClient.get(`/transaction/student/by-qr/${qrCode.trim()}`);
      setSelectedStudent(response.data.id);
      setScanMode(false);
      Swal.fire({
        title: 'พบนักเรียน',
        text: `พบนักเรียน: ${response.data.fullName}`,
        icon: 'success',
        confirmButtonColor: '#667eea'
      });
    } catch (error) {
      Swal.fire({
        title: 'ไม่พบนักเรียน',
        text: 'ไม่พบนักเรียนจาก QR Code ที่ระบุ',
        icon: 'error',
        confirmButtonColor: '#667eea'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudent || !amount) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูลให้ครบ',
        text: 'กรุณาเลือกนักเรียนและกรอกจำนวนเงิน',
        icon: 'warning',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (amountValue <= 0) {
      Swal.fire({
        title: 'จำนวนเงินไม่ถูกต้อง',
        text: 'กรุณากรอกจำนวนเงินที่มากกว่า 0',
        icon: 'warning',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    setLoading(true);

    // Show loading
    Swal.fire({
      title: 'กำลังบันทึกข้อมูล...',
      text: 'กรุณารอสักครู่',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      await apiClient.post('/transaction/create', {
        studentId: parseInt(selectedStudent),
        transactionType: transactionType,
        amount: amountValue,
        description: description || undefined
      });

      Swal.close();
      Swal.fire({
        title: 'บันทึกข้อมูลสำเร็จ',
        text: 'บันทึกรายการเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonColor: '#667eea'
      }).then(() => {
        onSuccess();
        resetForm();
      });
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้',
        icon: 'error',
        confirmButtonColor: '#667eea'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedStudent('');
    setTransactionType('Deposit');
    setAmount('');
    setDescription('');
    setQrCode('');
    setScanMode(false);
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">ทำรายการฝาก/ถอนเงิน</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* QR Code Scan Mode */}
              <div className="mb-3">
                <button
                  type="button"
                  className={`btn w-100 mb-3 ${scanMode ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setScanMode(!scanMode)}
                >
                  {scanMode ? 'ยกเลิกการสแกน QR Code' : 'สแกน QR Code นักเรียน'}
                </button>

                {scanMode && (
                  <div className="card p-3 mb-3">
                    <div className="mb-3">
                      <label className="form-label fw-bold">กรอก QR Code</label>
                      <div className="d-flex gap-2">
                        <input
                          type="text"
                          className="form-control"
                          value={qrCode}
                          onChange={(e) => setQrCode(e.target.value)}
                          placeholder="กรอก QR Code ที่นี่"
                        />
                        <button type="button" className="btn btn-success" onClick={handleQrCodeScan}>
                          ตรวจสอบ
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!scanMode && (
                <>
                  <div className="mb-3">
                    <label className="form-label fw-bold">เลือกนักเรียน</label>
                    <select
                      className="form-select"
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      required
                    >
                      <option value="">-- เลือกนักเรียน --</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.fullName} (ยอด: {new Intl.NumberFormat('th-TH', {
                            style: 'currency',
                            currency: 'THB'
                          }).format(student.balance)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">ประเภทรายการ</label>
                    <div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="transactionType"
                          id="deposit"
                          value="Deposit"
                          checked={transactionType === 'Deposit'}
                          onChange={(e) => setTransactionType(e.target.value)}
                        />
                        <label className="form-check-label" htmlFor="deposit">
                          ฝากเงิน
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="transactionType"
                          id="withdraw"
                          value="Withdraw"
                          checked={transactionType === 'Withdraw'}
                          onChange={(e) => setTransactionType(e.target.value)}
                        />
                        <label className="form-check-label" htmlFor="withdraw">
                          ถอนเงิน
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">จำนวนเงิน (บาท)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="กรอกจำนวนเงิน"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">รายละเอียด (ถ้ามี)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="กรอกรายละเอียดเพิ่มเติม (ถ้ามี)"
                    ></textarea>
                  </div>
                </>
              )}
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
              ยกเลิก
            </button>
            {!scanMode && (
              <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
