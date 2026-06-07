import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password);

      if (result && result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-4">
        <img
          src="https://img2.pic.in.th/unnamed-removebg-preview3a1bc4db8f4389e5.png"
          alt="โลโก้ระบบออมทรัพย์นักเรียน"
          className="auth-logo"
        />
        <h1 className="auth-title mb-2">ระบบออมทรัพย์นักเรียน</h1>
        <p className="auth-subtitle">เข้าสู่ระบบเพื่อจัดการเงินออมอย่างปลอดภัย</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            ชื่อผู้ใช้
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="กรอกชื่อผู้ใช้"
            disabled={loading}
            required
            aria-required="true"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="form-label">
            รหัสผ่าน
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="กรอกรหัสผ่าน"
            disabled={loading}
            required
            aria-required="true"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 btn-login"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              กำลังเข้าสู่ระบบ...
            </>
          ) : (
            <>
              <LogIn size={20} className="me-2" aria-hidden="true" />
              เข้าสู่ระบบ
            </>
          )}
        </button>
      </form>

      <p className="text-center mt-4 mb-0 small text-muted">
        © 2026 ระบบออมทรัพย์นักเรียน | By ครูเปิงมางfc
      </p>
    </>
  );
};

export default Login;
