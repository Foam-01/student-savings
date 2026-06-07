import React, { useState } from 'react';
import { Book, HelpCircle, Search, FileText, Video, MessageCircle, ExternalLink, ChevronRight } from 'lucide-react';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const helpCategories = [
    { id: 'all', name: 'ทั้งหมด', icon: <Book size={20} /> },
    { id: 'getting-started', name: 'เริ่มต้นใช้งาน', icon: <HelpCircle size={20} /> },
    { id: 'students', name: 'จัดการนักเรียน', icon: <FileText size={20} /> },
    { id: 'transactions', name: 'รายการ', icon: <FileText size={20} /> },
    { id: 'reports', name: 'รายงาน', icon: <FileText size={20} /> },
    { id: 'settings', name: 'ตั้งค่า', icon: <FileText size={20} /> },
  ];

  const helpArticles = [
    {
      id: 1,
      category: 'getting-started',
      title: 'วิธีเข้าสู่ระบบ',
      content: 'เข้าสู่ระบบโดยใช้ username และ password ที่ได้รับจากผู้ดูแลระบบ',
      icon: <HelpCircle size={24} />,
      color: 'text-primary'
    },
    {
      id: 2,
      category: 'getting-started',
      title: 'ภาพรวม Dashboard',
      content: 'Dashboard แสดงสรุปข้อมูลทั้งหมดของระบบ รวมถึงยอดเงิน, จำนวนนักเรียน, และรายการล่าสุด',
      icon: <Book size={24} />,
      color: 'text-info'
    },
    {
      id: 3,
      category: 'students',
      title: 'เพิ่มนักเรียนใหม่',
      content: 'ไปที่เมนู จัดการนักเรียน > คลิกปุ่ม เพิ่มนักเรียน > กรอกข้อมูล > บันทึก',
      icon: <FileText size={24} />,
      color: 'text-success'
    },
    {
      id: 4,
      category: 'students',
      title: 'แก้ไขข้อมูลนักเรียน',
      content: 'ไปที่เมนู จัดการนักเรียน > คลิกปุ่มแก้ไข > แก้ไขข้อมูล > บันทึก',
      icon: <FileText size={24} />,
      color: 'text-warning'
    },
    {
      id: 5,
      category: 'transactions',
      title: 'ทำรายการฝากเงิน',
      content: 'ไปที่ Dashboard > คลิกปุ่ม ทำรายการใหม่ > เลือกนักเรียน > กรอกจำนวนเงิน > บันทึก',
      icon: <FileText size={24} />,
      color: 'text-primary'
    },
    {
      id: 6,
      category: 'transactions',
      title: 'ทำรายการถอนเงิน',
      content: 'ไปที่ Dashboard > คลิกปุ่ม ทำรายการใหม่ > เลือกนักเรียน > เลือกถอนเงิน > กรอกจำนวนเงิน > บันทึก',
      icon: <FileText size={24} />,
      color: 'text-danger'
    },
    {
      id: 7,
      category: 'reports',
      title: 'ดูรายงานสรุป',
      content: 'ไปที่เมนู รายงาน > เลือกประเภทรายงาน > เลือกช่วงเวลา > ดูรายงาน',
      icon: <FileText size={24} />,
      color: 'text-info'
    },
    {
      id: 8,
      category: 'reports',
      title: 'Export รายงาน',
      content: 'ไปที่เมนู รายงาน > คลิกปุ่ม Export > เลือก format > ดาวน์โหลด',
      icon: <FileText size={24} />,
      color: 'text-success'
    },
    {
      id: 9,
      category: 'settings',
      title: 'ตั้งค่าทั่วไป',
      content: 'ไปที่เมนู ตั้งค่า > เลือกแท็บ ตั้งค่าทั่วไป > แก้ไขข้อมูล > บันทึก',
      icon: <FileText size={24} />,
      color: 'text-warning'
    },
    {
      id: 10,
      category: 'settings',
      title: 'จัดการ Admin',
      content: 'ไปที่เมนู ตั้งค่า > เลือกแท็บ จัดการ Admin > เพิ่ม/ลบ Admin',
      icon: <FileText size={24} />,
      color: 'text-danger'
    },
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        article.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const faqs = [
    {
      question: 'ลืมรหัสผ่านทำอย่างไร?',
      answer: 'ติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน'
    },
    {
      question: 'ระบบรองรับ browser อะไรบ้าง?',
      answer: 'รองรับ Chrome, Firefox, Safari, Edge เวอร์ชันล่าสุด'
    },
    {
      question: 'สามารถ export ข้อมูลได้หรือไม่?',
      answer: 'ได้ สามารถ export ข้อมูลนักเรียน, รายการ, และรายงานได้ในรูปแบบ CSV'
    },
    {
      question: 'ระบบมีการ backup ข้อมูลหรือไม่?',
      answer: 'มี ระบบจะ backup ข้อมูลอัตโนมัติทุกวัน สามารถตั้งค่าได้ในเมนู ตั้งค่า'
    },
  ];

  return (
    <div className="help-container">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">ศูนย์ช่วยเหลือ</h2>
        <p className="text-muted mb-0">คู่มือและคำถามที่พบบ่อย</p>
      </div>

      {/* Search */}
      <div className="card modern-card mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-light">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="ค้นหาคำถาม..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row">
        {/* Categories Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card modern-card">
            <div className="card-body">
              <h5 className="fw-bold mb-3">หมวดหมู่</h5>
              <div className="nav flex-column">
                {helpCategories.map((category) => (
                  <button
                    key={category.id}
                    className={`nav-link text-start mb-2 d-flex align-items-center ${
                      activeCategory === category.id ? 'active' : ''
                    }`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.icon}
                    <span className="ms-2">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="card modern-card mt-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">ลิงก์ด่วน</h5>
              <div className="d-flex flex-column gap-2">
                <a href="#" className="btn btn-outline-primary btn-sm d-flex align-items-center">
                  <Video size={16} className="me-2" />
                  วิดีโอสอนใช้งาน
                  <ExternalLink size={14} className="ms-auto" />
                </a>
                <a href="#" className="btn btn-outline-success btn-sm d-flex align-items-center">
                  <FileText size={16} className="me-2" />
                  ดาวน์โหลดคู่มือ PDF
                  <ExternalLink size={14} className="ms-auto" />
                </a>
                <a href="#" className="btn btn-outline-info btn-sm d-flex align-items-center">
                  <MessageCircle size={16} className="me-2" />
                  ติดต่อ Support
                  <ExternalLink size={14} className="ms-auto" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="col-lg-9">
          <div className="card modern-card">
            <div className="card-body">
              <h5 className="fw-bold mb-4">
                {helpCategories.find(c => c.id === activeCategory)?.name || 'ทั้งหมด'}
              </h5>
              
              {filteredArticles.length > 0 ? (
                <div className="list-group list-group-flush">
                  {filteredArticles.map((article) => (
                    <div key={article.id} className="list-group-item list-group-item-action">
                      <div className="d-flex align-items-start">
                        <div className={`me-3 ${article.color}`}>
                          {article.icon}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1">{article.title}</h6>
                          <p className="text-muted small mb-0">{article.content}</p>
                        </div>
                        <ChevronRight size={16} className="text-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <Search size={48} className="text-muted mb-3" />
                  <p className="text-muted">ไม่พบบทความ</p>
                </div>
              )}
            </div>
          </div>

          {/* FAQs */}
          <div className="card modern-card mt-4">
            <div className="card-body">
              <h5 className="fw-bold mb-4">คำถามที่พบบ่อย (FAQ)</h5>
              <div className="accordion" id="faqAccordion">
                {faqs.map((faq, index) => (
                  <div key={index} className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#faq${index}`}
                      >
                        {faq.question}
                      </button>
                    </h2>
                    <div
                      id={`faq${index}`}
                      className="accordion-collapse collapse"
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
