import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../config/apiClient';
import { Search, Filter, Download, Calendar, ArrowUpDown, Trash2, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

const Transactions = () => {
  const { isAdmin } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    if (!isAdmin()) return;
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await apiClient.get('/transaction/recent?count=1000');
      setTransactions(response.data);
      setFilteredTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลรายการได้',
        icon: 'error',
        confirmButtonColor: '#667eea'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = transactions.filter(transaction => {
      const matchesSearch = transaction.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' ||
                        (filterType === 'Deposit' && transaction.transactionType === 'Deposit') ||
                        (filterType === 'Withdraw' && transaction.transactionType === 'Withdraw');
      
      let matchesDate = true;
      if (filterDateRange !== 'all') {
        const transactionDate = new Date(transaction.transactionDate);
        const now = new Date();
        const daysAgo = filterDateRange === '7days' ? 7 : 
                        filterDateRange === '30days' ? 30 : 
                        filterDateRange === '90days' ? 90 : 0;
        const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));
        matchesDate = transactionDate >= cutoffDate;
      }

      return matchesSearch && matchesType && matchesDate;
    });
    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterType, filterDateRange, transactions]);

  const handleDeleteTransaction = async (transactionId) => {
    const result = await Swal.fire({
      title: 'ต้องการลบรายการ?',
      text: 'การลบรายการจะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#667eea',
      confirmButtonText: 'ใช่, ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/transaction/${transactionId}`);
        Swal.fire({
          title: 'ลบสำเร็จ',
          text: 'ลบรายการเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#667eea'
        });
        fetchTransactions();
      } catch (error) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบรายการได้',
          icon: 'error',
          confirmButtonColor: '#667eea'
        });
      }
    }
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  const handleExportTransactions = () => {
    const csvContent = [
      ['รหัส', 'ประเภท', 'นักเรียน', 'จำนวนเงิน', 'วันที่'],
      ...filteredTransactions.map(t => [
        t.id,
        t.transactionType === 'Deposit' ? 'ฝาก' : 'ถอน',
        t.studentName || '-',
        t.amount,
        new Date(t.transactionDate).toLocaleDateString('th-TH')
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'transactions.csv';
    link.click();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

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
    <div className="transactions-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">จัดการรายการ</h2>
          <p className="text-muted mb-0">ประวัติรายการฝาก-ถอนทั้งหมด</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary"
            onClick={handleExportTransactions}
          >
            <Download size={18} className="me-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
          <div className="metric-card metric-card--info">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="metric-label">รายการทั้งหมด</p>
                <h3 className="metric-value fw-bold mb-0">{transactions.length}</h3>
                <small className="metric-hint">รายการ</small>
              </div>
              <div className="icon-box">
                <Calendar size={28} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
          <div className="metric-card metric-card--success">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="metric-label">รายการฝาก</p>
                <h3 className="metric-value fw-bold mb-0">
                  {transactions.filter(t => t.transactionType === 'Deposit').length}
                </h3>
                <small className="metric-hint">รายการ</small>
              </div>
              <div className="icon-box">
                <ArrowUpDown size={28} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
          <div className="metric-card metric-card--danger">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="metric-label">รายการถอน</p>
                <h3 className="metric-value fw-bold mb-0">
                  {transactions.filter(t => t.transactionType === 'Withdraw').length}
                </h3>
                <small className="metric-hint">รายการ</small>
              </div>
              <div className="icon-box">
                <ArrowUpDown size={28} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
          <div className="metric-card metric-card--warning">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="metric-label">ยอดรวม</p>
                <h3 className="metric-value fw-bold mb-0">
                  {formatCurrency(
                    transactions.reduce((sum, t) => 
                      t.transactionType === 'Deposit' ? sum + t.amount : sum - t.amount, 0
                    )
                  )}
                </h3>
                <small className="metric-hint">สุทธิ</small>
              </div>
              <div className="icon-box">
                <ArrowUpDown size={28} />
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
                  placeholder="ค้นหาชื่อนักเรียน..."
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
                <option value="all">ทั้งหมด</option>
                <option value="Deposit">ฝากเงิน</option>
                <option value="Withdraw">ถอนเงิน</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
              >
                <option value="all">ทุกช่วงเวลา</option>
                <option value="7days">7 วันล่าสุด</option>
                <option value="30days">30 วันล่าสุด</option>
                <option value="90days">90 วันล่าสุด</option>
              </select>
            </div>
            <div className="col-md-2">
              <div className="text-muted small">
                {filteredTransactions.length} รายการ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card modern-card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : paginatedTransactions.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>รหัส</th>
                      <th>ประเภท</th>
                      <th>นักเรียน</th>
                      <th>จำนวนเงิน</th>
                      <th>วันที่</th>
                      <th>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          <span className="badge bg-light text-dark">#{transaction.id}</span>
                        </td>
                        <td>
                          <span className={`badge ${
                            transaction.transactionType === 'Deposit' 
                              ? 'bg-success' 
                              : 'bg-danger'
                          }`}>
                            {transaction.transactionType === 'Deposit' ? 'ฝาก' : 'ถอน'}
                          </span>
                        </td>
                        <td className="fw-bold">{transaction.studentName || '-'}</td>
                        <td className="fw-bold">
                          <span className={transaction.transactionType === 'Deposit' ? 'text-success' : 'text-danger'}>
                            {transaction.transactionType === 'Deposit' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="text-muted small">
                          {formatDate(transaction.transactionDate)}
                        </td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleViewTransaction(transaction)}
                              title="ดูรายละเอียด"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteTransaction(transaction.id)}
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
            <div className="text-center py-5">
              <Calendar size={48} className="text-muted mb-3" />
              <p className="text-muted">ไม่พบรายการ</p>
            </div>
          )}
        </div>
      </div>

      {/* View Transaction Modal */}
      {showViewModal && selectedTransaction && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">รายละเอียดรายการ</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="text-muted small">รหัสรายการ</label>
                  <p className="fw-bold">#{selectedTransaction.id}</p>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">ประเภท</label>
                  <p className="fw-bold">
                    <span className={`badge ${
                      selectedTransaction.transactionType === 'Deposit' 
                        ? 'bg-success' 
                        : 'bg-danger'
                    }`}>
                      {selectedTransaction.transactionType === 'Deposit' ? 'ฝากเงิน' : 'ถอนเงิน'}
                    </span>
                  </p>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">นักเรียน</label>
                  <p className="fw-bold">{selectedTransaction.studentName || '-'}</p>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">จำนวนเงิน</label>
                  <p className="fw-bold">
                    <span className={selectedTransaction.transactionType === 'Deposit' ? 'text-success' : 'text-danger'}>
                      {selectedTransaction.transactionType === 'Deposit' ? '+' : '-'}
                      {formatCurrency(selectedTransaction.amount)}
                    </span>
                  </p>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">วันที่</label>
                  <p className="fw-bold">{formatDate(selectedTransaction.transactionDate)}</p>
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
    </div>
  );
};

export default Transactions;
