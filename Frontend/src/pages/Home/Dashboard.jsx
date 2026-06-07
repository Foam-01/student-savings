import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../config/apiClient';
import TransactionModal from '../../components/Modal/TransactionModal';
import { DollarSign, Users, TrendingUp, ArrowDownUp, Plus, Calendar, Activity, PieChart } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import Swal from 'sweetalert2';
import FinancialInsights from '../../components/FinancialInsights/FinancialInsights';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const { user, isAdmin, isStudent } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days'); // 7days, 30days, 90days

  useEffect(() => {
    fetchDashboardData();
    if (isAdmin()) {
      fetchRecentTransactions();
    } else if (isStudent()) {
      fetchStudentTransactions();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (isAdmin()) {
        const response = await apiClient.get('/transaction/dashboard');
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await apiClient.get('/transaction/recent?count=10');
      setRecentTransactions(response.data);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
    }
  };

  const fetchStudentTransactions = async () => {
    try {
      const response = await apiClient.get(`/transaction/student/${user?.id}`);
      setRecentTransactions(response.data);
    } catch (error) {
      console.error('Error fetching student transactions:', error);
    }
  };

  const handleTransactionSuccess = () => {
    setShowTransactionModal(false);
    fetchDashboardData();
    fetchRecentTransactions();
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

  const monthlyStats = dashboardData?.monthlyStatistics ?? dashboardData?.MonthlyStatistics ?? [];

  const chartData = {
    labels: monthlyStats.length
      ? monthlyStats.map((s) => s.month ?? s.Month)
      : ['ไม่มีข้อมูล'],
    datasets: [
      {
        label: 'ฝากเงิน',
        data: monthlyStats.map((s) => s.depositAmount ?? s.DepositAmount ?? 0),
        backgroundColor: 'rgba(79, 70, 229, 0.85)',
        borderColor: 'rgba(67, 56, 202, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'ถอนเงิน',
        data: monthlyStats.map((s) => s.withdrawAmount ?? s.WithdrawAmount ?? 0),
        backgroundColor: 'rgba(244, 63, 94, 0.75)',
        borderColor: 'rgba(225, 29, 72, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14, family: 'Sarabun' },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'สถิติรายเดือน',
        font: { size: 18, family: 'Sarabun', weight: 'bold' },
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  // Doughnut chart for transaction types
  const doughnutData = {
    labels: ['ฝากเงิน', 'ถอนเงิน'],
    datasets: [
      {
        data: [
          dashboardData?.totalDeposits || 80000,
          dashboardData?.totalWithdrawals || 28000,
        ],
        backgroundColor: [
          'rgba(79, 70, 229, 0.85)',
          'rgba(244, 63, 94, 0.8)',
        ],
        borderColor: [
          'rgba(67, 56, 202, 1)',
          'rgba(225, 29, 72, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 14, family: 'Sarabun' },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'สัดส่วนรายการ',
        font: { size: 16, family: 'Sarabun', weight: 'bold' },
        padding: 15,
      },
    },
  };

  if (loading) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="spinner-border" aria-hidden="true" />
        <p>กำลังโหลดแดชบอร์ด...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="page-header d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <h1 className="page-title">แดชบอร์ด</h1>
          <p className="page-subtitle">ภาพรวมระบบออมทรัพย์นักเรียน</p>
        </div>
        {isAdmin() && (
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-primary"
              onClick={() => setTimeRange(timeRange === '7days' ? '30days' : '7days')}
            >
              <Calendar size={18} className="me-2" />
              {timeRange === '7days' ? '7 วัน' : '30 วัน'}
            </button>
            <button 
              className="btn btn-success"
              onClick={() => setShowTransactionModal(true)}
            >
              <Plus size={18} className="me-2" />
              ทำรายการใหม่
            </button>
          </div>
        )}
      </header>

      {isAdmin() && dashboardData && (
        <div className="row mb-4 g-3">
          <div className="col-xl-3 col-lg-6 col-md-6">
            <div className="metric-card metric-card--primary">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="metric-label">ยอดเงินออมรวม</p>
                  <p className="metric-value">{formatCurrency(dashboardData.totalBalance)}</p>
                  <span className="metric-hint text-muted">
                    เฉลี่ย {formatCurrency(dashboardData.averageBalance ?? 0)} / คน
                  </span>
                </div>
                <div className="icon-box icon-box--primary">
                  <DollarSign size={26} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 col-md-6">
            <div className="metric-card metric-card--success">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="metric-label">จำนวนนักเรียน</p>
                  <p className="metric-value">{dashboardData.totalStudents}</p>
                  <span className="metric-hint text-muted">
                    <Users size={14} aria-hidden="true" />
                    {dashboardData.classroomSummaries?.length ?? 0} ห้องเรียน
                  </span>
                </div>
                <div className="icon-box icon-box--success">
                  <Users size={26} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 col-md-6">
            <div className="metric-card metric-card--info">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="metric-label">รายการทั้งหมด</p>
                  <p className="metric-value">{dashboardData.totalTransactions}</p>
                  <span className="metric-hint text-muted">
                    <Activity size={14} aria-hidden="true" />
                    วันนี้ {dashboardData.todayTransactions ?? 0} รายการ
                  </span>
                </div>
                <div className="icon-box icon-box--info">
                  <Activity size={26} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 col-md-6">
            <div className="metric-card metric-card--warning">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="metric-label">ยอดสุทธิ</p>
                  <p className="metric-value">
                    {formatCurrency(dashboardData.totalDeposits - dashboardData.totalWithdrawals)}
                  </p>
                  <span className="metric-hint text-warning">
                    <ArrowDownUp size={14} aria-hidden="true" />
                    ฝากมากกว่าถอน
                  </span>
                </div>
                <div className="icon-box icon-box--warning">
                  <ArrowDownUp size={26} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isStudent() && (
        <div className="row mb-4 g-3">
          <div className="col-md-6 col-lg-4 mb-3">
            <div className="metric-card metric-card--primary">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="metric-label">ยอดเงินออมของคุณ</p>
                  <p className="metric-value">{formatCurrency(user?.balance || 0)}</p>
                  <span className="metric-hint text-success">
                    <TrendingUp size={14} aria-hidden="true" />
                    เพิ่มขึ้นจากเดือนที่แล้ว
                  </span>
                </div>
                <div className="icon-box icon-box--primary">
                  <DollarSign size={26} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-8 mb-3">
            <FinancialInsights />
          </div>
        </div>
      )}

      <div className="row">
        {/* Main Chart */}
        {isAdmin() && monthlyStats.length > 0 && (
          <div className="col-lg-8 mb-4">
            <div className="card modern-card chart-card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h5 fw-bold mb-0">สถิติรายเดือน</h2>
                  <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3">2026</span>
                </div>
                <div style={{ height: '300px' }}>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doughnut Chart */}
        {isAdmin() && dashboardData && (
          <div className="col-lg-4 mb-4">
            <div className="card modern-card chart-card h-100">
              <div className="card-body">
                <h2 className="h5 fw-bold mb-3">สัดส่วนรายการ</h2>
                <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
                <div className="mt-3 text-center">
                  <div className="d-flex justify-content-around">
                    <div>
                      <small className="text-muted d-block">ฝาก</small>
                      <span className="fw-bold text-success">{formatCurrency(dashboardData.totalDeposits)}</span>
                    </div>
                    <div>
                      <small className="text-muted d-block">ถอน</small>
                      <span className="fw-bold text-danger">{formatCurrency(dashboardData.totalWithdrawals)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isAdmin() && dashboardData?.topStudents?.length > 0 && (
          <div className="col-lg-12 mb-4">
            <div className="card modern-card">
              <div className="card-body">
                <h2 className="h5 fw-bold mb-3">อันดับนักเรียนออมสูงสุด</h2>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>ห้อง</th>
                        <th>ยอดออม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.topStudents.slice(0, 5).map((s, i) => (
                        <tr key={s.id}>
                          <td><span className="badge bg-light text-dark">{i + 1}</span></td>
                          <td className="fw-semibold">{s.fullName ?? s.FullName}</td>
                          <td><span className="badge text-bg-light border">{s.classroom ?? s.Classroom ?? '-'}</span></td>
                          <td className="fw-bold text-success">{formatCurrency(s.balance ?? s.Balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={isAdmin() ? 'col-lg-12' : 'col-12'}>
          <div className="card modern-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 fw-bold mb-0">รายการล่าสุด</h2>
                {isAdmin() && (
                  <button className="btn btn-sm btn-outline-primary">
                    ดูทั้งหมด
                  </button>
                )}
              </div>
              {recentTransactions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ประเภท</th>
                        <th>นักเรียน</th>
                        <th>จำนวนเงิน</th>
                        <th>วันที่</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <span className={`badge ${
                              transaction.transactionType === 'Deposit' 
                                ? 'bg-success' 
                                : 'bg-danger'
                            }`}>
                              {transaction.transactionType === 'Deposit' ? 'ฝาก' : 'ถอน'}
                            </span>
                          </td>
                          <td>{transaction.studentName || '-'}</td>
                          <td className="fw-bold">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="text-muted small">
                            {formatDate(transaction.transactionDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <PieChart size={56} className="text-muted" aria-hidden="true" />
                  <p className="text-muted mb-0">ยังไม่มีรายการ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <TransactionModal
          show={showTransactionModal}
          onHide={() => setShowTransactionModal(false)}
          onSuccess={handleTransactionSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
