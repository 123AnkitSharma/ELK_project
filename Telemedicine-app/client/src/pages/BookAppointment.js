import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container, Typography, Box, Paper, Grid, TextField,
  Button, FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, CardActions, Avatar, Snackbar, Alert,
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  
  // New state variables for doctor availability
  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  
  // Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/doctors');
        setDoctors(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch doctor availability when a doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      const fetchDoctorAvailability = async () => {
        setLoadingAvailability(true);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:5000/api/availability/${selectedDoctor}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setDoctorAvailability(res.data);
        } catch (err) {
          console.error('Error fetching doctor availability:', err);
          setAlert({
            open: true,
            message: 'Could not fetch doctor availability',
            severity: 'error'
          });
        } finally {
          setLoadingAvailability(false);
        }
      };
      fetchDoctorAvailability();
      setSelectedDate(null); // Reset date when doctor changes
      setSelectedTime(''); // Reset time when doctor changes
    }
  }, [selectedDoctor]);
  
  // Check if a date is available for the selected doctor
  const isDateAvailable = (date) => {
    if (!doctorAvailability || doctorAvailability.length === 0) return false;
    
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    return doctorAvailability.some(avail => avail.day === dayOfWeek);
  };
  
  // Update available time slots when date changes
  useEffect(() => {
    if (selectedDate && doctorAvailability && doctorAvailability.length > 0) {
      // Get day of week from selected date
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate.getDay()];
      
      // Find doctor availability for this day
      const dayAvailability = doctorAvailability.find(avail => avail.day === dayOfWeek);
      
      if (dayAvailability && dayAvailability.slots.length > 0) {
        // Generate time slots based on doctor's availability
        const slots = [];
        
        dayAvailability.slots.forEach(slot => {
          // Convert 24h format to 12h format for display
          const convertTo12HFormat = (time24h) => {
            const [hours, minutes] = time24h.split(':');
            const h = parseInt(hours);
            const suffix = h >= 12 ? 'PM' : 'AM';
            const h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
            return `${h12.toString().padStart(2, '0')}:${minutes} ${suffix}`;
          };
          
          // Generate hourly slots between start and end time
          const generateHourlySlots = (start, end) => {
            const result = [];
            const startTime = new Date(`2000-01-01T${start}`);
            const endTime = new Date(`2000-01-01T${end}`);
            
            // Create hourly increments
            while (startTime < endTime) {
              const timeString = startTime.toTimeString().slice(0, 5);
              result.push(convertTo12HFormat(timeString));
              startTime.setHours(startTime.getHours() + 1);
            }
            
            return result;
          };
          
          // Add all slots from this availability window
          slots.push(...generateHourlySlots(slot.startTime, slot.endTime));
        });
        
        setAvailableTimeSlots(slots);
      } else {
        // No slots available for this day
        setAvailableTimeSlots([]);
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, doctorAvailability]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setAlert({
        open: true,
        message: 'Please fill all the fields',
        severity: 'error'
      });
      return;
    }
    
    // Additional validation to ensure the selected time is available
    if (availableTimeSlots.length > 0 && !availableTimeSlots.includes(selectedTime)) {
      setAlert({
        open: true,
        message: 'The selected time is not available',
        severity: 'error'
      });
      return;
    }
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/appointments', {
        doctor: selectedDoctor,
        patient: user.id,
        date: selectedDate,
        time: selectedTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAlert({
        open: true,
        message: 'Appointment booked successfully',
        severity: 'success'
      });
      
      // Reset form
      setSelectedDoctor('');
      setSelectedDate(null);
      setSelectedTime('');
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error(err);
      setAlert({
        open: true,
        message: err.response?.data?.error || 'Failed to book appointment',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Custom date picker filter function
  const shouldDisableDate = (date) => {
    // Disable past dates
    if (date < new Date().setHours(0, 0, 0, 0)) {
      return true;
    }
    
    // Disable dates where doctor is not available
    return !isDateAvailable(date);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="500" gutterBottom>
          Book an Appointment
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a doctor, choose an available time slot and schedule your appointment
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Doctor Selection Panel */}
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 2,
                position: 'relative'
              }}
            >
              <Typography variant="h6" fontWeight="500" gutterBottom>
                Select Doctor
              </Typography>

              <Box sx={{ mt: 2, maxHeight: '60vh', overflow: 'auto', pr: 1 }}>
                {doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <Card 
                      key={doctor._id}
                      elevation={selectedDoctor === doctor._id ? 3 : 1}
                      sx={{ 
                        mb: 2, 
                        borderRadius: 2,
                        border: selectedDoctor === doctor._id ? '2px solid #1976d2' : '1px solid #eee',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => setSelectedDoctor(doctor._id)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 60, 
                              height: 60, 
                              bgcolor: selectedDoctor === doctor._id ? 'primary.main' : 'grey.400',
                              fontSize: '1.5rem'
                            }}
                          >
                            {doctor.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="h6" fontWeight="500">
                              Dr. {doctor.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {doctor.profile?.specialization || 'General Medicine'}
                            </Typography>
                            {selectedDoctor === doctor._id && (
                              <Box sx={{ mt: 1 }}>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    bgcolor: 'primary.main', 
                                    color: 'white', 
                                    px: 1, 
                                    py: 0.5, 
                                    borderRadius: 1 
                                  }}
                                >
                                  Selected
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No doctors available at the moment
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Calendar and Time Selection Panel */}
          <Grid item xs={12} md={7}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                minHeight: '50vh',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {loadingAvailability ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <CircularProgress size={30} />
                  <Typography sx={{ ml: 2 }}>Loading doctor's availability...</Typography>
                </Box>
              ) : !selectedDoctor ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Please select a doctor
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Doctor details and available time slots will appear here
                  </Typography>
                </Box>
              ) : doctorAvailability.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    This doctor has not set their availability yet. Please select another doctor.
                  </Alert>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit} sx={{ height: '100%' }}>
                  <Typography variant="h6" fontWeight="500" gutterBottom>
                    Select Date and Time
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Appointment Date
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          value={selectedDate}
                          onChange={setSelectedDate}
                          shouldDisableDate={shouldDisableDate}
                          minDate={new Date()}
                          renderInput={(params) => <TextField {...params} fullWidth size="medium" />}
                        />
                      </LocalizationProvider>
                      {selectedDate && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Available on {selectedDate.toDateString()}
                        </Typography>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Preferred Time
                      </Typography>
                      <FormControl fullWidth disabled={!selectedDate || availableTimeSlots.length === 0}>
                        <InputLabel>Select Time Slot</InputLabel>
                        <Select
                          value={selectedTime}
                          label="Select Time Slot"
                          onChange={(e) => setSelectedTime(e.target.value)}
                        >
                          {availableTimeSlots.length > 0 ? (
                            availableTimeSlots.map((time) => (
                              <MenuItem key={time} value={time}>
                                {time}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No available slots</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                      {availableTimeSlots.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {availableTimeSlots.length} time slots available
                        </Typography>
                      )}
                    </Grid>
                  </Grid>

                  {/* Summary Section */}
                  {selectedDate && selectedTime && (
                    <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Appointment Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">
                            Doctor
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            Dr. {doctors.find(d => d._id === selectedDoctor)?.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">
                            Date
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {selectedDate?.toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">
                            Time
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {selectedTime}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting || !selectedDate || !selectedTime || availableTimeSlots.length === 0}
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        borderRadius: 2,
                        boxShadow: 2
                      }}
                    >
                      {submitting ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                          Booking...
                        </>
                      ) : 'Book Appointment'}
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
      
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}