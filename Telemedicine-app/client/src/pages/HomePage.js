import React from 'react';
import { 
  Box, Container, Typography, Button, Grid, Card, CardContent, 
  CardMedia, Stack, Paper, Divider, Avatar 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

// Icons
import VideocamIcon from '@mui/icons-material/Videocam';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import ContactForm from '../components/ContactForm';

const HeroSection = styled(Box)(({ theme }) => ({
  backgroundImage: 'url("/images/hero-background.jpg")', 
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  height: '70vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  color: 'white',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  }
}));

const TestimonialCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
}));

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                Healthcare at Your Fingertips
              </Typography>
              <Typography variant="h5" paragraph>
                Connect with doctors, manage appointments, and access medical records - all from the comfort of your home.
              </Typography>
              <Stack direction="row" spacing={2} mt={4}>
                <Button 
                  component={Link} 
                  to="/login" 
                  variant="contained" 
                  size="large" 
                  sx={{ 
                    py: 1.5, 
                    px: 4,
                    borderRadius: 2,
                    fontSize: '1.1rem'
                  }}
                >
                  Get Started
                </Button>
                <Button 
                  component={Link} 
                  to="/about-us" 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    py: 1.5, 
                    px: 4,
                    borderRadius: 2,
                    fontSize: '1.1rem', 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Learn More
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Our Services
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Experience the future of healthcare with our comprehensive telemedicine platform
          </Typography>

          <Grid container spacing={4}>
            {/* Feature 1 */}
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard elevation={2}>
                <CardMedia
                  component="img"
                  height="180"
                  image="/images/virtual-consultation.jpg" // 
                  alt="Virtual Consultation"
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <VideocamIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h3">
                      Virtual Consultations
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Connect with healthcare professionals through secure video calls from anywhere.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>

            {/* Feature 2 */}
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard elevation={2}>
                <CardMedia
                  component="img"
                  height="180"
                  image="/images/appointment.jpg" // 
                  alt="Appointment Scheduling"
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h3">
                      Easy Scheduling
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Book and manage appointments with just a few clicks, saving you time and hassle.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>

            {/* Feature 3 */}
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard elevation={2}>
                <CardMedia
                  component="img"
                  height="180"
                  image="/images/records.jpg" // 
                  alt="Medical Records"
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h3">
                      Medical History
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Access and manage your complete medical records securely in one place.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>

            {/* Feature 4 */}
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard elevation={2}>
                <CardMedia
                  component="img"
                  height="180"
                  image="/images/secure.jpg" // 
                  alt="Secure Communication"
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SecurityIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h3">
                      Privacy & Security
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    End-to-end encryption and strict privacy measures to protect your health information.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 8, bgcolor: '#f5f5f5' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Our platform makes healthcare accessible in just a few simple steps
          </Typography>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12}>
              <Box>
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>1</Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom>Create an Account</Typography>
                      <Typography variant="body1">Register as a patient with your basic information.</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>2</Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom>Find a Doctor</Typography>
                      <Typography variant="body1">Browse our network of qualified healthcare professionals.</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>3</Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom>Book an Appointment</Typography>
                      <Typography variant="body1">Select a convenient time slot that works for you.</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>4</Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom>Have Your Consultation</Typography>
                      <Typography variant="body1">Connect with your doctor through our secure platform.</Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            What Our Users Say
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Read about experiences from patients and doctors using our platform
          </Typography>

          <Grid container spacing={4}>
            {/* Testimonial 1 */}
            <Grid item xs={12} md={4}>
              <TestimonialCard elevation={3}>
                <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                  "TeleMed has transformed how I manage my chronic condition. I can consult with my doctor regularly without the hassle of traveling to the clinic. It's been a game-changer for me."
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                  <Avatar src="/images/patient1.jpg" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1">Ananya Sharma</Typography>
                    <Typography variant="body2" color="text.secondary">Patient</Typography>
                  </Box>
                </Box>
              </TestimonialCard>
            </Grid>

            {/* Testimonial 2 */}
            <Grid item xs={12} md={4}>
              <TestimonialCard elevation={3}>
                <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                  "As a doctor, this platform helps me reach more patients and manage my schedule efficiently. The integrated medical records system is particularly helpful for providing continuous care."
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                  <Avatar src="/images/doctor1.jpg" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1">Dr. Rajesh Patel</Typography>
                    <Typography variant="body2" color="text.secondary">Cardiologist</Typography>
                  </Box>
                </Box>
              </TestimonialCard>
            </Grid>

            {/* Testimonial 3 */}
            <Grid item xs={12} md={4}>
              <TestimonialCard elevation={3}>
                <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                  "I was skeptical about telemedicine at first, but TeleMed changed my mind. The platform is intuitive, secure, and the quality of care is excellent. Highly recommended!"
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                  <Avatar src="/images/patient2.jpg" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1">Vikram Mehta</Typography>
                    <Typography variant="body2" color="text.secondary">Patient</Typography>
                  </Box>
                </Box>
              </TestimonialCard>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box 
        sx={{ 
          py: 8, 
          backgroundColor: 'primary.main',
          color: 'white'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" align="center" paragraph sx={{ mb: 4 }}>
            Join thousands of patients and doctors who are already benefiting from our telemedicine platform
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              component={Link}
              to="/register" 
              variant="contained" 
              color="secondary" 
              size="large"
              sx={{ 
                py: 1.5, 
                px: 5,
                fontSize: '1.1rem',
                borderRadius: 2,
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }
              }}
            >
              Create Account
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Contact Form Section */}
      <ContactForm />
    </>
  );
}