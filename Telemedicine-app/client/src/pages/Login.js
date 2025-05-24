import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Box, 
  Paper, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

// Background with overlay gradient
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url('/images/medical-background.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  padding: theme.spacing(3),
}));

// Styled form container
const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(1),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(5),
  },
  '& .MuiTypography-h4': {
    fontSize: '2.2rem',  // Larger logo text
  },
  '& .MuiTypography-h5': {
    fontSize: '1.8rem',  // Larger welcome text
  },
  '& .MuiInputBase-input': {
    fontSize: '1.1rem',  // Larger input text
  },
  '& .MuiInputLabel-root': {
    fontSize: '1.1rem',  // Larger input labels
  },
  '& .MuiTypography-body2': {
    fontSize: '1rem',    // Larger body text
  },
}));

// Logo container
const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
}));

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      login(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err.response?.data);
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Container maxWidth="sm">
        <FormContainer elevation={6}>
          <LogoContainer>
            <MedicalServicesIcon sx={{ fontSize: 45, color: 'primary.main', mr: 1 }} />
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
              TeleMed
            </Typography>
          </LogoContainer>

          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
            Welcome Back
          </Typography>

          <Box
            component="img"
            src="/images/doctor-login.jpg"
            alt="Doctor illustration"
            sx={{ height: 180, width: '100%', objectFit: 'contain', mb: 3, borderRadius: 2 }}
          />

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" sx={{ fontSize: 24 }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" sx={{ fontSize: 24 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5, 
                fontSize: '1.2rem',
                fontWeight: 500 
              }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <Divider sx={{ width: '100%', mt: 2, mb: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Don't have an account?
              </Typography>
              <Typography 
                component={Link} 
                to="/register" 
                variant="body2" 
                color="primary" 
                sx={{ textDecoration: 'none', fontWeight: 'bold' }}
              >
                Sign Up
              </Typography>
            </Box>
          </Box>
        </FormContainer>
      </Container>
    </LoginContainer>
  );
}