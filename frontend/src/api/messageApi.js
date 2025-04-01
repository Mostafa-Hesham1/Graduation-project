import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Get conversation list for current user
export const getConversations = async () => {
  try {
    const response = await axios.get(`${API_URL}/messages/conversations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Get messages between current user and another user
export const getMessages = async (userId, limit = 50, before = null) => {
  try {
    let url = `${API_URL}/messages/${userId}?limit=${limit}`;
    if (before) {
      url += `&before=${before}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Send a message to another user
export const sendMessage = async (recipientId, content, listingId = null) => {
  try {
    const messageData = {
      recipient_id: recipientId,
      content: content
    };
    
    // Include listing ID if provided
    if (listingId) {
      messageData.listing_id = listingId;
    }
    
    const response = await axios.post(`${API_URL}/messages/send`, messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark messages from a user as read
export const markMessagesAsRead = async (userId) => {
  try {
    const response = await axios.post(`${API_URL}/messages/${userId}/mark-read`);
    return response.data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Get unread message count
export const getUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/messages/unread/count`);
    return response.data.unread_count;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    // Return 0 instead of throwing error to prevent UI issues
    return 0;
  }
};

// Poll for new messages in the background
export const setupMessagePolling = (callback, interval = 15000) => {
  const pollerId = setInterval(async () => {
    try {
      // Get unread count
      const count = await getUnreadCount();
      
      // Get conversations to check for new messages
      const { conversations } = await getConversations();
      
      // Call the callback with the data
      callback({
        unreadCount: count,
        conversations
      });
    } catch (error) {
      console.error('Error polling for messages:', error);
      // Don't stop polling on error
    }
  }, interval);
  
  // Return a function to stop polling
  return () => {
    clearInterval(pollerId);
  };
};