import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Decode token to get basic user info
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          
          // Fetch user data including name and status from the server
          const res = await axios.get(`http://localhost:5000/api/users/${payload.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Check if user status is active
          if (res.data.status === 'inactive') {
            // If inactive, log out the user
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            setUser(null);
            return;
          }
          
          // Set user data including name
          setUser({ 
            id: payload.id, 
            role: payload.role,
            name: res.data.name
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);
  const login = async (token) => {
    localStorage.setItem('token', token);
    // Decode token to get user ID and role
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    localStorage.setItem('role', payload.role);
    try {
      // Fetch complete user data including name
      const res = await axios.get(`http://localhost:5000/api/users/${payload.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ 
        id: payload.id, 
        role: payload.role,
        name: res.data.name
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser({ id: payload.id, role: payload.role });
    }
    navigate('/dashboard');
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    navigate('/');
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);