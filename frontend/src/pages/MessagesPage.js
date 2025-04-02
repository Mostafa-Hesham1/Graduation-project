import React, { useState, useEffect, useRef, useMemo } from 'react';
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
      <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Messages
        {('Notification' in window && Notification.permission === 'default') && (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => window.requestNotificationPermission?.()}
            sx={{ fontSize: '0.7rem' }}
          >
            Enable Notifications
          </Button>
        )}
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
  const messagesContainerRef = useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const previousMessagesLength = useRef(0);
  const previousMessageIds = useRef(new Set());
  
  // Track if we have new messages or just refreshed existing ones
  useEffect(() => {
    if (!messages || !messages.length) return;
    
    const currentIds = new Set(messages.map(msg => msg.id));
    const hasNewMessages = messages.some(msg => !previousMessageIds.current.has(msg.id));
    
    // Update the tracked message IDs
    previousMessageIds.current = currentIds;
    
    // Only auto-scroll if there are new messages and the user wants to be at the bottom
    if (hasNewMessages && shouldScrollToBottom && !isUserScrolling) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, shouldScrollToBottom, isUserScrolling]);
  
  // Handle scroll events to detect when user scrolls up
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isScrolledToBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 20;
    
    setIsUserScrolling(true);
    setShouldScrollToBottom(isScrolledToBottom);
    
    // Reset the flag after a period of no scrolling
    setTimeout(() => setIsUserScrolling(false), 300);
  };
  
  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
      // Always scroll to bottom when sending a new message
      setShouldScrollToBottom(true);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Correctly format timestamps for messages
  const getCorrectTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (err) {
      console.error('Error formatting time:', err);
      return '';
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
        ref={messagesContainerRef}
        onScroll={handleScroll}
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f5f5f5',
          backgroundImage: 'url("/chat-background.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px',
          opacity: 0.95,
          position: 'relative'
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
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', pb: 2 }}>
            {/* Group messages by date for date headers */}
            {(() => {
              const messagesByDate = {};
              
              // Group messages by date
              messages.forEach(message => {
                const date = new Date(message.created_at).toLocaleDateString();
                if (!messagesByDate[date]) {
                  messagesByDate[date] = [];
                }
                messagesByDate[date].push(message);
              });
              
              // Render groups by date
              return Object.entries(messagesByDate).map(([date, messagesOnDate], dateIndex) => (
                <Box key={`date-${dateIndex}`} sx={{ width: '100%' }}>
                  {/* Date header */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 2,
                    mt: dateIndex > 0 ? 3 : 1
                  }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        bgcolor: 'rgba(0,0,0,0.05)', 
                        px: 2, 
                        py: 0.5, 
                        borderRadius: 10, 
                        color: 'text.secondary',
                        fontWeight: 500
                      }}
                    >
                      {new Date(date).toLocaleDateString([], {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Box>
                  
                  {/* Messages for this date */}
                  {messagesOnDate.map((message, index) => {
                    const isSentByMe = message.sender_id === user?._id;
                    
                    // Check if this is a new sender or significant time gap
                    const prevMessage = index > 0 ? messagesOnDate[index - 1] : null;
                    const timeDiff = prevMessage 
                      ? new Date(message.created_at) - new Date(prevMessage.created_at) 
                      : 0;
                    const isNewSender = !prevMessage || prevMessage.sender_id !== message.sender_id;
                    const isTimeGap = timeDiff > 5 * 60 * 1000; // 5 minutes gap
                    
                    return (
                      <React.Fragment key={message.id || `${date}-msg-${index}`}>
                        {/* Time gap indicator */}
                        {isTimeGap && !isNewSender && (
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            my: 2 
                          }}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                bgcolor: 'rgba(0,0,0,0.03)', 
                                px: 1.5, 
                                py: 0.3, 
                                borderRadius: 10, 
                                color: 'text.secondary',
                                fontSize: '0.7rem'
                              }}
                            >
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* WhatsApp-style message with strict left/right alignment */}
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: isSentByMe ? 'flex-end' : 'flex-start',
                            mb: 0.75,
                            mt: isNewSender ? 1.5 : 0.3,
                            width: '100%',
                          }}
                        >
                          {/* Show avatar only for the first message in a sequence from other user */}
                          {!isSentByMe && isNewSender && (
                            <Avatar 
                              sx={{ 
                                height: 30, 
                                width: 30, 
                                mr: 1,
                                mt: 0.5,
                                opacity: 0.9,
                                flexShrink: 0,
                              }}
                              alt={message.sender_name}
                            >
                              {message.sender_name?.[0]?.toUpperCase()}
                            </Avatar>
                          )}
                          
                          {/* Space holder for other messages from same user */}
                          {!isSentByMe && !isNewSender && (
                            <Box sx={{ width: 38, flexShrink: 0 }} />
                          )}
                          
                          {/* Message bubble container */}
                          <Box
                            sx={{
                              maxWidth: '70%',
                              minWidth: '120px',
                              position: 'relative',
                              alignSelf: isSentByMe ? 'flex-end' : 'flex-start',
                            }}
                          >
                            {/* Sender name for first message in a sequence */}
                            {!isSentByMe && isNewSender && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#9C27B0',
                                  fontWeight: 'bold',
                                  display: 'block',
                                  ml: 1.5,
                                  mb: 0.3
                                }}
                              >
                                {message.sender_name}
                              </Typography>
                            )}
                            
                            {/* The actual message bubble */}
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                bgcolor: isSentByMe ? '#DCF8C6' : 'white',
                                color: 'text.primary',
                                borderRadius: '12px',
                                wordBreak: 'break-word',
                                boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
                                borderTopRightRadius: isSentByMe && isNewSender ? 4 : 12,
                                borderTopLeftRadius: !isSentByMe && isNewSender ? 4 : 12,
                                position: 'relative',
                                '&::before': isSentByMe && isNewSender ? {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  right: -8,
                                  width: 0,
                                  height: 0,
                                  borderStyle: 'solid',
                                  borderWidth: '0 0 10px 10px',
                                  borderColor: `transparent transparent #DCF8C6 transparent`,
                                  transform: 'rotate(45deg)',
                                } : !isSentByMe && isNewSender ? {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: -8,
                                  width: 0,
                                  height: 0,
                                  borderStyle: 'solid',
                                  borderWidth: '0 0 10px 10px',
                                  borderColor: `transparent transparent white transparent`,
                                  transform: 'rotate(-45deg)',
                                } : {}
                              }}
                            >
                              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                {message.content}
                              </Typography>
                              
                              {/* Message time */}
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  display: 'block', 
                                  textAlign: 'right',
                                  mt: 0.5,
                                  mb: -0.5,
                                  mr: -0.5,
                                  color: 'rgba(0,0,0,0.45)',
                                  fontSize: '0.65rem',
                                }}
                              >
                                {getCorrectTime(message.created_at)}
                              </Typography>
                            </Paper>
                          </Box>
                        </Box>
                      </React.Fragment>
                    );
                  })}
                </Box>
              ));
            })()}
            
            <div ref={messagesEndRef} />
          </Box>
        )}
        
        {/* New message notification when scrolled up */}
        {!shouldScrollToBottom && previousMessagesLength.current < messages.length && (
          <Box 
            sx={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={() => {
                setShouldScrollToBottom(true);
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{
                borderRadius: 20,
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                px: 2,
              }}
            >
              New messages ↓
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Message input */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: '#f0f0f0'
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
              borderRadius: 28,
              bgcolor: 'white',
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
  
  // Polling setup
  const POLLING_INTERVAL = 5000; // Poll for new messages every 5 seconds
  const pollingIntervalRef = useRef(null);
  
  // Add useEffect to request notification permissions
  useEffect(() => {
    // Request notification permission when the component mounts
    if ('Notification' in window && Notification.permission === 'default') {
      // Add a small button to request notification permission
      const requestNotificationPermission = async () => {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      };
      
      // We'll call this function after a user interaction
      // This avoids auto-requesting which many browsers block
      window.requestNotificationPermission = requestNotificationPermission;
    }
  }, []);
  
  // Fetch conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
      
      // Set up polling for conversations to detect new messages
      pollingIntervalRef.current = setInterval(() => {
        fetchConversations(true); // Silent update - don't show loading state
      }, POLLING_INTERVAL);
      
      // Clear interval on component unmount
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [isAuthenticated]);
  
  // Also set up polling for the active conversation
  useEffect(() => {
    // If we have an active conversation, set up polling for messages
    if (selectedUserId && isAuthenticated) {
      const messagePolling = setInterval(() => {
        loadMessages(selectedUserId, true); // Silent update
      }, POLLING_INTERVAL);
      
      return () => clearInterval(messagePolling);
    }
  }, [selectedUserId, isAuthenticated]);
  
  // If userId is provided in the URL, select that conversation
  useEffect(() => {
    if (userId) {
      console.log("URL userId changed to:", userId);
      // Always update the selected user ID when the URL parameter changes
      setSelectedUserId(userId);
      
      // If conversations are loaded, find the user info
      if (conversations.length > 0) {
        const conversation = conversations.find(c => c.partner_id === userId);
        if (conversation) {
          setSelectedUserName(conversation.partner_name);
        }
      }
    } else if (conversations.length > 0 && !isMobile && !selectedUserId) {
      // Auto-select first conversation on desktop if none selected
      handleSelectConversation(conversations[0].partner_id);
    }
  }, [userId, conversations]); // Removed isMobile dependency to prevent re-triggering
  
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
  const fetchConversations = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      
      // Update conversations without losing selection
      setConversations(prevConversations => {
        // Check if there are new messages by comparing unread counts
        const hasNewMessages = data.conversations.some(newConv => {
          const prevConv = prevConversations.find(c => c.partner_id === newConv.partner_id);
          return !prevConv || newConv.unread_count > prevConv.unread_count;
        });
        
        if (hasNewMessages && !silent) {
          // Don't automatically play sound - browser will block it
          // Instead, use browser notification if available
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Message', {
              body: 'You have received a new message',
              icon: '/iconNavbar.png'
            });
          }
        }
        
        return data.conversations || [];
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };
  
  // Load messages for a specific conversation
  const loadMessages = async (userId, silent = false) => {
    if (!silent) setLoadingMessages(true);
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
      
      // Only update if we have new messages or this is the first load
      if (!silent || data.messages.length !== messages.length) {
        setMessages(data.messages || []);
      }
      
      // Mark messages as read
      await markMessagesAsRead(userId);
      
      // Update unread counts in conversations
      updateConversationUnreadCount(userId);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      if (!silent) setLoadingMessages(false);
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
    // Prevent re-selecting the same conversation
    if (selectedUserId === userId) return;
    
    // First clear messages to prevent flashing old messages when switching conversations
    setMessages([]);
    setSelectedUserId(userId);
    
    // Update the URL for both mobile and desktop
    // This ensures the URL is always in sync with the selected conversation
    navigate(`/messages/${userId}`, { replace: true });
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