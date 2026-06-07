import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../config/apiClient';
import Swal from 'sweetalert2';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiClient.post("/auth/login", {
        username,
        password,
      });

      // 👑 แกะโทเค็นและออบเจกต์ผู้ใช้จากหลังบ้าน .NET ให้ถูกชั้น
      const { token, user: userData } = response.data;

      if (!token || !userData) {
        return {
          success: false,
          message: "ข้อมูลที่ส่งกลับมาจากเซิร์ฟเวอร์ไม่ถูกต้อง",
        };
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'Admin';
  const isStudent = () => user?.role === 'Student';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
