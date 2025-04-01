import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Divider, TextField, Button, Avatar, 
  List, ListItem, ListItemText, ListItemAvatar, Badge, IconButton,
  CircularProgress, Grid, Container, useTheme, useMediaQuery,
  InputAdornment
} from '@mui/material';
import { Send, ArrowBack, Person } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Helper function to format message timestamp
const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if date is today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } 
    // Check if date is yesterday
    else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } 
    // Otherwise return full date and time
    else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: '2-digit'
      }) + ' ' + date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
  } catch (err) {
    console.error('Error formatting date:', err);
    return '';
  }
};

// Component to show conversations list
const ConversationsList = ({ conversations, selectedUserId, onSelectConversation, loading }) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '100%', 
        overflow: 'auto',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        Messages
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : conversations.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No conversations yet</Typography>
        </Box>
      ) : (
        <List sx={{ width: '100%', p: 0 }}>
          {conversations.map((conversation) => (
            <ListItem 
              key={conversation.partner_id}
              button
              alignItems="flex-start"
              selected={selectedUserId === conversation.partner_id}
              onClick={() => onSelectConversation(conversation.partner_id)}
              sx={{
                borderLeft: '4px solid',
                borderColor: conversation.unread_count > 0 
                  ? 'primary.main' 
                  : 'transparent',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(63, 81, 181, 0.08)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                transition: 'all 0.2s',
              }}
            >
              <ListItemAvatar>
                <Badge
                  color="primary"
                  badgeContent={conversation.unread_count}
                  invisible={conversation.unread_count === 0}
                  overlap="circular"
                >
                  <Avatar alt={conversation.partner_name}>
                    {conversation.partner_name[0]?.toUpperCase() || <Person />}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" component="span" fontWeight={conversation.unread_count > 0 ? 600 : 400}>
                    {conversation.partner_name}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      component="span" 
                      color="text.secondary"
                      sx={{ 
                        display: 'inline-block',
                        width: '70%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {conversation.last_message.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatMessageTime(conversation.last_message.created_at)}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

// Component to show conversation with a specific user
const Conversation = ({ 
  userId, userName, messages, loading, onSendMessage, msgInputRef 
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when messages change or when component mounts
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      {/* Conversation header with user name */}
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Avatar alt={userName}>
          {userName[0]?.toUpperCase() || <Person />}
        </Avatar>
        <Typography variant="h6">{userName}</Typography>
      </Box>
      
      {/* Messages area */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f5f5f5',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={30} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="text.secondary">No messages yet. Send a message to start the conversation.</Typography>
          </Box>
        ) : (
          messages.map((message) => {
            const isSentByMe = message.sender_id === user?._id;
            
            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: isSentByMe ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                {!isSentByMe && (
                  <Avatar 
                    sx={{ height: 36, width: 36, mr: 1 }}
                    alt={message.sender_name}
                  >
                    {message.sender_name[0]?.toUpperCase()}
                  </Avatar>
                )}
                <Box>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      ml: isSentByMe ? 2 : 0,
                      mr: isSentByMe ? 0 : 2,
                      bgcolor: isSentByMe ? 'primary.main' : 'white',
                      color: isSentByMe ? 'white' : 'inherit',
                      borderRadius: 2,
                      maxWidth: 400,
                      wordBreak: 'break-word',
                    }}
                  >
                    <Typography variant="body1">{message.content}</Typography>
                  </Paper>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      textAlign: isSentByMe ? 'right' : 'left',
                      mt: 0.5,
                      color: 'text.secondary',
                      fontSize: '0.7rem',
                    }}
                  >
                    {formatMessageTime(message.created_at)}
                  </Typography>
                </Box>
                {isSentByMe && (
                  <Avatar 
                    sx={{ height: 36, width: 36, ml: 1 }}
                    alt={message.sender_name}
                  >
                    {message.sender_name[0]?.toUpperCase()}
                  </Avatar>
                )}
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Message input */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          placeholder="Type a message"
          multiline
          maxRows={4}
          variant="outlined"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyPress}
          inputRef={msgInputRef}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  color="primary" 
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                >
                  <Send />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: '#f5f5f5',
            }
          }}
        />
      </Box>
    </Paper>
  );
};

// Empty state when no conversation is selected
const EmptyConversation = () => (
  <Paper
    elevation={3}
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 2,
      bgcolor: 'background.paper',
      p: 4,
    }}
  >
    <Typography variant="h5" color="text.secondary" gutterBottom>
      Select a conversation
    </Typography>
    <Typography variant="body1" color="text.secondary" align="center">
      Choose a conversation from the list or start a new one from a vehicle listing
    </Typography>
  </Paper>
);

// Mobile conversation view with back button
const MobileConversation = ({ 
  userId, userName, messages, loading, onSendMessage, msgInputRef, onBack 
}) => {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box 
        sx={{ 
          p: 1.5, 
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'background.paper',
        }}
      >
        <IconButton onClick={onBack}>
          <ArrowBack />
        </IconButton>
        <Avatar alt={userName}>
          {userName[0]?.toUpperCase() || <Person />}
        </Avatar>
        <Typography variant="h6">{userName}</Typography>
      </Box>
      
      <Conversation 
        userId={userId}
        userName={userName}
        messages={messages}
        loading={loading}
        onSendMessage={onSendMessage}
        msgInputRef={msgInputRef}
      />
    </Box>
  );
};

// Main Messages page component
const MessagesPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messageInputRef = useRef(null);
  
  // Fetch conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);
  
  // If userId is provided in the URL, select that conversation
  useEffect(() => {
    if (userId && conversations.length > 0) {
      const conversation = conversations.find(c => c.partner_id === userId);
      if (conversation) {
        handleSelectConversation(userId);
      }
    } else if (userId) {
      // If userId is provided but conversations aren't loaded yet, save it
      setSelectedUserId(userId);
    } else if (conversations.length > 0 && !isMobile) {
      // Auto-select first conversation on desktop if none selected
      handleSelectConversation(conversations[0].partner_id);
    }
  }, [userId, conversations, isMobile]);
  
  // When a user is selected, load messages and mark them as read
  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
      
      // If we're on mobile and no URL param, update the URL
      if (isMobile && !userId) {
        navigate(`/messages/${selectedUserId}`);
      }
    }
  }, [selectedUserId]);
  
  // Focus message input when conversation is selected
  useEffect(() => {
    if (selectedUserId && messageInputRef.current) {
      setTimeout(() => {
        messageInputRef.current.focus();
      }, 300);
    }
  }, [selectedUserId, loadingMessages]);
  
  // Fetch all conversations
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load messages for a specific conversation
  const loadMessages = async (userId) => {
    setLoadingMessages(true);
    try {
      // First, find the conversation to get the user name
      const conversation = conversations.find(c => c.partner_id === userId);
      if (conversation) {
        setSelectedUserName(conversation.partner_name);
      }
      
      // Fetch messages
      const response = await fetch(`/api/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      setMessages(data.messages || []);
      
      // Mark messages as read
      await markMessagesAsRead(userId);
      
      // Update unread counts in conversations
      updateConversationUnreadCount(userId);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };
  
  // Mark messages from this user as read
  const markMessagesAsRead = async (userId) => {
    try {
      await fetch(`/api/messages/${userId}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  
  // Update unread count for a conversation after marking as read
  const updateConversationUnreadCount = (userId) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.partner_id === userId 
          ? { ...conv, unread_count: 0 }
          : conv
      )
    );
  };
  
  // Handle selecting a conversation
  const handleSelectConversation = (userId) => {
    setSelectedUserId(userId);
    if (isMobile) {
      navigate(`/messages/${userId}`);
    }
  };
  
  // Handle sending a new message
  const handleSendMessage = async (content) => {
    if (!selectedUserId || !content.trim()) return;
    
    try {
      // Add optimistic message
      const optimisticMessage = {
        id: 'temp-' + Date.now(),
        sender_id: user._id,
        sender_name: user.username,
        recipient_id: selectedUserId,
        recipient_name: selectedUserName,
        content: content,
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Send message to API
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: selectedUserId,
          content: content
        })
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      
      // Replace optimistic message with actual message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? data.message_data
            : msg
        )
      );
      
      // Update conversations list
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove failed optimistic message
      setMessages(prev => prev.filter(msg => msg.id !== 'temp-' + Date.now()));
    }
  };
  
  // Handle back button on mobile
  const handleBackToList = () => {
    navigate('/messages');
    setSelectedUserId(null);
  };
  
  if (!isAuthenticated) {
    return (
      <Container sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" align="center">
          Please log in to view your messages
        </Typography>
      </Container>
    );
  }
  
  // Mobile view with either list or conversation
  if (isMobile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4, height: 'calc(100vh - 140px)' }}>
        {selectedUserId && userId ? (
          <MobileConversation
            userId={selectedUserId}
            userName={selectedUserName}
            messages={messages}
            loading={loadingMessages}
            onSendMessage={handleSendMessage}
            msgInputRef={messageInputRef}
            onBack={handleBackToList}
          />
        ) : (
          <Box sx={{ height: '100%' }}>
            <ConversationsList
              conversations={conversations}
              selectedUserId={selectedUserId}
              onSelectConversation={handleSelectConversation}
              loading={loading}
            />
          </Box>
        )}
      </Container>
    );
  }
  
  // Desktop view with split layout
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, height: 'calc(100vh - 180px)' }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <ConversationsList
            conversations={conversations}
            selectedUserId={selectedUserId}
            onSelectConversation={handleSelectConversation}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          {selectedUserId ? (
            <Conversation
              userId={selectedUserId}
              userName={selectedUserName}
              messages={messages}
              loading={loadingMessages}
              onSendMessage={handleSendMessage}
              msgInputRef={messageInputRef}
            />
          ) : (
            <EmptyConversation />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default MessagesPage;