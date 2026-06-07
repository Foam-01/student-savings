import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../config/apiClient';
import { Trophy, Flame, BarChart2, Star, Search, Filter, AlertCircle, Medal, Crown } from 'lucide-react';
import Swal from 'sweetalert2';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter and Sort states
  const [sortBy, setSortBy] = useState('balance'); // 'balance', 'streak', 'deposits'
  const [selectedClassroom, setSelectedClassroom] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy, selectedClassroom]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/leaderboard', {
        params: {
          sortBy: sortBy,
          classroom: selectedClassroom === 'all' ? null : selectedClassroom
        }
      });
      setLeaderboard(response.data);

      // Fetch unique classrooms if not already loaded
      if (classrooms.length === 0) {
        const uniqueClasses = [...new Set(response.data.map(r => r.classroom).filter(Boolean))];
        setClassrooms(uniqueClasses);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลการจัดอันดับได้',
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

  // Filter leaderboard by search term (name or username)
  const filteredLeaderboard = leaderboard.filter(row => 
    row.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.studentUsername?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate top 3 and the rest
  const topThree = filteredLeaderboard.slice(0, 3);
  const remainingRows = filteredLeaderboard.slice(3);

  // Find logged in student's row
  const myRecord = leaderboard.find(row => row.studentId === user?.id);

  return (
    <div className="leaderboard-container">
      {/* Header */}
      <header className="page-header d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="page-title fw-bold">อันดับการออมเงิน</h1>
          <p className="page-subtitle text-muted">
            บอร์ดผู้นำแห่งการออมและสร้างวินัยทางการเงินดีเด่น
          </p>
        </div>
      </header>

      {/* My Stats Banner for Students */}
      {myRecord && (
        <div className="card border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', borderRadius: '16px' }}>
          <div className="card-body p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-circle text-white">
                <Trophy size={32} />
              </div>
              <div>
                <h3 className="h5 fw-bold mb-1">สถานะการออมของคุณ</h3>
                <p className="mb-0 text-white text-opacity-80">
                  คุณอยู่อันดับที่ <strong className="text-white fs-5">#{myRecord.rank}</strong> จากนักเรียนทั้งหมดในระบบ
                </p>
              </div>
            </div>
            <div className="d-flex gap-4">
              <div className="text-center">
                <span className="small text-white text-opacity-70 d-block">ยอดออมสะสม</span>
                <span className="fw-bold fs-5">{formatCurrency(myRecord.totalBalance)}</span>
              </div>
              <div className="text-center border-start border-white border-opacity-20 ps-4">
                <span className="small text-white text-opacity-70 d-block">ออมต่อเนื่อง</span>
                <span className="fw-bold fs-5 d-flex align-items-center justify-content-center gap-1">
                  {myRecord.currentStreak} สัปดาห์ <Flame size={18} className="text-warning fill-warning" />
                </span>
              </div>
              <div className="text-center border-start border-white border-opacity-20 ps-4">
                <span className="small text-white text-opacity-70 d-block">ความถี่ฝากเงิน</span>
                <span className="fw-bold fs-5">{myRecord.depositCount} ครั้ง</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sort & Filter Panel */}
      <div className="card modern-card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            {/* Sort Tabs */}
            <div className="btn-group p-1 bg-light rounded-pill" role="group">
              <button 
                type="button" 
                className={`btn btn-sm rounded-pill px-4 py-2 border-0 ${sortBy === 'balance' ? 'btn-indigo text-white shadow-sm' : 'btn-light text-muted'}`}
                onClick={() => setSortBy('balance')}
                style={sortBy === 'balance' ? { backgroundColor: '#4f46e5' } : {}}
              >
                ยอดออมสะสม
              </button>
              <button 
                type="button" 
                className={`btn btn-sm rounded-pill px-4 py-2 border-0 ${sortBy === 'streak' ? 'btn-indigo text-white shadow-sm' : 'btn-light text-muted'}`}
                onClick={() => setSortBy('streak')}
                style={sortBy === 'streak' ? { backgroundColor: '#4f46e5' } : {}}
              >
                ออมต่อเนื่อง 🔥
              </button>
              <button 
                type="button" 
                className={`btn btn-sm rounded-pill px-4 py-2 border-0 ${sortBy === 'deposits' ? 'btn-indigo text-white shadow-sm' : 'btn-light text-muted'}`}
                onClick={() => setSortBy('deposits')}
                style={sortBy === 'deposits' ? { backgroundColor: '#4f46e5' } : {}}
              >
                ความถี่ฝากเงิน 📈
              </button>
            </div>

            {/* Filters */}
            <div className="d-flex flex-wrap gap-2 flex-grow-1 flex-md-grow-0 justify-content-end" style={{ minWidth: '300px' }}>
              <div className="input-group flex-grow-1" style={{ maxWidth: '220px' }}>
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <Search size={16} />
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0 bg-light" 
                  placeholder="ค้นหาชื่อ..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="form-select bg-light" 
                style={{ width: '130px' }}
                value={selectedClassroom}
                onChange={(e) => setSelectedClassroom(e.target.value)}
              >
                <option value="all">ทุกชั้นเรียน</option>
                {classrooms.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-indigo" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="text-muted mt-2">กำลังคำนวณสถิติและจัดอันดับ...</p>
        </div>
      ) : filteredLeaderboard.length > 0 ? (
        <>
          {/* Podium for Top 3 (Only show if we have enough students and not searching) */}
          {topThree.length > 0 && !searchTerm && (
            <div className="row justify-content-center align-items-end g-3 mb-5 mt-2">
              {/* Rank 2 (Left) */}
              {topThree[1] && (
                <div className="col-4 col-md-3 order-1">
                  <div className="card border-0 shadow-sm text-center p-3 podium-card podium-card--silver" style={{ borderRadius: '16px', background: 'linear-gradient(180deg, #f8fafc, #f1f5f9)', minHeight: '220px' }}>
                    <div className="mb-2 text-secondary">
                      <Medal size={36} className="text-slate-400" />
                    </div>
                    <h4 className="h6 fw-bold mb-1 text-truncate">{topThree[1].studentName}</h4>
                    <span className="badge text-bg-light border mb-3">{topThree[1].classroom || 'ไม่ระบุ'}</span>
                    <div className="fw-bold text-indigo">{formatCurrency(topThree[1].totalBalance)}</div>
                    {sortBy === 'streak' ? (
                      <div className="small text-warning mt-1 fw-semibold">🔥 {topThree[1].currentStreak} สัปดาห์</div>
                    ) : (
                      <div className="small text-muted mt-1">{topThree[1].depositCount} ฝาก</div>
                    )}
                    <div className="podium-rank mt-3 fs-5 fw-bold text-secondary">อันดับ 2</div>
                  </div>
                </div>
              )}

              {/* Rank 1 (Middle - Elevated) */}
              {topThree[0] && (
                <div className="col-4 col-md-3 order-2 pb-md-3">
                  <div className="card border-0 shadow-lg text-center p-4 podium-card podium-card--gold border-top border-warning border-4" style={{ borderRadius: '20px', background: 'linear-gradient(180deg, #fffbeb, #fef3c7)', minHeight: '250px', transform: 'scale(1.05)' }}>
                    <div className="mb-2 text-warning animate-bounce">
                      <Crown size={48} className="fill-warning" />
                    </div>
                    <h4 className="h5 fw-bold mb-1 text-truncate">{topThree[0].studentName}</h4>
                    <span className="badge text-bg-warning bg-opacity-20 text-warning border border-warning border-opacity-30 mb-3">{topThree[0].classroom || 'ไม่ระบุ'}</span>
                    <div className="fw-bold text-indigo fs-5">{formatCurrency(topThree[0].totalBalance)}</div>
                    {sortBy === 'streak' ? (
                      <div className="small text-warning mt-1 fw-semibold">🔥 {topThree[0].currentStreak} สัปดาห์</div>
                    ) : (
                      <div className="small text-muted mt-1">{topThree[0].depositCount} ฝาก</div>
                    )}
                    <div className="podium-rank mt-3 fs-4 fw-bold text-warning">อันดับ 1</div>
                  </div>
                </div>
              )}

              {/* Rank 3 (Right) */}
              {topThree[2] && (
                <div className="col-4 col-md-3 order-3">
                  <div className="card border-0 shadow-sm text-center p-3 podium-card podium-card--bronze" style={{ borderRadius: '16px', background: 'linear-gradient(180deg, #f8fafc, #faf5ff)', minHeight: '200px' }}>
                    <div className="mb-2" style={{ color: '#b45309' }}>
                      <Medal size={32} />
                    </div>
                    <h4 className="h6 fw-bold mb-1 text-truncate">{topThree[2].studentName}</h4>
                    <span className="badge text-bg-light border mb-3">{topThree[2].classroom || 'ไม่ระบุ'}</span>
                    <div className="fw-bold text-indigo">{formatCurrency(topThree[2].totalBalance)}</div>
                    {sortBy === 'streak' ? (
                      <div className="small text-warning mt-1 fw-semibold">🔥 {topThree[2].currentStreak} สัปดาห์</div>
                    ) : (
                      <div className="small text-muted mt-1">{topThree[2].depositCount} ฝาก</div>
                    )}
                    <div className="podium-rank mt-3 fs-5 fw-bold" style={{ color: '#b45309' }}>อันดับ 3</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Table List */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4" style={{ width: '80px' }}>อันดับ</th>
                      <th>นักเรียน</th>
                      <th>ชั้นเรียน</th>
                      <th className="text-end">ยอดเงินคงเหลือ</th>
                      <th className="text-center">ความถี่การฝาก</th>
                      <th className="text-center">ออมต่อเนื่อง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaderboard.map((row) => {
                      const isMe = row.studentId === user?.id;
                      const hasStreak = row.currentStreak > 0;
                      
                      return (
                        <tr key={row.studentId} className={isMe ? 'table-primary table-opacity-10 border-start border-primary border-4' : ''}>
                          <td className="ps-4 fw-bold">
                            {row.rank <= 3 ? (
                              <span className={`badge rounded-circle p-2 d-inline-flex align-items-center justify-content-center ${
                                row.rank === 1 ? 'bg-warning text-dark' :
                                row.rank === 2 ? 'bg-secondary text-white' :
                                'bg-bronze text-white'
                              }`} style={{ width: '32px', height: '32px', backgroundColor: row.rank === 3 ? '#b45309' : '' }}>
                                {row.rank}
                              </span>
                            ) : (
                              <span className="text-muted ps-2">#{row.rank}</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div>
                                <div className="fw-bold text-dark">{row.studentName}</div>
                                <div className="text-muted small">@{row.studentUsername}</div>
                              </div>
                              {isMe && <span className="badge bg-indigo text-white ms-2" style={{ backgroundColor: '#4f46e5' }}>ฉัน</span>}
                            </div>
                          </td>
                          <td>
                            <span className="badge text-bg-light border">{row.classroom || 'ไม่ระบุ'}</span>
                          </td>
                          <td className="text-end fw-bold text-indigo">
                            {formatCurrency(row.totalBalance)}
                          </td>
                          <td className="text-center">
                            <span className="fw-semibold text-dark">{row.depositCount} ครั้ง</span>
                          </td>
                          <td className="text-center">
                            {hasStreak ? (
                              <span className="badge bg-warning bg-opacity-15 text-dark border border-warning border-opacity-35 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1 fw-bold">
                                {row.currentStreak} สัปดาห์
                                <Flame size={16} className="text-warning fill-warning" />
                              </span>
                            ) : (
                              <span className="text-muted small">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-5 card modern-card border-0 shadow-sm">
          <div className="card-body py-5">
            <AlertCircle size={48} className="text-muted mb-3" />
            <h3 className="fw-bold">ไม่พบข้อมูลการจัดอันดับ</h3>
            <p className="text-muted mb-0">ไม่มีข้อมูลนักเรียนที่ตรงตามเงื่อนไขที่กำหนด</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
