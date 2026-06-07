import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../config/apiClient';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Users, Printer } from 'lucide-react';
import Swal from 'sweetalert2';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Reports = () => {
  const { isAdmin } = useAuth();
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) return;
    fetchReportData();
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/reports/detail?range=${dateRange}`);
      setReportData(response.data?.summary ? response.data : { summary: response.data });
    } catch (error) {
      console.error('Error fetching report data:', error);
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

  const summary = reportData?.summary ?? reportData ?? {};
  const monthly = reportData?.monthlyStatistics ?? summary?.monthlyStatistics ?? [];

  const handleExportReport = () => {
    const reportContent = [
      ['รายงานสรุประบบออมทรัพย์นักเรียน'],
      [''],
      ['ยอดเงินออมรวม', reportData?.summary?.totalBalance ?? summary?.totalBalance ?? 0],
      ['จำนวนนักเรียน', reportData?.summary?.totalStudents ?? summary?.totalStudents ?? 0],
      ['รายการทั้งหมด', reportData?.summary?.totalTransactions ?? summary?.totalTransactions ?? 0],
      ['ยอดฝากรวม', reportData?.summary?.totalDeposits ?? summary?.totalDeposits ?? 0],
      ['ยอดถอนรวม', reportData?.summary?.totalWithdrawals ?? summary?.totalWithdrawals ?? 0],
      [''],
      ['สร้างเมื่อ', new Date().toLocaleString('th-TH')]
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([reportContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrintReport = () => {
    window.print();
  };

  const summaryChartData = {
    labels: ['ฝากเงิน', 'ถอนเงิน', 'ยอดสุทธิ'],
    datasets: [{
      data: [
        summary?.totalDeposits || 0,
        summary?.totalWithdrawals || 0,
        (summary?.totalDeposits || 0) - (summary?.totalWithdrawals || 0)
      ],
      backgroundColor: [
        'rgba(17, 153, 142, 0.8)',
        'rgba(235, 51, 73, 0.8)',
        'rgba(102, 126, 234, 0.8)'
      ],
      borderColor: [
        'rgba(17, 153, 142, 1)',
        'rgba(235, 51, 73, 1)',
        'rgba(102, 126, 234, 1)'
      ],
      borderWidth: 2
    }]
  };

  const monthlyChartData = {
    labels: monthly.map((s) => s.month ?? s.Month) || [],
    datasets: [
      {
        label: 'ฝากเงิน',
        data: monthly.map((s) => s.depositAmount ?? s.DepositAmount ?? 0) || [],
        backgroundColor: 'rgba(17, 153, 142, 0.8)',
        borderColor: 'rgba(17, 153, 142, 1)',
        borderWidth: 2,
        borderRadius: 8
      },
      {
        label: 'ถอนเงิน',
        data: monthly.map((s) => s.withdrawAmount ?? s.WithdrawAmount ?? 0) || [],
        backgroundColor: 'rgba(235, 51, 73, 0.8)',
        borderColor: 'rgba(235, 51, 73, 1)',
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  const trendChartData = {
    labels: monthly.map((s) => s.month ?? s.Month) || [],
    datasets: [{
      label: 'ยอดรวม',
      data: monthly.map((s) => (s.depositAmount ?? s.DepositAmount ?? 0) - (s.withdrawAmount ?? s.WithdrawAmount ?? 0)) || [],
      borderColor: 'rgba(102, 126, 234, 1)',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4
    }]
  };

  if (!isAdmin()) {
    return (
      <div className="text-center py-5">
        <h3>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h3>
      </div>
    );
  }

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">รายงาน</h2>
          <p className="text-muted mb-0">รายงานสรุปและวิเคราะห์ข้อมูล</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary"
            onClick={handlePrintReport}
          >
            <Printer size={18} className="me-2" />
            พิมพ์
          </button>
          <button 
            className="btn btn-outline-success"
            onClick={handleExportReport}
          >
            <Download size={18} className="me-2" />
            Export
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="card modern-card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-bold">ประเภทรายงาน</label>
              <select
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="summary">สรุปทั่วไป</option>
                <option value="monthly">รายเดือน</option>
                <option value="trend">แนวโน้ม</option>
                <option value="detailed">รายละเอียด</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">ช่วงเวลา</label>
              <select
                className="form-select"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="week">สัปดาห์นี้</option>
                <option value="month">เดือนนี้</option>
                <option value="quarter">ไตรมาสนี้</option>
                <option value="year">ปีนี้</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button 
                className="btn btn-primary w-100"
                onClick={fetchReportData}
              >
                <Calendar size={18} className="me-2" />
                อัปเดตรายงาน
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Report */}
          {reportType === 'summary' && (
            <>
              <div className="row mb-4">
                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                  <div className="metric-card metric-card--primary">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="metric-label">ยอดเงินออมรวม</p>
                        <h3 className="metric-value fw-bold mb-0">{formatCurrency(summary?.totalBalance || 0)}</h3>
                        <small className="metric-hint">
                          <TrendingUp size={14} className="me-1" />
                          +12.5% จากช่วงก่อน
                        </small>
                      </div>
                      <div className="icon-box">
                        <DollarSign size={28} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                  <div className="metric-card metric-card--success">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="metric-label">จำนวนนักเรียน</p>
                        <h3 className="metric-value fw-bold mb-0">{summary?.totalStudents || 0}</h3>
                        <small className="metric-hint">
                          <Users size={14} className="me-1" />
                          นักเรียนทั้งหมด
                        </small>
                      </div>
                      <div className="icon-box">
                        <Users size={28} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                  <div className="metric-card metric-card--info">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="metric-label">รายการทั้งหมด</p>
                        <h3 className="metric-value fw-bold mb-0">{summary?.totalTransactions || 0}</h3>
                        <small className="metric-hint">
                          <FileText size={14} className="me-1" />
                          รายการ
                        </small>
                      </div>
                      <div className="icon-box">
                        <FileText size={28} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                  <div className="metric-card metric-card--warning">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="metric-label">ยอดสุทธิ</p>
                        <h3 className="metric-value fw-bold mb-0">
                          {formatCurrency((summary?.totalDeposits || 0) - (summary?.totalWithdrawals || 0))}
                        </h3>
                        <small className="metric-hint">
                          <TrendingUp size={14} className="me-1" />
                          ฝากมากกว่าถอน
                        </small>
                      </div>
                      <div className="icon-box">
                        <TrendingUp size={28} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-6 mb-4">
                  <div className="card modern-card h-100">
                    <div className="card-body">
                      <h5 className="fw-bold mb-3">สัดส่วนรายการ</h5>
                      <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut data={summaryChartData} options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: 'bottom' }
                          }
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 mb-4">
                  <div className="card modern-card h-100">
                    <div className="card-body">
                      <h5 className="fw-bold mb-3">สรุปรายการ</h5>
                      <table className="table">
                        <tbody>
                          <tr>
                            <td>ยอดฝากรวม</td>
                            <td className="text-success fw-bold">{formatCurrency(summary?.totalDeposits || 0)}</td>
                          </tr>
                          <tr>
                            <td>ยอดถอนรวม</td>
                            <td className="text-danger fw-bold">{formatCurrency(summary?.totalWithdrawals || 0)}</td>
                          </tr>
                          <tr>
                            <td>ยอดสุทธิ</td>
                            <td className="fw-bold">{formatCurrency((summary?.totalDeposits || 0) - (summary?.totalWithdrawals || 0))}</td>
                          </tr>
                          <tr>
                            <td>จำนวนรายการ</td>
                            <td className="fw-bold">{summary?.totalTransactions || 0}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Monthly Report */}
          {reportType === 'monthly' && (
            <div className="card modern-card">
              <div className="card-body">
                <h5 className="fw-bold mb-3">รายงานรายเดือน</h5>
                <div style={{ height: '400px' }}>
                  <Bar data={monthlyChartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' }
                    },
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* Trend Report */}
          {reportType === 'trend' && (
            <div className="card modern-card">
              <div className="card-body">
                <h5 className="fw-bold mb-3">แนวโน้มยอดเงิน</h5>
                <div style={{ height: '400px' }}>
                  <Line data={trendChartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' }
                    },
                    scales: {
                      y: { beginAtZero: false }
                    }
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* Detailed Report */}
          {reportType === 'detailed' && (
            <div className="card modern-card">
              <div className="card-body">
                <h5 className="fw-bold mb-3">รายงานรายละเอียด</h5>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>หัวข้อ</th>
                        <th>ค่า</th>
                        <th>หมายเหตุ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>ยอดเงินออมรวม</td>
                        <td>{formatCurrency(summary?.totalBalance || 0)}</td>
                        <td>ยอดเงินทั้งหมดในระบบ</td>
                      </tr>
                      <tr>
                        <td>จำนวนนักเรียน</td>
                        <td>{summary?.totalStudents || 0}</td>
                        <td>นักเรียนทั้งหมดที่ลงทะเบียน</td>
                      </tr>
                      <tr>
                        <td>รายการทั้งหมด</td>
                        <td>{summary?.totalTransactions || 0}</td>
                        <td>รายการฝาก-ถอนทั้งหมด</td>
                      </tr>
                      <tr>
                        <td>ยอดฝากรวม</td>
                        <td className="text-success">{formatCurrency(summary?.totalDeposits || 0)}</td>
                        <td>ยอดเงินฝากทั้งหมด</td>
                      </tr>
                      <tr>
                        <td>ยอดถอนรวม</td>
                        <td className="text-danger">{formatCurrency(summary?.totalWithdrawals || 0)}</td>
                        <td>ยอดเงินถอนทั้งหมด</td>
                      </tr>
                      <tr>
                        <td>ยอดสุทธิ</td>
                        <td className="fw-bold">{formatCurrency((summary?.totalDeposits || 0) - (summary?.totalWithdrawals || 0))}</td>
                        <td>ยอดสุทธิของระบบ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
