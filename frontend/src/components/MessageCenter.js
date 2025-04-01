import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  Button,
  IconButton,
  Divider,
  Badge,
  Card,
  Grid,
  useTheme,
  CircularProgress,
  InputAdornment,
  alpha,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Send,
  Refresh,
  Delete,
  Message,
  ChevronLeft,
  Warning,
  DirectionsCar,
  Search,
  Clear,
  Error
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { getConversations, getMessages, sendMessage, markMessagesAsRead } from '../api';

// Styled components for better UI
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const ConversationItem = styled(ListItem)(({ theme, active }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
  cursor: 'pointer',
  position: 'relative',
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'inherit',
  '&:hover': {
    backgroundColor: active 
      ? alpha(theme.palette.primary.main, 0.1) 
      : alpha(theme.palette.action.hover, 0.1),
  },
  transition: 'background-color 0.2s ease',
}));

const MessageBubble = styled(Box)(({ theme, isOwn }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(1.5),
  maxWidth: '80%',
  wordBreak: 'break-word',
  position: 'relative',
  backgroundColor: isOwn ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.grey[100], 1),
  color: isOwn ? theme.palette.text.primary : theme.palette.text.primary,
  alignSelf: isOwn ? 'flex-end' : 'flex-start',
  marginBottom: theme.spacing(1),
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  border: `1px solid ${isOwn ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.divider, 1)}`,
}));

const MessageDate = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  textAlign: 'right',
}));

const MessageCenter = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  // Fetch conversations
  const fetchConversations = async () => {
    if (!isAuthenticated) {
      setError('Please log in to access messages');
      setLoadingConversations(false);
      return;
    }
    
    try {
      setLoadingConversations(true);
      const response = await getConversations();
      
      if (response && response.conversations) {
        setConversations(response.conversations);
        setFilteredConversations(response.conversations);
        setError(null);
      } else {
        setConversations([]);
        setFilteredConversations([]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoadingConversations(false);
    }
  };
  
  // Fetch messages for active conversation
  const fetchMessages = async (otherUserId) => {
    if (!isAuthenticated || !otherUserId) return;
    
    try {
      setLoadingMessages(true);
      const response = await getMessages(otherUserId);
      
      if (response && response.messages) {
        setMessages(response.messages);
        
        // Find and update the conversation to mark as read
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.user_id === otherUserId ? { ...conv, unread_count: 0 } : conv
          )
        );
        
        setFilteredConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.user_id === otherUserId ? { ...conv, unread_count: 0 } : conv
          )
        );
        
        // Also update the active conversation
        if (activeConversation && activeConversation.user_id === otherUserId) {
          setActiveConversation(prev => ({ ...prev, unread_count: 0 }));
        }
        
        setError(null);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoadingMessages(false);
    }
  };
  
  // Handle conversation click
  const handleConversationClick = (conversation) => {
    setActiveConversation(conversation);
    navigate(`/messages/${conversation.user_id}`);
    // Mark messages as read
    markMessagesAsRead(conversation.user_id).catch(err => {
      console.error('Error marking messages as read:', err);
    });
  };
  
  // Handle sending message
  const handleSendMessage = async () => {
    if (!activeConversation || !messageInput.trim()) return;
    
    try {
      const listingId = activeConversation.last_message?.listing_id || null;
      
      await sendMessage(activeConversation.user_id, messageInput, listingId);
      
      // Add the message locally
      const newMessage = {
        id: `temp-${Date.now()}`,
        sender_id: user?.user_id,
        recipient_id: activeConversation.user_id,
        content: messageInput,
        created_at: new Date().toISOString(),
        read: true
      };
      
      // If there's a listing associated, add that info
      if (listingId) {
        newMessage.listing_id = listingId;
        newMessage.listing_title = activeConversation.last_message?.listing_title;
      }
      
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      
      // Update the conversation's last message
      const updatedConversation = {
        ...activeConversation,
        last_message: {
          content: messageInput,
          created_at: new Date().toISOString(),
          sender_id: user?.user_id,
          is_sender: true,
          listing_id: listingId,
          listing_title: activeConversation.last_message?.listing_title
        }
      };
      
      // Update conversations list
      setConversations(prevConversations => {
        const updatedConversations = prevConversations.map(conv => 
          conv.user_id === activeConversation.user_id ? updatedConversation : conv
        );
        
        // Re-sort by latest message
        return updatedConversations.sort((a, b) => {
          const dateA = new Date(a.last_message.created_at);
          const dateB = new Date(b.last_message.created_at);
          return dateB - dateA;
        });
      });
      
      // Also update filtered conversations
      setFilteredConversations(prevConversations => {
        const updatedConversations = prevConversations.map(conv => 
          conv.user_id === activeConversation.user_id ? updatedConversation : conv
        );
        
        // Re-sort by latest message
        return updatedConversations.sort((a, b) => {
          const dateA = new Date(a.last_message.created_at);
          const dateB = new Date(b.last_message.created_at);
          return dateB - dateA;
        });
      });
      
      // Update active conversation
      setActiveConversation(updatedConversation);
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      const date = parseISO(timestamp);
      
      if (isToday(date)) {
        return `Today, ${format(date, 'h:mm a')}`;
      } else if (isYesterday(date)) {
        return `Yesterday, ${format(date, 'h:mm a')}`;
      } else {
        return format(date, 'MMM d, yyyy h:mm a');
      }
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
    
    // Set up polling for new messages every 30 seconds
    const interval = setInterval(() => {
      fetchConversations();
      if (activeConversation) {
        fetchMessages(activeConversation.user_id);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle URL param change and set active conversation
  useEffect(() => {
    if (paramUserId && conversations.length > 0) {
      const conversation = conversations.find(c => c.user_id === paramUserId);
      if (conversation) {
        setActiveConversation(conversation);
        fetchMessages(paramUserId);
      } else {
        // User ID in URL doesn't match any conversation
        navigate('/messages');
      }
    } else if (paramUserId && !loadingConversations) {
      // We have a userId but no matching conversation - this could be a new conversation
      // Try to load messages anyway
      fetchMessages(paramUserId);
    } else if (!paramUserId && conversations.length > 0) {
      // No user ID in URL but we have conversations, select the first one
      const firstConversation = conversations[0];
      setActiveConversation(firstConversation);
      navigate(`/messages/${firstConversation.user_id}`);
    }
  }, [paramUserId, conversations, loadingConversations]);
  
  // Filter conversations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }
    
    const filtered = conversations.filter(conv => 
      conv.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (conv.last_message?.content && 
       conv.last_message.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please log in to access your messages.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
        <Message sx={{ mr: 1 }} /> Messages
      </Typography>
      
      <Grid container spacing={3}>
        {/* Left side - Conversations */}
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={handleSearchChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Conversations
              </Typography>
              <Tooltip title="Refresh conversations">
                <IconButton 
                  size="small" 
                  onClick={fetchConversations}
                  color="primary"
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ 
              flexGrow: 1, 
              overflowY: 'auto', 
              maxHeight: { xs: '300px', md: '500px' }
            }}>
              {loadingConversations ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredConversations.length === 0 ? (
                <Box sx={{ 
                  py: 4, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center' 
                }}>
                  <Message sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary">
                    {searchQuery 
                      ? 'No conversations matching your search'
                      : 'No conversations yet'}
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {filteredConversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.user_id}
                      active={activeConversation?.user_id === conversation.user_id}
                      onClick={() => handleConversationClick(conversation)}
                      alignItems="flex-start"
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={conversation.unread_count}
                          color="primary"
                          overlap="circular"
                          invisible={conversation.unread_count === 0}
                        >
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            {conversation.username?.charAt(0).toUpperCase()}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={conversation.username}
                        secondary={
                          <React.Fragment>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ maxWidth: '180px', color: 'text.secondary' }}
                            >
                              {conversation.last_message?.is_sender && '(You): '}
                              {conversation.last_message?.content || 'No messages yet'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                              {conversation.last_message?.created_at 
                                ? formatTimestamp(conversation.last_message.created_at)
                                : ''}
                            </Typography>
                          </React.Fragment>
                        }
                        primaryTypographyProps={{
                          fontWeight: conversation.unread_count > 0 ? 600 : 400
                        }}
                        secondaryTypographyProps={{
                          component: 'div'
                        }}
                      />
                    </ConversationItem>
                  ))}
                </List>
              )}
            </Box>
          </StyledPaper>
        </Grid>
        
        {/* Right side - Messages */}
        <Grid item xs={12} md={8}>
          <StyledPaper>
            {activeConversation ? (
              <>
                {/* Header with user name */}
                <Box sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  borderBottom: `1px solid ${theme.palette.divider}` 
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: theme.palette.primary.main, 
                      mr: 2
                    }}
                  >
                    {activeConversation.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {activeConversation.username}
                    </Typography>
                    {activeConversation.last_message?.listing_id && (
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                        <DirectionsCar fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                        {activeConversation.last_message.listing_title || 'Regarding a car listing'}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ ml: 'auto' }}>
                    <Tooltip title="Refresh messages">
                      <IconButton 
                        size="small" 
                        onClick={() => fetchMessages(activeConversation.user_id)}
                        color="primary"
                      >
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                {/* Messages container */}
                <Box 
                  ref={messagesContainerRef}
                  sx={{ 
                    flexGrow: 1, 
                    overflowY: 'auto', 
                    p: 2,
                    display: 'flex', 
                    flexDirection: 'column',
                    minHeight: { xs: '350px', md: '400px' },
                    maxHeight: { xs: '350px', md: '400px' }
                  }}
                >
                  {loadingMessages ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : messages.length === 0 ? (
                    <Box sx={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      alignItems: 'center' 
                    }}>
                      <Message sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary">
                        No messages in this conversation yet
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
                        Send a message to start the conversation
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {messages.map((message) => {
                        const isOwn = message.sender_id === user?.user_id;
                        
                        return (
                          <MessageBubble key={message.id} isOwn={isOwn}>
                            <Typography variant="body2">
                              {message.content}
                            </Typography>
                            
                            {message.listing_id && !isOwn && (
                              <Typography variant="caption" sx={{ 
                                display: 'block', 
                                mt: 1, 
                                color: 'text.secondary',
                                fontStyle: 'italic'
                              }}>
                                Regarding: {message.listing_title || 'a vehicle listing'}
                              </Typography>
                            )}
                            
                            <MessageDate variant="caption">
                              {formatTimestamp(message.created_at)}
                              {!message.read && !isOwn && (
                                <Typography 
                                  component="span" 
                                  sx={{ 
                                    ml: 1, 
                                    color: theme.palette.primary.main, 
                                    fontWeight: 'bold',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  • Unread
                                </Typography>
                              )}
                            </MessageDate>
                          </MessageBubble>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </Box>
                
                {/* Input area */}
                <Box sx={{ 
                  p: 2, 
                  borderTop: `1px solid ${theme.palette.divider}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8)
                }}>
                  <Box sx={{ display: 'flex' }}>
                    <TextField
                      fullWidth
                      placeholder="Type a message..."
                      variant="outlined"
                      size="medium"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      multiline
                      maxRows={3}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<Send />}
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      sx={{ ml: 1, height: 56 }}
                    >
                      Send
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%',
                p: 4
              }}>
                {error ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <Error sx={{ fontSize: 60, color: theme.palette.error.main, mb: 2 }} />
                    <Typography variant="h6" gutterBottom color="error">
                      {error}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={fetchConversations}
                      startIcon={<Refresh />}
                      sx={{ mt: 2 }}
                    >
                      Try Again
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Message sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" gutterBottom color="textSecondary">
                      Select a conversation
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Choose a conversation from the list to view messages
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MessageCenter;