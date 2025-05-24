import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Container, Typography, Box, Paper, Grid, Card, 
  CardContent, CardHeader, Divider, Button, List, 
  ListItem, ListItemText, CircularProgress, Dialog, 
  DialogTitle, DialogContent, DialogActions, ListItemAvatar, Avatar, 
  DialogContentText, TextField, Checkbox, FormControlLabel, IconButton, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MessageIcon from '@mui/icons-material/Message';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Link, useNavigate, Navigate } from 'react-router-dom';

// Styled components for enhanced visuals
const DashboardHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundImage: 'url("/images/patient-dashboard-header.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: 'white',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: theme.spacing(2),
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1.5, 0),
  borderRadius: theme.spacing(1),
  fontSize: '0.9rem',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const AppointmentCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.03)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  background: 'linear-gradient(to right, #ffffff, #f9fafe)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
  },
}));

// Add these helper functions before the DoctorDashboard component

// Convert 24-hour time to 12-hour time (with AM/PM)
const convert24To12 = (time24) => {
  if (!time24) return '09:00 AM'; // Default

  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Convert 12-hour time (with AM/PM) to 24-hour time
const convert12To24 = (time12) => {
  if (!time12) return '09:00';
  
  const [timePart, period] = time12.split(' ');
  const [hours, minutes] = timePart.split(':').map(Number);
  
  let hours24 = hours;
  if (period === 'PM' && hours !== 12) {
    hours24 = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    hours24 = 0;
  }
  
  return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Generate time options in 30-minute intervals
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const hours24 = hour.toString().padStart(2, '0');
      const minutes = minute.toString().padStart(2, '0');
      const time24 = `${hours24}:${minutes}`;
      options.push({
        value: convert24To12(time24),
        label: convert24To12(time24)
      });
    }
  }
  return options;
};

// Component for Patient Dashboard
const PatientDashboard = ({ appointments }) => {
  const [showDoctorDialog, setShowDoctorDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [reportDescription, setReportDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleReportUpload = async () => {
    if (!reportFile) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('report', reportFile);
      formData.append('description', reportDescription);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/reports/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload report');
      }
      
      const data = await response.json();
      console.log('Report uploaded successfully', data);
      
      // Reset form and close dialog
      setReportFile(null);
      setReportDescription('');
      setShowUploadDialog(false);
      
      // Show success message
      alert('Report uploaded successfully!');
    } catch (error) {
      console.error('Error uploading report:', error);
      alert('Failed to upload report. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <DashboardHeader sx={{
        background: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)',
        boxShadow: '0 8px 20px rgba(0, 97, 255, 0.2)',
        '&::before': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome to Your Health Portal
          </Typography>
          <Typography variant="subtitle1">
            Manage your appointments, records, and stay connected with your healthcare providers
          </Typography>
        </Box>
      </DashboardHeader>

      <Grid container spacing={3}>
        {/* Upcoming Appointments Section */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" fontWeight="500" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <EventNoteIcon sx={{ mr: 1 }} /> Upcoming Appointments
          </Typography>
          <Box sx={{ 
            backgroundImage: 'url("/images/appointment-bg.jpg")', // 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            p: 2,
            borderRadius: 4,
            position: 'relative',
            mb: 3
          }}>
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 4,
            }}/>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              {appointments.length > 0 ? (
                appointments.map((app) => (
                  <AppointmentCard key={app._id}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={7}>
                        <Typography variant="h6" fontWeight="500" color="primary">
                          Dr. {app.doctor.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(app.date).toLocaleDateString()} at {app.time}
                        </Typography>
                        <Box sx={{ 
                          display: 'inline-block', 
                          mt: 1,
                          px: 1.5, 
                          py: 0.5, 
                          bgcolor: app.status === 'approved' ? 'success.100' : 'warning.100',
                          color: app.status === 'approved' ? 'success.800' : 'warning.800',
                          borderRadius: 2,
                          fontSize: '0.875rem',
                        }}>
                          Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          startIcon={<MessageIcon />}
                          component={Link}
                          to={`/messages/${app.doctor._id}`}
                        >
                          Message
                        </Button>
                        <Button 
                          variant="contained" 
                          size="small"
                          disabled={app.status !== 'approved'}
                          title={app.status !== 'approved' ? `Cannot start consultation: appointment is ${app.status}` : "Start your consultation"}
                          onClick={() => {
                            localStorage.setItem('activeAppointment', app._id);
                            navigate(`/messages/${app.doctor._id}`);
                          }}
                        >
                          Start Consultation
                        </Button>
                      </Grid>
                    </Grid>
                  </AppointmentCard>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No upcoming appointments scheduled.
                  </Typography>
                  <Button 
                    variant="contained" 
                    component={Link} 
                    to="/book-appointment"
                    sx={{ mt: 2 }}
                  >
                    Book an Appointment
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
        
        {/* Quick Actions Section */}
        <Grid item xs={12} md={4}>
          <Box sx={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Box 
              sx={{ 
                backgroundColor: '#1976d2', 
                color: 'white', 
                p: 2,
                background: 'linear-gradient(to right, #1976d2, #2196f3)'
              }}
            >
              <Typography variant="h6" fontWeight="500">Quick Actions</Typography>
            </Box>
            <Box sx={{ 
              backgroundColor: 'white', 
              p: 2, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
            }}>
              <ActionButton 
                fullWidth 
                variant="outlined" 
                startIcon={<MedicalServicesIcon />}
                component={Link}
                to="/medical-history"
                sx={{ mb: 1.5 }}
              >
                VIEW MEDICAL HISTORY
              </ActionButton>
              <ActionButton
                fullWidth
                variant="outlined"
                startIcon={<MessageIcon />}
                onClick={() => setShowDoctorDialog(true)}
                disabled={appointments.length === 0}
                sx={{ mb: 1.5 }}
              >
                MESSAGE DOCTOR
              </ActionButton>
              <ActionButton 
                fullWidth 
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => setShowUploadDialog(true)}
              >
                UPLOAD REPORT
              </ActionButton>
            </Box>
          </Box>
          
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            borderRadius: 4, 
            background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.2,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}/>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h6" fontWeight="500" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <FavoriteBorderIcon sx={{ mr: 1 }} /> Health Tip of the Day
              </Typography>
              <Typography variant="body2">
                Regular exercise not only helps you stay fit but also improves your mental health and boosts your immune system.
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Doctor Selection Dialog */}
      <Dialog open={showDoctorDialog} onClose={() => setShowDoctorDialog(false)}>
        <DialogTitle>Select a doctor to message</DialogTitle>
        <DialogContent>
          <List>
            {appointments.length > 0 ? (
              [...new Map(appointments.map(app => [app.doctor._id, app.doctor])).values()].map((doctor) => (
                <ListItem 
                  button 
                  key={doctor._id}
                  onClick={() => {
                    setShowDoctorDialog(false);
                    navigate(`/messages/${doctor._id}`);
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>{doctor.name.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={`Dr. ${doctor.name}`} />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No doctors available. Book an appointment first." />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDoctorDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Report Upload Dialog */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)}>
        <DialogTitle>Upload Medical Report</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Upload your medical reports for your doctor to review.
          </DialogContentText>
          
          <TextField
            margin="dense"
            id="description"
            label="Report Description"
            fullWidth
            variant="outlined"
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <input
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            id="report-file"
            type="file"
            onChange={(e) => setReportFile(e.target.files[0])}
          />
          <label htmlFor="report-file">
            <Button variant="contained" component="span" startIcon={<UploadFileIcon />}>
              Select File
            </Button>
          </label>
          
          {reportFile && (
            <Box mt={1}>
              <Typography variant="body2">
                Selected: {reportFile.name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleReportUpload} 
            disabled={!reportFile || isUploading}
            variant="contained"
            color="success"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Component for Doctor Dashboard
const DoctorDashboard = ({ appointments, user }) => {
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const weekdays = useMemo(() => 
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    []
  );

  // Fetch doctor's availability when dialog opens
  useEffect(() => {
    if (showAvailabilityDialog) {
      const fetchAvailability = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:5000/api/availability/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const availData = res.data.length > 0 ? res.data : [];
          
          // Make sure all days are represented
          const availByDay = {};
          weekdays.forEach(day => {
            availByDay[day] = { selected: false, slots: [{ startTime: '09:00', endTime: '17:00' }] };
          });
          
          // Fill with existing data - ensure only one slot per day
          availData.forEach(item => {
            availByDay[item.day] = {
              selected: true,
              slots: item.slots.length > 0 
                ? [item.slots[0]]  // Take only the first slot
                : [{ startTime: '09:00', endTime: '17:00' }]
            };
          });
          
          setAvailability(availByDay);
        } catch (error) {
          console.error('Error fetching availability:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchAvailability();
    }
  }, [showAvailabilityDialog, user?.id, weekdays]);

  const handleUpdateAvailability = async () => {
    try {
      setUpdating(true);
      
      // Format the data for the API
      const formattedAvailability = Object.keys(availability)
        .filter(day => availability[day].selected)
        .map(day => ({
          day,
          slots: availability[day].slots
        }));
        
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/availability', 
        { availability: formattedAvailability },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowAvailabilityDialog(false);
      alert('Availability updated successfully');
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability');
    } finally {
      setUpdating(false);
    }
  };

  const handleDayToggle = (day) => {
    setAvailability({
      ...availability,
      [day]: {
        // Safely access existing properties or use defaults
        ...(availability[day] || {}),
        selected: availability[day] ? !availability[day].selected : true,
        // Always ensure exactly one slot
        slots: (availability[day] && availability[day].slots && availability[day].slots.length) 
          ? [availability[day].slots[0]]  // Keep only the first slot if exists
          : [{ startTime: '09:00', endTime: '17:00' }]  // Otherwise create a default slot
      }
    });
  };

  const handleSlotChange = (day, index, field, value) => {
    const updatedAvail = { ...availability };
    updatedAvail[day].slots[index][field] = value;
    setAvailability(updatedAvail);
  };

  return (
    <>
      <DashboardHeader sx={{
        backgroundImage: 'none',
        background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)', // Add attractive gradient
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        '&::before': {
          backgroundColor: 'transparent',
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome, Dr. {user?.name || ''}
          </Typography>
          <Typography variant="subtitle1">
            Manage your appointments, patient records, and availability all in one place
          </Typography>
        </Box>
      </DashboardHeader>

      <Grid container spacing={3}>
        {/* Appointments Section */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" fontWeight="500" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <EventNoteIcon sx={{ mr: 1 }} /> Today's Appointments
          </Typography>
          <Box sx={{ 
            backgroundImage: 'url("/images/doctor-appointment-bg.jpg")', 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            p: 2,
            borderRadius: 4,
            position: 'relative'
          }}>
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 4,
            }}/>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              {appointments.filter(app => 
                new Date(app.date).toDateString() === new Date().toDateString()
              ).length > 0 ? (
                appointments.filter(app => 
                  new Date(app.date).toDateString() === new Date().toDateString()
                ).map((app) => (
                  <AppointmentCard key={app._id}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={7}>
                        <Typography variant="h6" fontWeight="500" color="primary">
                          Patient: {app.patient?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {app.time}
                        </Typography>
                        <Box sx={{ 
                          display: 'inline-block', 
                          mt: 1,
                          px: 1.5, 
                          py: 0.5, 
                          bgcolor: 
                            app.status === 'approved' ? 'success.100' : 
                            app.status === 'pending' ? 'warning.100' : 
                            app.status === 'rejected' ? 'error.100' : 'info.100',
                          color: 
                            app.status === 'approved' ? 'success.800' : 
                            app.status === 'pending' ? 'warning.800' : 
                            app.status === 'rejected' ? 'error.800' : 'info.800',
                          borderRadius: 2,
                          fontSize: '0.875rem',
                        }}>
                          Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          startIcon={<MessageIcon />}
                          component={Link}
                          to={`/messages/${app.patient._id}`}
                        >
                          Message
                        </Button>
                        <Button 
                          variant="contained" 
                          size="small"
                          disabled={app.status !== 'approved'}
                          title={app.status !== 'approved' ? `Cannot start consultation: appointment is ${app.status}` : "Start your consultation"}
                          onClick={() => {
                            localStorage.setItem('activeAppointment', app._id);
                            navigate(`/messages/${app.patient._id}`);
                          }}
                        >
                          Start Consultation
                        </Button>
                      </Grid>
                    </Grid>
                  </AppointmentCard>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No appointments scheduled for today.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Upcoming Appointments Summary */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appointments Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <StyledCard sx={{ bgcolor: 'primary.light', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4">
                      {appointments.length}
                    </Typography>
                    <Typography variant="body2">
                      Total
                    </Typography>
                  </CardContent>
                </StyledCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <StyledCard sx={{ bgcolor: 'warning.light', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4">
                      {appointments.filter(app => app.status === 'pending').length}
                    </Typography>
                    <Typography variant="body2">
                      Pending
                    </Typography>
                  </CardContent>
                </StyledCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <StyledCard sx={{ bgcolor: 'success.light', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4">
                      {appointments.filter(app => app.status === 'approved').length}
                    </Typography>
                    <Typography variant="body2">
                      Approved
                    </Typography>
                  </CardContent>
                </StyledCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <StyledCard sx={{ bgcolor: 'info.light', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4">
                      {appointments.filter(app => app.status === 'completed').length}
                    </Typography>
                    <Typography variant="body2">
                      Completed
                    </Typography>
                  </CardContent>
                </StyledCard>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        
        {/* Quick Actions Section */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardHeader 
              title="Quick Actions" 
              sx={{ 
                backgroundColor: 'primary.main', 
                color: 'white',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }} 
            />
            <CardContent>
              <ActionButton 
                fullWidth 
                variant="outlined"
                onClick={() => setShowAvailabilityDialog(true)}
              >
                UPDATE AVAILABILITY
              </ActionButton>
              <ActionButton 
                fullWidth 
                variant="outlined" 
                component={Link}
                to="/patient-records"
              >
                PATIENT RECORDS
              </ActionButton>
              <ActionButton 
                fullWidth 
                variant="outlined"
                component={Link}
                to="/profile"
              >
                UPDATE PROFILE
              </ActionButton>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
      
      {/* Availability Dialog */}
      {showAvailabilityDialog && (
        <Dialog 
          open={showAvailabilityDialog} 
          onClose={() => setShowAvailabilityDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Update Availability</DialogTitle>
          <DialogContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Select the days and time slots when you are available for appointments
                </Typography>
                
                {weekdays.map((day) => (
                  <Box key={day} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={availability[day]?.selected || false}
                          onChange={() => handleDayToggle(day)}
                          name={day}
                        />
                      }
                      label={<Typography variant="h6">{day}</Typography>}
                    />
                    
                    {availability[day]?.selected && (
                      <Box sx={{ pl: 4, pt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <FormControl sx={{ mr: 2, width: 140 }}>
                            <InputLabel id={`start-time-label-${day}-0`}>Start Time</InputLabel>
                            <Select
                              labelId={`start-time-label-${day}-0`}
                              value={convert24To12(availability[day].slots[0].startTime)}
                              label="Start Time"
                              onChange={(e) => {
                                const time24h = convert12To24(e.target.value);
                                handleSlotChange(day, 0, 'startTime', time24h);
                              }}
                            >
                              {generateTimeOptions().map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          
                          <FormControl sx={{ mr: 2, width: 140 }}>
                            <InputLabel id={`end-time-label-${day}-0`}>End Time</InputLabel>
                            <Select
                              labelId={`end-time-label-${day}-0`}
                              value={convert24To12(availability[day].slots[0].endTime)}
                              label="End Time"
                              onChange={(e) => {
                                const time24h = convert12To24(e.target.value);
                                handleSlotChange(day, 0, 'endTime', time24h);
                              }}
                            >
                              {generateTimeOptions().map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAvailabilityDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleUpdateAvailability}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Availability'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/appointments/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    if (user) {
      fetchAppointments();
    }
  }, [user]);
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {user ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard` : 'Dashboard'}
      </Typography>
      {user && user.role === 'patient' && (
        <PatientDashboard appointments={appointments} />
      )}
      {user && user.role === 'doctor' && (
        <DoctorDashboard appointments={appointments} user={user} />
      )}
      {user && user.role === 'admin' && (
        <Navigate to="/admin" replace />
      )}
    </Container>
  );
}