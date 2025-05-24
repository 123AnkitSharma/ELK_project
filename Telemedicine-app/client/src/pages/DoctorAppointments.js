import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Container, Typography, Box, Paper, Grid, 
  List, ListItem, ListItemText, Button, 
  CircularProgress, Tabs, Tab, FormControl,
  InputLabel, Select, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions,
  TextField, Snackbar, Alert
} from '@mui/material';

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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
        console.error('Error fetching appointments:', err);
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state
      setAppointments(appointments.map(app => 
        app._id === appointmentId ? { ...app, status: newStatus } : app
      ));
      
      setAlert({
        open: true,
        message: `Appointment ${newStatus} successfully`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setAlert({
        open: true,
        message: 'Error updating appointment status',
        severity: 'error'
      });
    }
  };

  const handleAddNotes = async () => {
    if (!notes.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/appointments/${selectedAppointment._id}/notes`, 
        { notes },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state
      setAppointments(appointments.map(app => 
        app._id === selectedAppointment._id ? { ...app, notes } : app
      ));
      
      setShowDetailsDialog(false);
      setAlert({
        open: true,
        message: 'Notes added successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error adding notes:', err);
      setAlert({
        open: true,
        message: 'Error adding notes',
        severity: 'error'
      });
    }
  };

  const openDetailsDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || '');
    setShowDetailsDialog(true);
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Filter appointments based on tab and status
  const filteredAppointments = appointments.filter(app => {
    // First filter by tab (date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(app.date);
    appointmentDate.setHours(0, 0, 0, 0); // Reset hours to ensure proper date comparison
    
    if (tabValue === 0) { // Today
      // Show only today's appointments
      return appointmentDate.getTime() === today.getTime() && 
             (statusFilter === 'all' || app.status === statusFilter);
    } else if (tabValue === 1) { // Upcoming
      // Show appointments with dates in the future
      return appointmentDate.getTime() > today.getTime() && 
             (statusFilter === 'all' || app.status === statusFilter);
    } else if (tabValue === 2) { // Past
      // Show appointments with dates in the past
      return appointmentDate.getTime() < today.getTime() && 
             (statusFilter === 'all' || app.status === statusFilter);
    }
    
    // If no tab matches (shouldn't happen), return false
    return false;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Appointments</Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Today" />
          <Tab label="Upcoming" />
          <Tab label="Past" />
        </Tabs>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status Filter"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {filteredAppointments.length > 0 ? (
              <List>
                {filteredAppointments.map((app) => (
                  <Paper key={app._id} sx={{ mb: 2, p: 2 }}>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1">
                          Patient: {app.patient?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(app.date).toLocaleDateString()} at {app.time}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box 
                          sx={{ 
                            display: 'inline-block',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: 
                              app.status === 'approved' ? 'success.100' : 
                              app.status === 'pending' ? 'warning.100' : 
                              app.status === 'rejected' ? 'error.100' : 
                              'info.100',
                            color: 
                              app.status === 'approved' ? 'success.800' : 
                              app.status === 'pending' ? 'warning.800' : 
                              app.status === 'rejected' ? 'error.800' : 
                              'info.800',
                          }}
                        >
                          {app.status.toUpperCase()}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button 
                            size="small" 
                            onClick={() => openDetailsDialog(app)}
                          >
                            Details
                          </Button>
                          
                          {app.status === 'pending' && (
                            <>
                              <Button 
                                size="small" 
                                variant="contained" 
                                color="success"
                                onClick={() => handleStatusChange(app._id, 'approved')}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="small" 
                                variant="contained" 
                                color="error"
                                onClick={() => handleStatusChange(app._id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {app.status === 'approved' && (
                            <Button 
                              size="small" 
                              variant="contained"
                              onClick={() => handleStatusChange(app._id, 'completed')}
                            >
                              Mark Completed
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No {tabValue === 0 ? "today's" : tabValue === 1 ? "upcoming" : "past"} appointments {statusFilter !== 'all' ? `with '${statusFilter}' status` : ''}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Appointments Summary</Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Total Appointments" 
                  secondary={appointments.length} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Pending" 
                  secondary={appointments.filter(app => app.status === 'pending').length} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Approved" 
                  secondary={appointments.filter(app => app.status === 'approved').length} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Completed" 
                  secondary={appointments.filter(app => app.status === 'completed').length} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Rejected" 
                  secondary={appointments.filter(app => app.status === 'rejected').length} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Patient</Typography>
                  <Typography variant="body1" gutterBottom>{selectedAppointment.patient?.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Date & Time</Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Typography variant="body1" gutterBottom>{selectedAppointment.status}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Notes</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Add appointment notes here"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          <Button 
            onClick={handleAddNotes}
            variant="contained"
            color="primary"
          >
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Alert Snackbar */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}