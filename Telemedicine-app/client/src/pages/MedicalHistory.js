import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Container, Typography, Box, Paper, List, ListItem,
  ListItemText, Divider, CircularProgress, Alert
} from '@mui/material';
export default function MedicalHistory() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/medical-history/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMedicalRecords(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load medical history.");
        setLoading(false);
      }
    };
    if (user) {
      fetchMedicalHistory();
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
        Medical History
      </Typography>
      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Paper sx={{ p: 3 }}>
        {medicalRecords.length > 0 ? (
          <List>
            {medicalRecords.map((record) => (
              <Box key={record._id}>
                <ListItem>
                  <ListItemText
                    primary={`${new Date(record.date).toLocaleDateString()} - Dr. ${record.doctor.name}`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          Diagnosis: {record.diagnosis}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Notes: {record.notes}
                        </Typography>
                        {record.prescription && (
                          <>
                            <br />
                            <Typography component="span" variant="body2">
                              Prescription: {record.prescription}
                            </Typography>
                          </>
                        )}
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        ) : (
          <Typography align="center" color="textSecondary" sx={{ py: 3 }}>
            No medical records found. Records will appear here after your appointments.
          </Typography>
        )}
      </Paper>
    </Container>
  );
}