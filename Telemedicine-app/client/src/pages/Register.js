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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BadgeIcon from '@mui/icons-material/Badge';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Background with overlay gradient
const RegisterContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url('/images/healthcare-background.jpg')`,
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
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(5),
  },
  '& .MuiTypography-h4': {
    fontSize: '2.2rem',  // Larger logo text
  },
  '& .MuiTypography-h5': {
    fontSize: '1.8rem',  // Larger heading text
  },
  '& .MuiTypography-h6': {
    fontSize: '1.4rem',  // Larger subheading text
  },
  '& .MuiInputBase-input': {
    fontSize: '1.1rem',  // Larger input text
  },
  '& .MuiInputLabel-root': {
    fontSize: '1.1rem',  // Larger input labels
  },
  '& .MuiTypography-body1': {
    fontSize: '1.1rem',  // Larger body text
  },
  '& .MuiTypography-body2': {
    fontSize: '1rem',    // Larger body text
  },
  '& .MuiStepLabel-label': {
    fontSize: '1.1rem',  // Larger stepper labels
    '&.Mui-active': {
      fontSize: '1.2rem', // Even larger for active step
    }
  }
}));

// Logo container
const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
}));

const steps = ['Account Type', 'Personal Info', 'Complete'];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: '',
    license: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (activeStep === 0 && !formData.role) {
      setError('Please select a role to continue');
      return;
    }
    
    if (activeStep === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill all required fields');
        return;
      }
      
      if (formData.role === 'doctor' && (!formData.specialization || !formData.license)) {
        setError('Please complete all doctor information');
        return;
      }
    }
    
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = formData.role === 'doctor' ? 
        { 
          ...formData, 
          profile: { specialization: formData.specialization, license: formData.license } 
        } : 
        formData;
      
      const res = await axios.post('http://localhost:5000/api/auth/register', payload);
      login(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      setError(err.response?.data?.error || "Registration failed");
      setActiveStep(1); // Go back to the form step
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              I want to register as:
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
              <Button
                variant={formData.role === 'patient' ? 'contained' : 'outlined'}
                onClick={() => setFormData({ ...formData, role: 'patient' })}
                sx={{ 
                  width: '45%', 
                  height: '120px',
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  '& .MuiSvgIcon-root': { fontSize: 48, mb: 1 },
                  '& .MuiTypography-root': { fontSize: '1.2rem' }
                }}
              >
                <PersonIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography>Patient</Typography>
              </Button>
              
              <Button
                variant={formData.role === 'doctor' ? 'contained' : 'outlined'}
                onClick={() => setFormData({ ...formData, role: 'doctor' })}
                sx={{ 
                  width: '45%', 
                  height: '120px',
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  '& .MuiSvgIcon-root': { fontSize: 48, mb: 1 },
                  '& .MuiTypography-root': { fontSize: '1.2rem' }
                }}
              >
                <LocalHospitalIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography>Doctor</Typography>
              </Button>
            </Box>
            
            <Box sx={{ 
              mt: 4, 
              p: 2, 
              bgcolor: 'rgba(25, 118, 210, 0.05)', 
              borderRadius: 1,
              border: '1px solid rgba(25, 118, 210, 0.2)'
            }}>
              <Typography variant="body2" align="center" sx={{ fontSize: '1.05rem' }}>
                {formData.role === 'patient' ? 
                  "Register as a patient to book appointments and consult with doctors." : 
                  "Register as a doctor to provide consultations and manage patient appointments."}
              </Typography>
            </Box>
          </Box>
        );
        
      case 1:
        return (
          <Box component="form" sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
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
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            {formData.role === 'doctor' && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MedicalServicesIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="License Number"
                  name="license"
                  value={formData.license}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}
          </Box>
        );
        
      case 2:
        return (
          <Box sx={{ textAlign: 'center', my: 3 }}>
            <Typography variant="h6" gutterBottom>
              Registration Details
            </Typography>
            
            <Box sx={{ 
              mt: 2, 
              p: 3, 
              bgcolor: 'rgba(76, 175, 80, 0.05)', 
              borderRadius: 2,
              border: '1px solid rgba(76, 175, 80, 0.2)'
            }}>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {formData.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {formData.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Role:</strong> {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
              </Typography>
              
              {formData.role === 'doctor' && (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Specialization:</strong> {formData.specialization}
                  </Typography>
                  <Typography variant="body1">
                    <strong>License Number:</strong> {formData.license}
                  </Typography>
                </>
              )}
            </Box>
            
            <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
              Please confirm your information to complete registration
            </Typography>
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <RegisterContainer>
      <Container maxWidth="sm">
        <FormContainer elevation={6}>
          <LogoContainer>
            <MedicalServicesIcon sx={{ fontSize: 45, color: 'primary.main', mr: 1 }} />
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
              TeleMed
            </Typography>
          </LogoContainer>
          
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
            Create Account
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2, fontSize: '1.05rem' }}>
              {error}
            </Alert>
          )}
          
          {renderStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, width: '100%' }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1, fontSize: '1.05rem' }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            
            {activeStep === steps.length - 1 ? (
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                disabled={loading}
                sx={{ fontSize: '1.05rem', py: 1 }}
              >
                {loading ? 'Submitting...' : 'Complete Registration'}
              </Button>
            ) : (
              <Button 
                variant="contained" 
                onClick={handleNext}
                sx={{ fontSize: '1.05rem', py: 1 }}
              >
                Next
              </Button>
            )}
          </Box>
          
          <Divider sx={{ width: '100%', mt: 4, mb: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Already have an account?
            </Typography>
            <Typography 
              component={Link} 
              to="/login" 
              variant="body2" 
              color="primary" 
              sx={{ textDecoration: 'none', fontWeight: 'bold' }}
            >
              Sign In
            </Typography>
          </Box>
        </FormContainer>
      </Container>
    </RegisterContainer>
  );
}
