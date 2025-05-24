import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  TextField, 
  Button, 
  Snackbar, 
  Alert,
  Grid
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function ContactForm() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [submitting, setSubmitting] = useState(false);
  
  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Form validation
    if (!formState.name || !formState.email || !formState.message) {
      setAlert({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }
    
    setSubmitting(true);
    

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setFormState({
        name: '',
        email: '',
        message: ''
      });
      
      // Show success message
      setAlert({
        open: true,
        message: 'Message sent successfully! We\'ll get back to you soon.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setAlert({
        open: true,
        message: 'Failed to send message. Please try again later.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };
  
  return (
    <Box id="contact" sx={{ py: 6, bgcolor: '#f5f7fb' }}>
      <Container maxWidth="md">
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          Contact Us
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="body1" paragraph align="center" sx={{ mb: 3 }}>
            Have questions about our services? Get in touch with us and we'll get back to you as soon as possible.
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Your Name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  name="message"
                  multiline
                  rows={4}
                  value={formState.message}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={submitting}
                  endIcon={<SendIcon />}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem'
                  }}
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </Grid>
            </Grid>
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
    </Box>
  );
}