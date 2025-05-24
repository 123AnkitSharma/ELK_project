import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Container, Typography, Box, Paper, Grid, 
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Card, CardContent, Divider, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  Tabs, Tab, TextField, Snackbar, Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PersonIcon from '@mui/icons-material/Person';

// Styled component for preview container
const PreviewContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '& img': {
    maxWidth: '100%',
    maxHeight: '400px',
    objectFit: 'contain'
  },
  '& iframe': {
    width: '100%',
    height: '400px',
    border: 'none'
  }
}));

export default function PatientReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientReports, setPatientReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showRecordDialog, setShowRecordDialog] = useState(false);

  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loadingMedicalRecords, setLoadingMedicalRecords] = useState(false);
  const [recordForm, setRecordForm] = useState({
    diagnosis: '',
    notes: '',
    prescription: ''
  });
  const [submittingRecord, setSubmittingRecord] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch doctor's patients (from appointments)
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/appointments/' + user.id, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Extract unique patients from appointments
        const uniquePatients = Array.from(
          new Map(
            res.data
              .filter(app => app.patient) // Ensure patient exists
              .map(app => [app.patient._id, app.patient])
          ).values()
        );
        
        setPatients(uniquePatients);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setLoading(false);
      }
    };

    if (user && user.role === 'doctor') {
      fetchPatients();
    }
  }, [user]);

  // Fetch reports when a patient is selected
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientReports(selectedPatient._id);
    }
  }, [selectedPatient]);

  const fetchPatientReports = async (patientId) => {
    setLoadingReports(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/reports/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatientReports(response.data);
    } catch (error) {
      console.error('Error fetching patient reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchMedicalRecords = async (patientId) => {
    setLoadingMedicalRecords(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/medical-history/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedicalRecords(response.data);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoadingMedicalRecords(false);
    }
  };

  useEffect(() => {
    if (selectedPatient && activeTab === 1) {
      fetchMedicalRecords(selectedPatient._id);
    }
  }, [selectedPatient, activeTab]);

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon color="primary" />;
    } else if (fileType === 'application/pdf') {
      return <PictureAsPdfIcon color="error" />;
    } else {
      return <DescriptionIcon color="action" />;
    }
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setSelectedReport(null);
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setPreviewOpen(true);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRecordChange = (e) => {
    setRecordForm({
      ...recordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleRecordSubmit = async () => {
    if (!recordForm.diagnosis) {
      setAlert({
        open: true,
        message: 'Diagnosis is required',
        severity: 'error'
      });
      return;
    }
    
    setSubmittingRecord(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/medical-history', 
        {
          patient: selectedPatient._id,
          diagnosis: recordForm.diagnosis,
          notes: recordForm.notes,
          prescription: recordForm.prescription
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Reset form and close dialog
      setRecordForm({ diagnosis: '', notes: '', prescription: '' });
      setShowRecordDialog(false);
      
      // Show success message
      setAlert({
        open: true,
        message: 'Medical record created successfully',
        severity: 'success'
      });
      
      // Refresh the medical records
      fetchMedicalRecords(selectedPatient._id);
    } catch (error) {
      console.error('Error creating medical record:', error);
      setAlert({
        open: true,
        message: 'Failed to create medical record',
        severity: 'error'
      });
    } finally {
      setSubmittingRecord(false);
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Patient Records
      </Typography>
      
      <Grid container spacing={3}>
        {/* Patients List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Select Patient
            </Typography>
            {patients.length > 0 ? (
              <List>
                {patients.map((patient) => (
                  <ListItem 
                    key={patient._id} 
                    button 
                    selected={selectedPatient && selectedPatient._id === patient._id}
                    onClick={() => setSelectedPatient(patient)}
                    divider
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={patient.name} 
                      secondary={`Patient ID: ${patient._id.substring(0, 8)}...`} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary" align="center" sx={{ py: 5 }}>
                No patients found. You'll see patients here after they book appointments with you.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Reports View */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            {selectedPatient ? (
              <>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={activeTab} onChange={handleTabChange} aria-label="patient data tabs">
                    <Tab label="Uploaded Reports" />
                    <Tab label="Medical History" />
                  </Tabs>
                </Box>

                {activeTab === 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      {selectedPatient.name}'s Reports
                    </Typography>
                    {loadingReports ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                        <CircularProgress />
                      </Box>
                    ) : patientReports.length > 0 ? (
                      <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                          {patientReports.map((report) => (
                            <Grid item xs={12} sm={6} key={report._id}>
                              <Card 
                                variant="outlined" 
                                sx={{ 
                                  cursor: 'pointer',
                                  '&:hover': { boxShadow: 3 }
                                }}
                                onClick={() => handleReportClick(report)}
                              >
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {getFileIcon(report.fileType)}
                                    <Typography variant="subtitle1" sx={{ ml: 1 }}>
                                      {report.fileName}
                                    </Typography>
                                  </Box>
                                  <Divider sx={{ my: 1 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {report.description}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                    Uploaded: {new Date(report.createdAt).toLocaleString()}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    ) : (
                      <Typography color="textSecondary" align="center" sx={{ py: 5 }}>
                        No reports uploaded by this patient yet.
                      </Typography>
                    )}
                  </>
                )}

                {activeTab === 1 && (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Medical History
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      sx={{ mb: 2 }}
                      onClick={() => setShowRecordDialog(true)}
                    >
                      CREATE NEW RECORD
                    </Button>

                    {loadingMedicalRecords ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                        <CircularProgress />
                      </Box>
                    ) : medicalRecords.length > 0 ? (
                      <Box sx={{ mt: 2 }}>
                        {medicalRecords.map((record) => (
                          <Card key={record._id} variant="outlined" sx={{ mb: 2 }}>
                            <CardContent>
                              <Typography variant="subtitle1" fontWeight="bold">
                                Date: {new Date(record.date).toLocaleDateString()}
                              </Typography>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="body1">
                                <strong>Diagnosis:</strong> {record.diagnosis}
                              </Typography>
                              {record.notes && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  <strong>Notes:</strong> {record.notes}
                                </Typography>
                              )}
                              {record.prescription && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  <strong>Prescription:</strong> {record.prescription}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    ) : (
                      <Typography color="textSecondary" align="center" sx={{ py: 5 }}>
                        No medical records for this patient yet.
                      </Typography>
                    )}
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography color="textSecondary">
                  Select a patient to view their reports
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Report Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={handlePreviewClose} 
        maxWidth="md" 
        fullWidth
      >
        {selectedReport && (
          <>
            <DialogTitle>
              {selectedReport.fileName}
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" gutterBottom>
                {selectedReport.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <PreviewContainer>
                {selectedReport.fileType.startsWith('image/') ? (
                  <img src={selectedReport.fileUrl} alt={selectedReport.description} />
                ) : selectedReport.fileType === 'application/pdf' ? (
                  <iframe src={selectedReport.fileUrl} title={selectedReport.description} />
                ) : (
                  <Typography>
                    This file type cannot be previewed. Please download to view.
                  </Typography>
                )}
              </PreviewContainer>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  href={selectedReport.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Download / Open Original
                </Button>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Medical Record Dialog */}
      <Dialog 
        open={showRecordDialog} 
        onClose={() => setShowRecordDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Create New Medical Record</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
            Patient: {selectedPatient?.name}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <TextField
            fullWidth
            label="Diagnosis"
            name="diagnosis"
            value={recordForm.diagnosis}
            onChange={handleRecordChange}
            required
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Notes"
            name="notes"
            value={recordForm.notes}
            onChange={handleRecordChange}
            multiline
            rows={4}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Prescription"
            name="prescription"
            value={recordForm.prescription}
            onChange={handleRecordChange}
            multiline
            rows={2}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowRecordDialog(false)}
            disabled={submittingRecord}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRecordSubmit} 
            variant="contained"
            color="primary"
            disabled={submittingRecord || !recordForm.diagnosis}
          >
            {submittingRecord ? 'Creating...' : 'Create Record'}
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