import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, Box, Paper, Grid, Card, CardContent,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, 
  CircularProgress, CardHeader, Button, useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

// Styled components for enhanced visuals
const DashboardHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: 'white',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  }
}));

const StatCard = styled(Card)(({ theme, bgcolor }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  backgroundColor: bgcolor || theme.palette.primary.main,
  color: 'white',
  boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1.5, 0),
  borderRadius: theme.spacing(1),
  fontSize: '0.9rem',
  fontWeight: 'bold',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  height: '100%',
}));

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    doctors: 0,
    patients: 0,
    appointments: 0,
    pendingAppointments: 0,
    recentUsers: [],
    appointmentsByStatus: [],
    usersByRole: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <DashboardHeader>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Admin Control Center
          </Typography>
          <Typography variant="subtitle1">
            Monitor system performance, manage users, and analyze platform metrics
          </Typography>
        </Box>
      </DashboardHeader>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={6} sm={3}>
          <StatCard bgcolor="#3f51b5">
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <PersonIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
              <Typography variant="h4" fontWeight="bold">{stats.totalUsers}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Users</Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard bgcolor="#f50057">
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <MedicalServicesIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
              <Typography variant="h4" fontWeight="bold">{stats.doctors}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Doctors</Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard bgcolor="#00a152">
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <PersonIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
              <Typography variant="h4" fontWeight="bold">{stats.patients}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Patients</Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard bgcolor="#ff9100">
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <EventNoteIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
              <Typography variant="h4" fontWeight="bold">{stats.appointments}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Appointments</Typography>
            </CardContent>
          </StatCard>
        </Grid>
        
        {/* Charts Section */}
        <Grid item xs={12} md={6}>
          <ChartContainer>
            <Typography variant="h6" fontWeight="500" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} /> Users by Role
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.usersByRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </ChartContainer>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ChartContainer>
            <Typography variant="h6" fontWeight="500" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <EventNoteIcon sx={{ mr: 1 }} /> Appointments by Status
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.appointmentsByStatus}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartContainer>
        </Grid>
        
        {/* Recent Users */}
        <Grid item xs={12} md={8}>
          <ChartContainer>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="500" sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} /> Recent Users
              </Typography>
              <Button 
                component={Link} 
                to="/users" 
                variant="contained" 
                size="small"
                endIcon={<PersonIcon />}
                sx={{ borderRadius: 2 }}
              >
                View All Users
              </Button>
            </Box>
            <List>
              {stats.recentUsers.map((user) => (
                <ListItem key={user._id} divider sx={{ 
                  py: 1.5,
                  transition: 'background 0.2s',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                  borderRadius: 1
                }}>
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: user.role === 'doctor' ? '#f50057' : 
                               user.role === 'admin' ? '#3f51b5' : '#00a152'
                    }}>
                      {user.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography fontWeight="500">{user.name}</Typography>}
                    secondary={`${user.email} | ${user.role.charAt(0).toUpperCase() + user.role.slice(1)} | Created: ${new Date(user.createdAt).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </ChartContainer>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardHeader 
              title="Quick Actions" 
              sx={{ 
                backgroundColor: theme.palette.primary.main, 
                color: 'white',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }} 
            />
            <CardContent>
              <ActionButton 
                fullWidth 
                variant="contained" 
                color="primary"
                sx={{ mb: 2 }}
                component={Link} 
                to="/users"
                startIcon={<ManageAccountsIcon />}
              >
                MANAGE USERS
              </ActionButton>
              <ActionButton 
                fullWidth 
                variant="contained"
                color="secondary" 
                sx={{ mb: 2 }}
                component={Link} 
                to="/reports"
                startIcon={<AssessmentIcon />}
              >
                VIEW REPORTS
              </ActionButton>
              <ActionButton 
                fullWidth 
                variant="contained"
                color="info"
                component={Link} 
                to="/profile"
                startIcon={<AccountBoxIcon />}
              >
                UPDATE PROFILE
              </ActionButton>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Container>
  );
}