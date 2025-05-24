import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Container, Typography, Box, Paper, Grid, TextField,
  Button, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert, CircularProgress
} from '@mui/material';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    bloodGroup: '',
    specialization: '',
    license: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile({
          name: res.data.name || '',
          email: res.data.email || '',
          age: res.data.profile?.age || '',
          gender: res.data.profile?.gender || '',
          phone: res.data.profile?.phone || '',
          address: res.data.profile?.address || '',
          bloodGroup: res.data.profile?.bloodGroup || '',
          specialization: res.data.profile?.specialization || '',
          license: res.data.profile?.license || ''
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setAlert({
          open: true,
          message: 'Failed to load profile',
          severity: 'error'
        });
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/users/${user.id}`, {
        name: profile.name,
        profile: {
          age: profile.age,
          gender: profile.gender,
          phone: profile.phone,
          address: profile.address,
          bloodGroup: profile.bloodGroup,
          specialization: profile.specialization,
          license: profile.license
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlert({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error(err);
      setAlert({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profile.email}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={profile.age}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender-select"
                  name="gender"
                  value={profile.gender || ""}
                  label="Gender"
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>Select Gender</em>
                  </MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={profile.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="bloodgroup-label">Blood Group</InputLabel>
                <Select
                  labelId="bloodgroup-label"
                  id="bloodgroup-select"
                  name="bloodGroup"
                  value={profile.bloodGroup || ""}
                  label="Blood Group"
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>Select Blood Group</em>
                  </MenuItem>
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {user && user.role === 'doctor' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Specialization"
                    name="specialization"
                    value={profile.specialization}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="License Number"
                    name="license"
                    value={profile.license}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              </>
            )}
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </Button>
          </Box>
        </Box>
      </Paper>
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