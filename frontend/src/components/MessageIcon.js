import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Badge, Tooltip, Menu, MenuItem, Typography, Avatar, Box, Divider, ListItemText, ListItemAvatar } from '@mui/material';
import { Email } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';

// Styled Menu component
const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: theme.spacing(1),
    minWidth: 280,
    boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
    padding: theme.spacing(1, 0),
  },
}));

// Styled MenuItem component
const StyledMenuItem = styled(MenuItem)(({ theme, hasUnread }) => ({
  padding: theme.spacing(1.5, 2),
  borderLeft: hasUnread ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

// Format timestamp without date-fns
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
      return 'Yesterday';
    } 
    // Otherwise return month and day
    else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  } catch (err) {
    console.error('Error formatting date:', err);
    return '';
  }
};

const MessageIcon = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [recentConversations, setRecentConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch unread message count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch('/api/messages/unread/count', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error(`Failed to fetch unread count: ${response.status}`);
      
      const data = await response.json();
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };
  
  // Fetch recent conversations when menu is opened
  const fetchRecentConversations = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/messages/conversations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error(`Failed to fetch conversations: ${response.status}`);
      
      const data = await response.json();
      if (data && data.conversations) {
        // Sort by unread first, then by date
        const sorted = [...data.conversations].sort((a, b) => {
          // First sort by unread
          if (a.unread_count && !b.unread_count) return -1;
          if (!a.unread_count && b.unread_count) return 1;
          
          // Then by date
          const dateA = new Date(a.last_message?.created_at || 0);
          const dateB = new Date(b.last_message?.created_at || 0);
          return dateB - dateA;
        });
        
        // Take only the first 5
        setRecentConversations(sorted.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching recent conversations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Open menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchRecentConversations();
  };
  
  // Close menu
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Navigate to message center
  const handleViewAllMessages = () => {
    handleClose();
    navigate('/messages');
  };
  
  // Navigate to specific conversation
  const handleOpenConversation = (userId) => {
    handleClose();
    navigate(`/messages/${userId}`);
  };
  
  // Fetch unread count on mount and set up polling
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) return null;
  
  return (
    <>
      <Tooltip title="Messages">
        <IconButton 
          color="inherit" 
          onClick={handleClick}
          sx={{ mr: 1 }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            overlap="circular"
            invisible={unreadCount === 0}
          >
            <Email sx={{ color: 'white' }} />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Messages
            {unreadCount > 0 && (
              <Badge 
                badgeContent={unreadCount} 
                color="primary" 
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 0.5 }} />
        
        {loading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Loading conversations...
            </Typography>
          </Box>
        ) : recentConversations.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No recent conversations
            </Typography>
          </Box>
        ) : (
          recentConversations.map((conversation) => (
            <StyledMenuItem 
              key={conversation.partner_id}
              onClick={() => handleOpenConversation(conversation.partner_id)}
              hasUnread={conversation.unread_count > 0}
            >
              <ListItemAvatar>
                <Badge
                  badgeContent={conversation.unread_count}
                  color="primary"
                  overlap="circular"
                  invisible={conversation.unread_count === 0}
                >
                  <Avatar>
                    {conversation.partner_name?.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={conversation.partner_name}
                secondary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" noWrap sx={{ maxWidth: '120px' }}>
                      {conversation.last_message?.content || 'No messages yet'}
                    </Typography>
                    {conversation.last_message?.created_at && (
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {formatMessageTime(conversation.last_message.created_at)}
                      </Typography>
                    )}
                  </Box>
                }
                primaryTypographyProps={{
                  fontWeight: conversation.unread_count > 0 ? 600 : 400,
                  fontSize: '0.9rem',
                }}
                secondaryTypographyProps={{
                  component: 'div',
                }}
              />
            </StyledMenuItem>
          ))
        )}
        
        <Divider sx={{ my: 0.5 }} />
        
        <MenuItem onClick={handleViewAllMessages} sx={{ justifyContent: 'center' }}>
          <Typography variant="body2" color="primary" fontWeight="medium">
            View All Messages
          </Typography>
        </MenuItem>
      </StyledMenu>
    </>
  );
};

export default MessageIcon;