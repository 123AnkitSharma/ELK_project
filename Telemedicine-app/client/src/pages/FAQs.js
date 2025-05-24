import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Paper,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContactForm from '../components/ContactForm';

export default function FAQs() {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqItems = [
    {
      id: 'panel1',
      question: 'What is TeleMed?',
      answer: 'TeleMed is a comprehensive telemedicine platform that connects patients with healthcare professionals for virtual consultations. Our service allows you to receive medical advice, diagnoses, and treatment plans from qualified doctors without having to visit a physical clinic or hospital.'
    },
    {
      id: 'panel2',
      question: 'How do I schedule an appointment with a doctor?',
      answer: 'To schedule an appointment, log in to your account and navigate to the "Book Appointment" section. There, you can browse available doctors, check their schedules, and select a convenient time slot. Once confirmed, you\'ll receive a notification and can join the virtual consultation at the scheduled time.'
    },
    {
      id: 'panel3',
      question: 'How do virtual consultations work?',
      answer: 'After booking an appointment and receiving approval from the doctor, you can start your consultation at the scheduled time by navigating to the Messages section and selecting your doctor. You can communicate through our secure messaging system, share medical information, and receive advice directly from your healthcare provider.'
    },
    {
      id: 'panel4',
      question: 'How can I access my medical records?',
      answer: 'Your complete medical history is available in the "Medical History" section of your account. This includes records of past consultations, diagnoses, prescriptions, and any notes from your healthcare providers. You can view these records anytime and share them with other healthcare professionals as needed.'
    },
    {
      id: 'panel5',
      question: 'How do I upload medical reports for my doctor to review?',
      answer: 'You can upload medical reports through the dashboard\'s "Upload Report" option. Add a description of the report, select the file from your device, and submit it. Your doctor will be able to view these reports during or before your consultation.'
    },
    {
      id: 'panel6',
      question: 'Is my medical information secure on TeleMed?',
      answer: 'Yes, we take security and privacy seriously. All data is encrypted, and our platform complies with healthcare data protection standards. Your medical information is only accessible to you and the healthcare providers you consult with.'
    },
    {
      id: 'panel7',
      question: 'What should I do if I need to reschedule or cancel an appointment?',
      answer: 'You can manage your appointments through the "Upcoming Appointments" section on your dashboard. Options to reschedule or cancel are available for each appointment, subject to the platform\'s cancellation policy.'
    },
    {
      id: 'panel8',
      question: 'Can doctors prescribe medication through TeleMed?',
      answer: 'Yes, doctors can provide prescriptions during virtual consultations when medically appropriate. These prescriptions will be documented in your medical records and can be accessed through the "Medical History" section of your account.'
    },
    {
      id: 'panel9',
      question: 'How do I message my doctor outside of scheduled appointments?',
      answer: 'You can send messages to doctors you\'ve previously consulted with through the "Messages" section of the platform. Keep in mind that response times may vary, and for urgent medical issues, you should seek immediate in-person care.'
    },
    {
      id: 'panel10',
      question: 'What types of medical issues can be addressed through TeleMed?',
      answer: 'TeleMed is suitable for many non-emergency medical concerns, including follow-up consultations, chronic disease management, minor illnesses, mental health support, and medical advice. For medical emergencies, severe symptoms, or conditions requiring physical examination, please visit an emergency room or urgent care facility.'
    }
  ];

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Frequently Asked Questions
        </Typography>
        
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" paragraph>
              Find answers to common questions about using the TeleMed platform. If you don't see your question here, 
              please contact our support team for assistance.
            </Typography>
          </Box>
          
          {faqItems.map((item) => (
            <Accordion
              key={item.id}
              expanded={expanded === item.id}
              onChange={handleChange(item.id)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${item.id}-content`}
                id={`${item.id}-header`}
              >
                <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>{item.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">{item.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      </Container>
      
      {/* Add ContactForm component at the bottom of the page */}
      <ContactForm />
    </>
  );
}