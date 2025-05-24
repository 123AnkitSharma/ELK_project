import { Container, Typography, Paper, Box, Grid, Avatar } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SecurityIcon from '@mui/icons-material/Security';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DevicesIcon from '@mui/icons-material/Devices';
import ContactForm from '../components/ContactForm';  // Import the ContactForm component

export default function AboutUs() {
  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          About TeleMed
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph>
            At TeleMed, we believe healthcare should be accessible to everyone, regardless of location. 
            Our platform bridges the gap between patients and healthcare providers by enabling virtual consultations, 
            streamlined appointment booking, and secure medical record management.
          </Typography>
          <Typography variant="body1" paragraph>
            We're committed to transforming the healthcare experience by leveraging technology to make
            medical care more convenient, efficient, and patient-centered.
          </Typography>
        </Paper>
        
        <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
          Key Features
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <MedicalServicesIcon />
                </Avatar>
                <Typography variant="h6">Virtual Consultations</Typography>
              </Box>
              <Typography variant="body1">
                Connect with licensed healthcare professionals through our secure messaging system.
                Receive medical advice, diagnoses, and treatment plans without leaving your home.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AccessTimeIcon />
                </Avatar>
                <Typography variant="h6">Easy Appointment Scheduling</Typography>
              </Box>
              <Typography variant="body1">
                Book appointments with doctors based on their availability. Our platform shows you real-time 
                availability and lets you choose the most convenient time for your consultation.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <DevicesIcon />
                </Avatar>
                <Typography variant="h6">Medical Record Management</Typography>
              </Box>
              <Typography variant="body1">
                Access your complete medical history, including past consultations, diagnoses, prescriptions, 
                and uploaded reports. Share information securely with your healthcare providers as needed.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <SecurityIcon />
                </Avatar>
                <Typography variant="h6">Secure & Confidential</Typography>
              </Box>
              <Typography variant="body1">
                We prioritize the security and privacy of your health information. Our platform employs 
                end-to-end encryption for all communications and strict data protection policies.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom color="primary">
            How TeleMed Works
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>For Patients:</strong> Create an account, browse available doctors, book appointments,
            and consult with healthcare professionals through our messaging system. Upload medical reports
            for your doctor to review and access your complete medical history anytime.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>For Doctors:</strong> Manage your appointment schedule, communicate with patients,
            create medical records, and provide personalized care remotely. Our platform helps you
            organize patient information and deliver quality healthcare efficiently.
          </Typography>
          <Typography variant="body1">
            <strong>For Administrators:</strong> Monitor platform usage, manage user accounts,
            and ensure smooth operation of the telemedicine service through comprehensive
            analytics and user management tools.
          </Typography>
        </Paper>
      </Container>
      
      {/* Add ContactForm component at the bottom of the page */}
      <ContactForm />
    </>
  );
}