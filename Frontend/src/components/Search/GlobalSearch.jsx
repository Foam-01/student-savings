import React, { useState, useEffect } from 'react';
import { Search, X, User, DollarSign, FileText, Activity, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../config/apiClient';

const GlobalSearch = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const getResultIcon = (type) => {
    switch (type) {
      case 'student': return <User size={16} />;
      case 'transaction': return <DollarSign size={16} />;
      case 'report': return <FileText size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getResultColor = (type) => {
    switch (type) {
      case 'student': return 'text-primary';
      case 'transaction': return 'text-success';
      case 'report': return 'text-info';
      default: return 'text-warning';
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setResults([]);
      return;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const response = await apiClient.get('/search', { params: { q: searchTerm } });
        const searchResults = (response.data || []).map((item) => ({
          ...item,
          icon: getResultIcon(item.type),
          color: getResultColor(item.type),
        }));
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, isAdmin]);

  const handleResultClick = (result) => {
    navigate(result.route);
    setIsOpen(false);
    setSearchTerm('');
    setResults([]);
  };

  if (!isOpen) return null;

  return (
    <div className="global-search-overlay">
      <div 
        className="search-backdrop"
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1040
        }}
      />
      <div 
        className="search-modal"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          maxWidth: '90%',
          zIndex: 1050,
        }}
      >
        <div className="card modern-card">
          <div className="card-body p-4">
            {/* Search Input */}
            <div className="input-group mb-4">
              <span className="input-group-text bg-light">
                <Search size={20} />
              </span>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="ค้นหาทั่วระบบ... (Ctrl+K)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                style={{ fontSize: '16px' }}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Results */}
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : searchTerm && results.length > 0 ? (
              <div className="search-results">
                <div className="text-muted small mb-2">พบ {results.length} ผลลัพธ์</div>
                <div className="list-group list-group-flush">
                  {results.map((result, index) => (
                    <button
                      key={index}
                      className="list-group-item list-group-item-action d-flex align-items-center"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className={`me-3 ${result.color}`}>
                        {result.icon}
                      </div>
                      <div className="flex-grow-1 text-start">
                        <div className="fw-bold">{result.title}</div>
                        <div className="small text-muted">{result.description}</div>
                      </div>
                      <div className="text-muted small">
                        <span className="badge bg-light text-dark">{result.category}</span>
                      </div>
                      <ArrowRight size={16} className="ms-3 text-muted" />
                    </button>
                  ))}
                </div>
              </div>
            ) : searchTerm ? (
              <div className="text-center py-4">
                <Search size={48} className="text-muted mb-3" />
                <p className="text-muted">ไม่พบผลลัพธ์</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="mb-3">
                  <kbd className="bg-light border">Ctrl</kbd> + <kbd className="bg-light border">K</kbd>
                </div>
                <p className="text-muted small">พิมพ์เพื่อค้นหาทั่วระบบ</p>
                <div className="mt-4">
                  <div className="small text-muted mb-2">คำแนะนำการค้นหา:</div>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <span className="badge bg-light text-dark">นักเรียน</span>
                    <span className="badge bg-light text-dark">รายการ</span>
                    <span className="badge bg-light text-dark">รายงาน</span>
                    <span className="badge bg-light text-dark">ตั้งค่า</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {!searchTerm && (
              <div className="mt-4 pt-4 border-top">
                <div className="small text-muted mb-2">การกระทำด่วน:</div>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      navigate('/students');
                      setIsOpen(false);
                    }}
                  >
                    <User size={14} className="me-1" />
                    นักเรียน
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => {
                      navigate('/transactions');
                      setIsOpen(false);
                    }}
                  >
                    <DollarSign size={14} className="me-1" />
                    รายการ
                  </button>
                  <button
                    className="btn btn-sm btn-outline-info"
                    onClick={() => {
                      navigate('/reports');
                      setIsOpen(false);
                    }}
                  >
                    <FileText size={14} className="me-1" />
                    รายงาน
                  </button>
                  <button
                    className="btn btn-sm btn-outline-warning"
                    onClick={() => {
                      navigate('/settings');
                      setIsOpen(false);
                    }}
                  >
                    <Activity size={14} className="me-1" />
                    ตั้งค่า
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
