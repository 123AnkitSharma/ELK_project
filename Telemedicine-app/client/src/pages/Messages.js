import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Container, Typography, Box, Paper, Grid, TextField, Button,
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Divider, IconButton, CircularProgress, Badge
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmptyInboxIcon from '@mui/icons-material/Inbox';
import DoctorIcon from '@mui/icons-material/LocalHospital';
import { Link } from 'react-router-dom';

export default function Messages() {
  const { doctorId } = useParams(); // Get doctor ID from URL if present
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch all conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Fetch available doctors if no conversations exist
  useEffect(() => {
    if (conversations.length === 0) {
      const fetchDoctors = async () => {
        try {
          setLoadingDoctors(true);
          const token = localStorage.getItem('token');
          const res = await axios.get('http://localhost:5000/api/users/my-doctors', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAvailableDoctors(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingDoctors(false);
        }
      };
      fetchDoctors();
    }
  }, [conversations]);

  // If doctorId is provided in URL, select that doctor
  useEffect(() => {
    if (doctorId && conversations.length > 0) {
      const doctorConv = conversations.find(
        conv => conv.partner._id === doctorId
      );
      if (doctorConv) {
        setSelectedUser(doctorConv.partner);
      } else {
        // Doctor not in conversations yet, fetch doctor info
        const fetchDoctorInfo = async () => {
          try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/users/${doctorId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedUser(res.data);
          } catch (err) {
            console.error(err);
          }
        };
        fetchDoctorInfo();
      }
    }
  }, [doctorId, conversations]);

  // Fetch messages when selectedUser changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/messages/conversation/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
        // Mark messages as read
        await axios.put(`http://localhost:5000/api/messages/read/${selectedUser._id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Update unread count in conversations
        setConversations(conversations.map(conv => {
          if (conv.partner._id === selectedUser._id) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/messages', {
        recipient: selectedUser._id,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Add to messages list
      setMessages([...messages, res.data]);
      // Update conversations list
      const updatedConversations = conversations.map(conv => {
        if (conv.partner._id === selectedUser._id) {
          return {
            ...conv,
            lastMessage: res.data
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const renderEmptyState = () => {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          padding: 4,
          textAlign: 'center',
          color: 'text.secondary'
        }}
      >
        <EmptyInboxIcon sx={{ fontSize: 80, color: 'primary.light', mb: 2, opacity: 0.7 }} />
        <Typography variant="h6">No messages yet</Typography>
        <Typography variant="body2" sx={{ mt: 1, maxWidth: '80%' }}>
          Start a conversation with one of your doctors to get medical advice and support
        </Typography>
      </Box>
    );
  };

  const renderDoctorList = () => {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
          Available Doctors
        </Typography>
        <List>
          {availableDoctors.map(doctor => (
            <Paper 
              elevation={1} 
              key={doctor._id} 
              sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}
            >
              <ListItem 
                button 
                onClick={() => setSelectedUser(doctor)}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  p: 2 
                }}
              >
                <ListItemAvatar>
                  {doctor.profileImage ? (
                    <Avatar 
                      src={`http://localhost:5000/uploads/${doctor.profileImage}`} 
                      alt={doctor.name} 
                      sx={{ width: 50, height: 50 }} 
                    />
                  ) : (
                    <Avatar 
                      sx={{ 
                        width: 50, 
                        height: 50, 
                        bgcolor: 'primary.main' 
                      }}
                    >
                      {doctor.name.charAt(0)}
                    </Avatar>
                  )}
                </ListItemAvatar>
                <ListItemText 
                  primary={
                    <Typography variant="subtitle1" fontWeight="medium">
                      Dr. {doctor.name}
                    </Typography>
                  }
                />
                <DoctorIcon color="primary" sx={{ ml: 1 }} />
              </ListItem>
            </Paper>
          ))}
        </List>
      </Box>
    );
  };

  const renderMessage = (message) => {
    const isOwn = message.sender._id === user?.id;
    
    return (
      <Box
        key={message._id}
        sx={{
          display: 'flex',
          justifyContent: isOwn ? 'flex-end' : 'flex-start',
          mb: 1.5
        }}
      >
        {!isOwn && (
          <Avatar 
            src={selectedUser.profileImage ? `http://localhost:5000/uploads/${selectedUser.profileImage}` : null}
            sx={{ mr: 1, mt: 0.5 }}
          >
            {selectedUser.name.charAt(0)}
          </Avatar>
        )}
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            maxWidth: '70%',
            borderRadius: 2,
            backgroundColor: isOwn ? 'primary.light' : 'background.paper',
            color: isOwn ? 'white' : 'text.primary'
          }}
        >
          <Typography variant="body1">{message.content}</Typography>
        </Paper>
        {isOwn && (
          <Avatar 
            src={user?.profileImage ? `http://localhost:5000/uploads/${user.profileImage}` : null}
            sx={{ ml: 1, mt: 0.5 }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
        )}
      </Box>
    );
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
      <Paper 
        elevation={3} 
        sx={{ 
          height: '80vh', 
          display: 'flex',
          overflow: 'hidden',
          borderRadius: 2
        }}
      >
        {/* Conversations List */}
        <Box sx={{ 
          width: { xs: selectedUser ? '0%' : '100%', sm: '35%', md: '30%' },
          borderRight: '1px solid #e0e0e0',
          overflowY: 'auto',
          display: { xs: selectedUser ? 'none' : 'block', sm: 'block' },
          transition: 'all 0.3s ease',
          bgcolor: '#f8f9fa'
        }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #e0e0e0', 
            position: 'sticky',
            top: 0,
            bgcolor: 'primary.main',
            color: 'white',
            zIndex: 10
          }}>
            <Typography variant="h6" fontWeight="500">Messages</Typography>
          </Box>
          
          <List disablePadding>
            {conversations.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="500" color="text.primary">
                  No conversations yet
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                {user.role === 'patient' ? (
                  <>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      Available doctors:
                    </Typography>
                    
                    {loadingDoctors ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      <>
                        {availableDoctors.length > 0 ? (
                          renderDoctorList()
                        ) : (
                          <Box sx={{ 
                            p: 3, 
                            textAlign: 'center', 
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            mx: 1,
                            boxShadow: '0px 2px 4px rgba(0,0,0,0.05)'
                          }}>
                            <Typography variant="body1" fontWeight="500" color="text.secondary" gutterBottom>
                              No doctors available
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              You need to book an appointment with a doctor before you can message them.
                            </Typography>
                            <Button
                              variant="contained"
                              color="primary"
                              component={Link}
                              to="/book-appointment"
                              startIcon={<CalendarTodayIcon />}
                              sx={{ 
                                mt: 1,
                                borderRadius: 6,
                                textTransform: 'none',
                                boxShadow: 2,
                                px: 3
                              }}
                            >
                              Book an Appointment
                            </Button>
                          </Box>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <Box sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    mx: 1,
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <Typography variant="body1" fontWeight="500" color="text.secondary" gutterBottom>
                      No patients available
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      You don't have any patients yet. Patients will appear here after they book appointments with you.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      to="/dashboard"
                      startIcon={<CalendarTodayIcon />}
                      sx={{ 
                        mt: 1,
                        borderRadius: 6,
                        textTransform: 'none',
                        boxShadow: 2,
                        px: 3
                      }}
                    >
                      Go to Dashboard
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              [...new Map(conversations.map(conv => [conv.partner._id, conv])).values()].map((conv) => (
                <ListItem 
                  key={conv.partner._id}
                  button
                  selected={selectedUser && selectedUser._id === conv.partner._id}
                  onClick={() => setSelectedUser(conv.partner)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                    bgcolor: selectedUser && selectedUser._id === conv.partner._id ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    '&:hover': {
                      bgcolor: selectedUser && selectedUser._id === conv.partner._id ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Badge 
                      color="error" 
                      badgeContent={conv.unreadCount} 
                      overlap="circular"
                      invisible={conv.unreadCount === 0}
                      sx={{
                        '& .MuiBadge-badge': {
                          fontWeight: 'bold',
                          minWidth: 18,
                          height: 18,
                          fontSize: 11
                        }
                      }}
                    >
                      <Avatar sx={{ bgcolor: conv.partner.role === 'doctor' ? 'primary.main' : 'secondary.main' }}>
                        {conv.partner.name.charAt(0)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography 
                        variant="body1" 
                        fontWeight={conv.unreadCount > 0 ? 600 : 400}
                        sx={{ color: conv.unreadCount > 0 ? 'text.primary' : 'inherit' }}
                      >
                        {conv.partner.role === 'doctor' ? 'Dr. ' : ''}{conv.partner.name}
                      </Typography>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        noWrap
                        sx={{ 
                          fontWeight: conv.unreadCount > 0 ? 500 : 400,
                          color: conv.unreadCount > 0 ? 'text.primary' : 'text.secondary' 
                        }}
                      >
                        {conv.lastMessage?.content?.substring(0, 30) + (conv.lastMessage?.content?.length > 30 ? '...' : '')}
                      </Typography>
                    }
                    secondaryTypographyProps={{ 
                      component: 'div',
                      sx: { 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mt: 0.3
                      }
                    }}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Box>
        
        {/* Messages Area */}
        <Box sx={{ 
          width: { xs: selectedUser ? '100%' : '0%', sm: '65%', md: '70%' },
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          position: 'relative',
          bgcolor: '#ffffff'
        }}>
          {selectedUser ? (
            <>
              {/* Message header */}
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
              }}>
                <IconButton 
                  onClick={() => setSelectedUser(null)} 
                  sx={{ 
                    mr: 1.5,
                    display: { xs: 'flex', sm: 'none' }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Avatar 
                  sx={{ 
                    mr: 1.5, 
                    bgcolor: selectedUser.role === 'doctor' ? 'primary.main' : 'secondary.main',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {selectedUser.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={500} sx={{ lineHeight: 1.2 }}>
                    {selectedUser.role === 'doctor' ? 'Dr. ' : ''}{selectedUser.name}
                  </Typography>
                  {selectedUser.role === 'doctor' && (
                    <Typography variant="caption" color="text.secondary">
                      {selectedUser.profile?.specialization || 'Doctor'}
                    </Typography>
                  )}
                </Box>
              </Box>
              
              {/* Messages list */}
              <Box sx={{ 
                flexGrow: 1, 
                p: 2.5, 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#f5f7fb',
                gap: 1,
              }}>
                {messages.length > 0 ? (
                  messages.map((message) => renderMessage(message))
                ) : (
                  renderEmptyState()
                )}
                <div ref={messagesEndRef} />
              </Box>
              
              {/* Send message form */}
              <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                  p: 2,
                  borderTop: '1px solid #e0e0e0',
                  display: 'flex',
                  bgcolor: 'white',
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 2
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                  autoComplete="off"
                  multiline
                  maxRows={4}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '24px',
                      bgcolor: '#f5f5f5',
                      '&:hover': {
                        bgcolor: '#f0f0f0',
                      }
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={sending || !newMessage.trim()}
                  sx={{ 
                    ml: 1, 
                    borderRadius: '50%', 
                    minWidth: 0, 
                    width: 48, 
                    height: 48,
                    boxShadow: 2
                  }}
                >
                  <SendIcon />
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ 
              display: { xs: 'none', sm: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              bgcolor: '#f8f8f8',
              p: 4
            }}>
              <SendIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 3, opacity: 0.3 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a conversation
              </Typography>
              <Typography variant="body2" color="text.disabled" textAlign="center" sx={{ maxWidth: 300 }}>
                Choose a doctor from the list to start or continue a conversation
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}