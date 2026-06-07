import React, { useState, useEffect } from 'react';
import apiClient from '../../config/apiClient';
import { Target, Flame, AlertTriangle, TrendingUp, Lightbulb, RefreshCw, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';

const FinancialInsights = ({ studentId }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [studentId]);

  const fetchInsights = async () => {
    setRefreshing(true);
    try {
      const endpoint = studentId 
        ? `/financialadvisor/insights/${studentId}` 
        : '/financialadvisor/insights';
      const response = await apiClient.get(endpoint);
      setInsights(response.data.insights || []);
    } catch (error) {
      console.error('Error fetching financial insights:', error);
      // Suppress alert for student role if not critical, or show a subtle notification
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getIcon = (iconName, type) => {
    const size = 20;
    const classes = `flex-shrink-0 mt-1`;
    switch (iconName) {
      case 'target': return <Target size={size} className={`${classes} text-success`} />;
      case 'flame': return <Flame size={size} className={`${classes} text-warning fill-warning animate-pulse`} />;
      case 'alert': return <AlertTriangle size={size} className={`${classes} text-danger`} />;
      case 'trending-up': return <TrendingUp size={size} className={`${classes} text-indigo`} />;
      case 'bulb': return <Lightbulb size={size} className={`${classes} text-primary`} />;
      default: return <Sparkles size={size} className={`${classes} text-info`} />;
    }
  };

  const getBorderClass = (type) => {
    switch (type) {
      case 'success': return 'border-start border-success border-4';
      case 'warning': return 'border-start border-warning border-4';
      case 'primary': return 'border-start border-indigo border-4';
      case 'info': return 'border-start border-info border-4';
      default: return 'border-start border-secondary border-4';
    }
  };

  const getBgClass = (type) => {
    switch (type) {
      case 'success': return 'bg-success bg-opacity-5';
      case 'warning': return 'bg-warning bg-opacity-5';
      case 'primary': return 'bg-indigo bg-opacity-5';
      case 'info': return 'bg-info bg-opacity-5';
      default: return 'bg-light';
    }
  };

  if (loading) {
    return (
      <div className="card modern-card border-0 shadow-sm p-4 text-center">
        <div className="spinner-border text-primary spinner-border-sm mb-2" role="status">
          <span className="visually-hidden">กำลังวิเคราะห์...</span>
        </div>
        <p className="text-muted small mb-0">กำลังวิเคราะห์พฤติกรรมการเงินส่วนบุคคล...</p>
      </div>
    );
  }

  return (
    <div className="card modern-card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
      <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 bg-indigo bg-opacity-10 text-indigo rounded-3">
            <Sparkles size={20} className="animate-spin-slow" />
          </div>
          <div>
            <h3 className="h6 fw-bold text-dark mb-0 d-flex align-items-center gap-1.5">
              ระบบวิเคราะห์การเงินอัจฉริยะ 🤖
            </h3>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>คำแนะนำและการวิเคราะห์เพื่อวินัยการออม</span>
          </div>
        </div>
        <button 
          className="btn btn-sm btn-light p-2 rounded-circle border-0 text-muted hover-rotate" 
          onClick={fetchInsights}
          disabled={refreshing}
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="card-body px-4 pb-4 pt-1">
        {insights.length > 0 ? (
          <div className="d-flex flex-column gap-3">
            {insights.map((insight, index) => (
              <div 
                key={insight.id || index}
                className={`p-3 rounded-3 d-flex gap-3 transition-smooth ${getBorderClass(insight.type)} ${getBgClass(insight.type)}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {getIcon(insight.icon, insight.type)}
                <div>
                  <h4 className="fw-bold mb-1" style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                    {insight.title}
                  </h4>
                  <p className="mb-0 text-secondary" style={{ fontSize: '0.825rem', lineHeight: '1.5' }}>
                    {insight.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted small mb-0">ยังไม่มีข้อมูลแนะนำในขณะนี้ เริ่มต้นทำรายการฝากเงินเพื่อรับการวิเคราะห์</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialInsights;
