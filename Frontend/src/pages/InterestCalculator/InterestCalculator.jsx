import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Calculator, DollarSign, TrendingUp, Calendar, Info, RefreshCw, BarChart2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const InterestCalculator = () => {
  // Calculator states
  const [initialDeposit, setInitialDeposit] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [interestRate, setInterestRate] = useState(2.5); // % per year
  const [years, setYears] = useState(5);
  const [compoundFrequency, setCompoundFrequency] = useState('monthly'); // 'monthly', 'annually', 'simple'

  // Output states
  const [futureValue, setFutureValue] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [yearlyData, setYearlyData] = useState([]);

  useEffect(() => {
    calculateSavings();
  }, [initialDeposit, monthlyContribution, interestRate, years, compoundFrequency]);

  const calculateSavings = () => {
    let currentBalance = initialDeposit;
    let accumulatedDeposits = initialDeposit;
    let accumulatedInterest = 0;
    const r = interestRate / 100;
    const dataPoints = [];

    // Push initial Year 0 state
    dataPoints.push({
      year: 0,
      endingBalance: Math.round(currentBalance),
      totalDeposits: Math.round(accumulatedDeposits),
      totalInterest: Math.round(accumulatedInterest),
      interestEarnedThisYear: 0
    });

    for (let year = 1; year <= years; year++) {
      let interestEarnedThisYear = 0;

      if (compoundFrequency === 'monthly') {
        for (let month = 1; month <= 12; month++) {
          // Add monthly contribution
          currentBalance += monthlyContribution;
          accumulatedDeposits += monthlyContribution;
          
          // Calculate monthly interest
          const monthlyInterest = currentBalance * (r / 12);
          interestEarnedThisYear += monthlyInterest;
          currentBalance += monthlyInterest;
        }
      } else if (compoundFrequency === 'annually') {
        // Contributions added monthly, interest applied at year end
        const principalThisYear = monthlyContribution * 12;
        currentBalance += principalThisYear;
        accumulatedDeposits += principalThisYear;
        
        const annualInterest = currentBalance * r;
        interestEarnedThisYear = annualInterest;
        currentBalance += annualInterest;
      } else {
        // Simple Interest: No compounding, interest calculated on current principal only
        const principalThisYear = monthlyContribution * 12;
        accumulatedDeposits += principalThisYear;
        
        // Simple interest is computed on principal balance
        const annualSimpleInterest = (initialDeposit + (monthlyContribution * 12 * (year - 0.5))) * r;
        interestEarnedThisYear = annualSimpleInterest;
        currentBalance = accumulatedDeposits + accumulatedInterest + interestEarnedThisYear;
      }

      accumulatedInterest += interestEarnedThisYear;

      dataPoints.push({
        year: year,
        endingBalance: Math.round(currentBalance),
        totalDeposits: Math.round(accumulatedDeposits),
        totalInterest: Math.round(accumulatedInterest),
        interestEarnedThisYear: Math.round(interestEarnedThisYear)
      });
    }

    setFutureValue(currentBalance);
    setTotalDeposits(accumulatedDeposits);
    setTotalInterest(accumulatedInterest);
    setYearlyData(dataPoints);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  // Chart configuration
  const chartLabels = yearlyData.map(d => `ปีที่ ${d.year}`);
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'เงินต้นสะสม (บาท)',
        data: yearlyData.map(d => d.totalDeposits),
        backgroundColor: '#4f46e5', // Deep indigo
        borderRadius: 4,
      },
      {
        label: 'ดอกเบี้ยสะสม (บาท)',
        data: yearlyData.map(d => d.totalInterest),
        backgroundColor: '#10b981', // Emerald green
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Sarabun', size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false }
      },
      y: {
        stacked: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    }
  };

  const handleReset = () => {
    setInitialDeposit(1000);
    setMonthlyContribution(200);
    setInterestRate(2.5);
    setYears(5);
    setCompoundFrequency('monthly');
  };

  return (
    <div className="interest-calculator-container">
      {/* Header */}
      <header className="page-header d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="page-title fw-bold">เครื่องมือคำนวณดอกเบี้ยปันผล</h1>
          <p className="page-subtitle text-muted">
            วางแผนและจำลองการงอกเงยของเงินออมสะสมด้วยพลังของดอกเบี้ยทบต้น (Compound Interest)
          </p>
        </div>
        <button className="btn btn-outline-secondary px-3 py-2" onClick={handleReset}>
          <RefreshCw size={16} className="me-2" />
          รีเซ็ตข้อมูล
        </button>
      </header>

      {/* Main Layout Grid */}
      <div className="row g-4">
        {/* Left Column: Input Sliders */}
        <div className="col-lg-5">
          <div className="card modern-card border-0 shadow-sm p-4 h-100 bg-white" style={{ borderRadius: '16px' }}>
            <h3 className="h5 fw-bold text-dark mb-4 d-flex align-items-center">
              <Calculator size={20} className="text-indigo-600 me-2" />
              กำหนดเงื่อนไขการออมเงิน
            </h3>

            {/* Input 1: Initial Deposit */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label text-dark fw-semibold mb-0">เงินต้นเริ่มแรก (บาท)</label>
                <input 
                  type="number" 
                  className="form-control form-control-sm text-end fw-bold text-indigo"
                  style={{ width: '120px', borderRadius: '8px' }}
                  value={initialDeposit} 
                  onChange={(e) => setInitialDeposit(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
              <input 
                type="range" 
                className="form-range" 
                min="0" 
                max="100000" 
                step="500"
                value={initialDeposit} 
                onChange={(e) => setInitialDeposit(parseFloat(e.target.value))}
              />
              <div className="d-flex justify-content-between text-muted small">
                <span>0 บาท</span>
                <span>50,000 บาท</span>
                <span>100,000 บาท</span>
              </div>
            </div>

            {/* Input 2: Monthly Contribution */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label text-dark fw-semibold mb-0">เงินฝากเพิ่มรายเดือน (บาท)</label>
                <input 
                  type="number" 
                  className="form-control form-control-sm text-end fw-bold text-indigo"
                  style={{ width: '120px', borderRadius: '8px' }}
                  value={monthlyContribution} 
                  onChange={(e) => setMonthlyContribution(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
              <input 
                type="range" 
                className="form-range" 
                min="0" 
                max="10000" 
                step="100"
                value={monthlyContribution} 
                onChange={(e) => setMonthlyContribution(parseFloat(e.target.value))}
              />
              <div className="d-flex justify-content-between text-muted small">
                <span>0 บาท</span>
                <span>5,000 บาท</span>
                <span>10,000 บาท</span>
              </div>
            </div>

            {/* Input 3: Interest Rate */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label text-dark fw-semibold mb-0">อัตราดอกเบี้ยต่อปี (%)</label>
                <input 
                  type="number" 
                  className="form-control form-control-sm text-end fw-bold text-indigo"
                  style={{ width: '80px', borderRadius: '8px' }}
                  step="0.05"
                  value={interestRate} 
                  onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
              <input 
                type="range" 
                className="form-range" 
                min="0" 
                max="20" 
                step="0.1"
                value={interestRate} 
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
              />
              <div className="d-flex justify-content-between text-muted small">
                <span>0%</span>
                <span>10%</span>
                <span>20%</span>
              </div>
            </div>

            {/* Input 4: Years */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label text-dark fw-semibold mb-0">ระยะเวลาการออม (ปี)</label>
                <span className="badge bg-light text-indigo border px-3 py-1.5 fs-6">{years} ปี</span>
              </div>
              <input 
                type="range" 
                className="form-range" 
                min="1" 
                max="30" 
                step="1"
                value={years} 
                onChange={(e) => setYears(parseInt(e.target.value))}
              />
              <div className="d-flex justify-content-between text-muted small">
                <span>1 ปี</span>
                <span>15 ปี</span>
                <span>30 ปี</span>
              </div>
            </div>

            {/* Input 5: Compounding Frequency */}
            <div className="mb-2">
              <label className="form-label text-dark fw-semibold">รูปแบบการทบต้นดอกเบี้ย</label>
              <select 
                className="form-select bg-light" 
                style={{ borderRadius: '8px' }}
                value={compoundFrequency}
                onChange={(e) => setCompoundFrequency(e.target.value)}
              >
                <option value="monthly">ทบต้นรายเดือน (แนะนำ)</option>
                <option value="annually">ทบต้นรายปี</option>
                <option value="simple">ไม่ทบต้น (Simple Interest)</option>
              </select>
            </div>
            
            <div className="mt-4 p-3 bg-light rounded-3 d-flex gap-2">
              <Info size={20} className="text-indigo-600 flex-shrink-0 mt-0.5" />
              <p className="small text-muted mb-0">
                ดอกเบี้ยทบต้นคือการเอาดอกเบี้ยที่ได้ในแต่ละงวดสมทบเข้ากับเงินต้นเดิมเพื่อให้เกิดดอกเบี้ยใหม่ที่ทวีคูณยิ่งขึ้นในงวดถัดไป
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Results & Charts */}
        <div className="col-lg-7">
          <div className="d-flex flex-column gap-4 h-100">
            {/* Summary Cards Row */}
            <div className="row g-3">
              <div className="col-md-4">
                <div className="metric-card metric-card--primary">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="metric-label">มูลค่าปลายทางสุทธิ</p>
                      <h3 className="metric-value fw-bold mb-0">{formatCurrency(futureValue)}</h3>
                      <small className="metric-hint">รวมเงินต้น + ดอกเบี้ย</small>
                    </div>
                    <div className="icon-box">
                      <TrendingUp size={28} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="metric-card metric-card--success">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="metric-label">เงินต้นฝากสะสมทั้งหมด</p>
                      <h3 className="metric-value fw-bold mb-0">{formatCurrency(totalDeposits)}</h3>
                      <small className="metric-hint">เงินออมจริงของคุณ</small>
                    </div>
                    <div className="icon-box">
                      <DollarSign size={28} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="metric-card metric-card--info">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="metric-label">ดอกเบี้ย/ปันผลสะสม</p>
                      <h3 className="metric-value fw-bold mb-0">{formatCurrency(totalInterest)}</h3>
                      <small className="metric-hint">ผลตอบแทนที่เติบโต</small>
                    </div>
                    <div className="icon-box">
                      <BarChart2 size={28} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Curve Chart */}
            <div className="card modern-card border-0 shadow-sm p-4 flex-grow-1 bg-white" style={{ borderRadius: '16px', minHeight: '300px' }}>
              <h3 className="h5 fw-bold text-dark mb-3 d-flex align-items-center">
                <BarChart2 size={20} className="text-indigo-600 me-2" />
                สัดส่วนการเติบโตเงินทุนรายปี
              </h3>
              <div className="flex-grow-1" style={{ position: 'relative', height: '220px' }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Projection Breakdown Table */}
        <div className="col-12 mt-2">
          <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="card-header bg-white py-3 border-bottom-0">
              <h3 className="h5 fw-bold text-dark mb-0">ตารางจำลองเงินฝากสะสมจำแนกรายปี</h3>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">สิ้นสุดปีที่</th>
                      <th className="text-end">เงินต้นฝากสะสม</th>
                      <th className="text-end">ดอกเบี้ยที่ได้ในปีนั้น</th>
                      <th className="text-end">ดอกเบี้ยสะสมทั้งหมด</th>
                      <th className="text-end pe-4">ยอดเงินสุทธิปลายปี</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyData.map((d) => (
                      <tr key={d.year}>
                        <td className="ps-4 fw-bold">
                          {d.year === 0 ? 'เริ่มต้น (ปี 0)' : `ปีที่ ${d.year}`}
                        </td>
                        <td className="text-end text-dark">{formatCurrency(d.totalDeposits)}</td>
                        <td className="text-end text-success">
                          {d.year === 0 ? '-' : `+${formatCurrency(d.interestEarnedThisYear)}`}
                        </td>
                        <td className="text-end text-success">
                          {d.year === 0 ? '-' : formatCurrency(d.totalInterest)}
                        </td>
                        <td className="text-end pe-4 fw-bold text-indigo">
                          {formatCurrency(d.endingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestCalculator;
