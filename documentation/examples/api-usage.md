# API Usage Examples

This document provides comprehensive examples of how to use the InfluenceMe backend APIs in various scenarios.

## Table of Contents

1. [Authentication Examples](#authentication-examples)
2. [User Profile Management](#user-profile-management)
3. [Social Media Management](#social-media-management)
4. [Chat System Examples](#chat-system-examples)
5. [User Discovery & Filtering](#user-discovery--filtering)
6. [Error Handling](#error-handling)
7. [Integration Patterns](#integration-patterns)

---

## Authentication Examples

### Complete Registration Flow

```javascript
// Step 1: Check if user exists
const checkUserExists = async (email, phone, phoneCode) => {
  const response = await fetch('/api/auth/check_user_exists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, phone, phoneCode })
  });
  const result = await response.json();
  return result.data.exists;
};

// Step 2: Register new user if doesn't exist
const registerInfluencer = async (userData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      phoneCode: userData.phoneCode,
      about: userData.about,
      country: userData.country,
      dateOfBirth: userData.dateOfBirth,
      spokenLanguages: userData.spokenLanguages,
      influencerType: userData.influencerType,
      socialMedia: userData.socialMedia,
      workType: userData.workType,
      influencerSince: userData.influencerSince
    })
  });
  return response.json();
};

// Step 3: Login existing user
const loginUser = async (email, phone, phoneCode) => {
  const loginData = email ? { email } : { phone, phoneCode };
  
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
  });
  return response.json();
};

// Complete authentication flow
const authenticateUser = async (userData) => {
  try {
    // Check if user exists
    const exists = await checkUserExists(
      userData.email, 
      userData.phone, 
      userData.phoneCode
    );
    
    if (exists) {
      // User exists, login
      const loginResult = await loginUser(
        userData.email, 
        userData.phone, 
        userData.phoneCode
      );
      
      if (loginResult.status) {
        localStorage.setItem('token', loginResult.data.token);
        localStorage.setItem('user', JSON.stringify(loginResult.data.user));
        return { success: true, action: 'login', data: loginResult.data };
      }
    } else {
      // User doesn't exist, register
      const registerResult = await registerInfluencer(userData);
      
      if (registerResult.status) {
        localStorage.setItem('token', registerResult.data.token);
        localStorage.setItem('user', JSON.stringify(registerResult.data.user));
        return { success: true, action: 'register', data: registerResult.data };
      }
    }
    
    return { success: false, message: 'Authentication failed' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Example usage
const userData = {
  name: "Alex Johnson",
  email: "alex@example.com",
  about: "Tech enthusiast and mobile app reviewer",
  country: "USA",
  dateOfBirth: "1995-03-20",
  spokenLanguages: ["English"],
  influencerType: "micro",
  socialMedia: [
    {
      platform: "instagram",
      handle: "@alextech",
      url: "https://instagram.com/alextech",
      followers: { actual: 25000, bought: 0 },
      engagement: { averagePerPost: 1250, topEngagementPerPost: 3000 },
      isVerified: false,
      isActive: true
    }
  ],
  workType: "part-time",
  influencerSince: 2022
};

authenticateUser(userData).then(result => {
  if (result.success) {
    console.log(`User ${result.action}ed successfully:`, result.data.user);
  } else {
    console.error('Authentication failed:', result.message);
  }
});
```

---

## User Profile Management

### Get and Update Profile

```javascript
// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Get user profile
const getUserProfile = async () => {
  const response = await fetch('/api/users/profile', {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
};

// Update user profile
const updateUserProfile = async (updates) => {
  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return response.json();
};

// Example: Update basic info
const updateBasicInfo = async () => {
  const updates = {
    about: "Updated bio: Tech influencer specializing in AI and machine learning",
    country: "Canada",
    spokenLanguages: ["English", "French"],
    maritalStatus: "single",
    children: 0,
    pets: 1
  };
  
  const result = await updateUserProfile(updates);
  if (result.status) {
    console.log('Profile updated successfully');
  }
};

// Example: Update address
const updateAddress = async () => {
  const updates = {
    addresses: {
      streetAddress: "789 Tech Street",
      state: "Ontario",
      country: "Canada",
      pinCode: "K1A 0A6",
      latitude: "45.4215",
      longitude: "-75.6972"
    }
  };
  
  await updateUserProfile(updates);
};
```

---

## Social Media Management

### Dynamic Social Media Platform Management

```javascript
// Add new social media platform
const addSocialMediaPlatform = async (platformData) => {
  // First get current profile
  const profileResult = await getUserProfile();
  
  if (profileResult.status) {
    const currentSocialMedia = profileResult.data.socialMedia || [];
    const updatedSocialMedia = [...currentSocialMedia, platformData];
    
    return await updateUserProfile({
      socialMedia: updatedSocialMedia
    });
  }
};

// Update existing platform
const updateSocialMediaPlatform = async (platform, updates) => {
  const profileResult = await getUserProfile();
  
  if (profileResult.status) {
    const socialMedia = profileResult.data.socialMedia || [];
    const platformIndex = socialMedia.findIndex(p => p.platform === platform);
    
    if (platformIndex > -1) {
      // Update existing platform
      socialMedia[platformIndex] = {
        ...socialMedia[platformIndex],
        ...updates
      };
    } else {
      // Add new platform
      socialMedia.push({
        platform,
        ...updates,
        isActive: true,
        addedAt: new Date()
      });
    }
    
    return await updateUserProfile({ socialMedia });
  }
};

// Remove social media platform
const removeSocialMediaPlatform = async (platform) => {
  const profileResult = await getUserProfile();
  
  if (profileResult.status) {
    const socialMedia = profileResult.data.socialMedia || [];
    const filteredSocialMedia = socialMedia.filter(p => p.platform !== platform);
    
    return await updateUserProfile({ socialMedia: filteredSocialMedia });
  }
};

// Example: Add YouTube channel
const addYouTubeChannel = async () => {
  const youtubeData = {
    platform: "youtube",
    handle: "TechReviewsWithAlex",
    url: "https://youtube.com/@techreviewswithalex",
    followers: {
      actual: 50000,
      bought: 0
    },
    engagement: {
      averagePerPost: 2500,
      topEngagementPerPost: 8000,
      maximumLikes: 15000
    },
    metrics: {
      videosPosted: 120,
      subscribers: 50000,
      averageViews: 25000
    },
    isVerified: true,
    isActive: true
  };
  
  const result = await addSocialMediaPlatform(youtubeData);
  console.log('YouTube channel added:', result.status);
};

// Example: Update Instagram metrics
const updateInstagramMetrics = async () => {
  const updates = {
    followers: {
      actual: 28000,
      bought: 0
    },
    engagement: {
      averagePerPost: 1400,
      topEngagementPerPost: 3500,
      maximumLikes: 5000
    },
    metrics: {
      postsCount: 200,
      averageViews: 4000
    }
  };
  
  await updateSocialMediaPlatform('instagram', updates);
};

// Example: Add TikTok profile
const addTikTokProfile = async () => {
  const tiktokData = {
    platform: "tiktok",
    handle: "@alextech",
    url: "https://tiktok.com/@alextech",
    followers: {
      actual: 75000,
      bought: 0
    },
    engagement: {
      averagePerPost: 3750,
      topEngagementPerPost: 12000,
      maximumLikes: 50000
    },
    metrics: {
      videosPosted: 300,
      averageViews: 15000
    },
    isVerified: false,
    isActive: true
  };
  
  await addSocialMediaPlatform(tiktokData);
};
```

---

## Chat System Examples

### REST API Chat Management

```javascript
// Create or get chat room
const createChatRoom = async (participantIds, roles) => {
  const response = await fetch('/api/chats/rooms', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ participantIds, roles })
  });
  return response.json();
};

// Get user's chat rooms
const getChatRooms = async () => {
  const response = await fetch('/api/chats/rooms', {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
};

// Get messages from a chat room
const getChatMessages = async (roomId, page = 1, limit = 50) => {
  const response = await fetch(
    `/api/chats/rooms/${roomId}/messages?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  );
  return response.json();
};

// Send message via REST API
const sendMessage = async (roomId, content, messageType = 'text') => {
  const response = await fetch('/api/chats/messages', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ roomId, content, messageType })
  });
  return response.json();
};

// Mark messages as read
const markMessagesAsRead = async (roomId, messageIds) => {
  const response = await fetch(`/api/chats/rooms/${roomId}/messages/read`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ messageIds })
  });
  return response.json();
};

// Example: Start conversation between influencer and brand
const startConversation = async (brandId) => {
  // Get current user from storage
  const currentUser = JSON.parse(localStorage.getItem('user'));
  
  // Create chat room
  const chatResult = await createChatRoom(
    [currentUser.id, brandId],
    ['influencer', 'brand']
  );
  
  if (chatResult.status) {
    const roomId = chatResult.data.roomId;
    
    // Send initial message
    const messageResult = await sendMessage(
      roomId,
      "Hello! I'm interested in collaborating with your brand."
    );
    
    if (messageResult.status) {
      console.log('Conversation started successfully');
      return { roomId, messageId: messageResult.data._id };
    }
  }
  
  return null;
};
```

### Socket.IO Real-time Chat

```javascript
import { io } from 'socket.io-client';

class ChatManager {
  constructor(serverUrl, userToken, userId, userRole, userName) {
    this.socket = null;
    this.serverUrl = serverUrl;
    this.userToken = userToken;
    this.userId = userId;
    this.userRole = userRole;
    this.userName = userName;
    this.currentRooms = new Set();
  }
  
  // Connect to server
  connect() {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        auth: {
          token: this.userToken,
          userId: this.userId,
          userRole: this.userRole,
          userName: this.userName
        }
      });
      
      this.socket.on('connect', () => {
        console.log('Connected to chat server');
        this.setupEventListeners();
        resolve();
      });
      
      this.socket.on('connect_error', reject);
    });
  }
  
  // Setup event listeners
  setupEventListeners() {
    // Message events
    this.socket.on('newMessage', (data) => {
      console.log('New message:', data);
      this.onMessageReceived(data);
    });
    
    this.socket.on('messageDelivered', (data) => {
      console.log('Message delivered:', data.messageId);
      this.onMessageDelivered(data);
    });
    
    // Typing events
    this.socket.on('userStartedTyping', (data) => {
      this.onUserStartedTyping(data);
    });
    
    this.socket.on('userStoppedTyping', (data) => {
      this.onUserStoppedTyping(data);
    });
    
    // Room events
    this.socket.on('userJoined', (data) => {
      console.log(`${data.name} joined the room`);
    });
    
    this.socket.on('userLeft', (data) => {
      console.log(`${data.name} left the room`);
    });
    
    // Read receipts
    this.socket.on('messagesRead', (data) => {
      console.log(`${data.readBy.name} read messages`);
      this.onMessagesRead(data);
    });
    
    // Error handling
    this.socket.on('error', (data) => {
      console.error('Socket error:', data.message);
    });
  }
  
  // Join a chat room
  joinRoom(roomId) {
    if (this.socket && !this.currentRooms.has(roomId)) {
      this.socket.emit('joinRoom', { roomId, userId: this.userId });
      this.currentRooms.add(roomId);
    }
  }
  
  // Leave a chat room
  leaveRoom(roomId) {
    if (this.socket && this.currentRooms.has(roomId)) {
      this.socket.emit('leaveRoom', { roomId });
      this.currentRooms.delete(roomId);
    }
  }
  
  // Send message
  sendMessage(roomId, message) {
    if (this.socket) {
      const messageId = Date.now().toString();
      const tempId = `temp_${messageId}`;
      
      this.socket.emit('chatMessage', {
        roomId,
        message,
        messageId,
        tempId
      });
      
      return { messageId, tempId };
    }
  }
  
  // Start typing
  startTyping(roomId) {
    this.socket?.emit('startTyping', { roomId });
  }
  
  // Stop typing
  stopTyping(roomId) {
    this.socket?.emit('stopTyping', { roomId });
  }
  
  // Mark messages as read
  markAsRead(roomId, messageIds) {
    this.socket?.emit('markAsRead', { roomId, messageIds });
  }
  
  // Get online users
  getOnlineUsers(roomId) {
    this.socket?.emit('getOnlineUsers', { roomId });
  }
  
  // Disconnect
  disconnect() {
    if (this.socket) {
      // Leave all rooms
      this.currentRooms.forEach(roomId => {
        this.socket.emit('leaveRoom', { roomId });
      });
      
      this.socket.disconnect();
      this.currentRooms.clear();
    }
  }
  
  // Event handlers (override these in your implementation)
  onMessageReceived(data) {
    // Handle incoming message
  }
  
  onMessageDelivered(data) {
    // Handle message delivery confirmation
  }
  
  onUserStartedTyping(data) {
    // Show typing indicator
  }
  
  onUserStoppedTyping(data) {
    // Hide typing indicator
  }
  
  onMessagesRead(data) {
    // Update read receipts
  }
}

// Usage example
const initializeChat = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  const chatManager = new ChatManager(
    'http://localhost:3001',
    token,
    user.id,
    user.role,
    user.name
  );
  
  await chatManager.connect();
  
  // Join a room and send a message
  const roomId = 'room_123';
  chatManager.joinRoom(roomId);
  chatManager.sendMessage(roomId, 'Hello everyone!');
  
  return chatManager;
};
```

---

## User Discovery & Filtering

### Advanced User Search

```javascript
// Search users with multiple filters
const searchUsers = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add all filters to query params
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') {
      queryParams.append(key, filters[key]);
    }
  });
  
  const response = await fetch(`/api/users?${queryParams.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  return response.json();
};

// Example: Find micro influencers in tech
const findTechInfluencers = async () => {
  const filters = {
    country: 'USA',
    influencerType: 'micro',
    minFollowers: 5000,
    platform: 'instagram',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };
  
  const result = await searchUsers(filters);
  
  if (result.status) {
    console.log(`Found ${result.data.users.length} tech influencers`);
    return result.data.users;
  }
  
  return [];
};

// Example: Find influencers by location and follower count
const findInfluencersByLocation = async (country, minFollowers = 1000) => {
  return await searchUsers({
    country,
    minFollowers,
    page: 1,
    limit: 50
  });
};

// Example: Find verified influencers on specific platform
const findVerifiedInfluencers = async (platform) => {
  // This would require a backend modification to support verification filtering
  // For now, we fetch users and filter client-side
  const result = await searchUsers({ platform, limit: 100 });
  
  if (result.status) {
    const verifiedUsers = result.data.users.filter(user => {
      const platformData = user.socialMedia.find(sm => 
        sm.platform === platform && sm.isVerified
      );
      return platformData !== undefined;
    });
    
    return verifiedUsers;
  }
  
  return [];
};
```

---

## Error Handling

### Centralized Error Handling

```javascript
class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'APIError';
  }
}

// API request wrapper with error handling
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new APIError(
        data.message || 'Request failed',
        response.status,
        data.data
      );
    }
    
    if (!data.status) {
      throw new APIError(data.message, response.status, data.data);
    }
    
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network or other errors
    throw new APIError('Network error occurred', 0, null);
  }
};

// Wrapper functions with error handling
const safeUserProfile = async () => {
  try {
    return await apiRequest('/api/users/profile', {
      method: 'GET',
      headers: getAuthHeaders()
    });
  } catch (error) {
    console.error('Failed to get user profile:', error.message);
    
    if (error.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    throw error;
  }
};

const safeUpdateProfile = async (updates) => {
  try {
    return await apiRequest('/api/users/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
  } catch (error) {
    console.error('Failed to update profile:', error.message);
    
    // Handle specific errors
    switch (error.status) {
      case 400:
        if (error.message.includes('media IDs')) {
          alert('Some uploaded files are invalid. Please try again.');
        }
        break;
      case 401:
        // Redirect to login
        window.location.href = '/login';
        break;
      case 500:
        alert('Server error. Please try again later.');
        break;
    }
    
    throw error;
  }
};
```

---

## Integration Patterns

### React Hook for Profile Management

```javascript
import { useState, useEffect, useCallback } from 'react';

const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load profile
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await safeUserProfile();
      setProfile(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update profile
  const updateProfile = useCallback(async (updates) => {
    try {
      setError(null);
      const result = await safeUpdateProfile(updates);
      setProfile(prev => ({ ...prev, ...updates }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);
  
  // Add social media platform
  const addSocialMedia = useCallback(async (platformData) => {
    if (!profile) return;
    
    const updatedSocialMedia = [...(profile.socialMedia || []), platformData];
    return await updateProfile({ socialMedia: updatedSocialMedia });
  }, [profile, updateProfile]);
  
  // Remove social media platform
  const removeSocialMedia = useCallback(async (platform) => {
    if (!profile) return;
    
    const updatedSocialMedia = profile.socialMedia.filter(
      sm => sm.platform !== platform
    );
    return await updateProfile({ socialMedia: updatedSocialMedia });
  }, [profile, updateProfile]);
  
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);
  
  return {
    profile,
    loading,
    error,
    updateProfile,
    addSocialMedia,
    removeSocialMedia,
    reload: loadProfile
  };
};

// Usage in React component
const ProfileManager = () => {
  const { 
    profile, 
    loading, 
    error, 
    updateProfile, 
    addSocialMedia,
    removeSocialMedia 
  } = useUserProfile();
  
  const handleAddInstagram = async () => {
    const instagramData = {
      platform: 'instagram',
      handle: '@newhandle',
      followers: { actual: 1000, bought: 0 },
      isActive: true
    };
    
    try {
      await addSocialMedia(instagramData);
      alert('Instagram account added!');
    } catch (error) {
      alert('Failed to add Instagram account');
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>{profile.name}</h2>
      <p>{profile.about}</p>
      
      <div>
        <h3>Social Media Platforms</h3>
        {profile.socialMedia?.map(platform => (
          <div key={platform.platform}>
            <strong>{platform.platform}</strong>: {platform.handle}
            <button onClick={() => removeSocialMedia(platform.platform)}>
              Remove
            </button>
          </div>
        ))}
        
        <button onClick={handleAddInstagram}>
          Add Instagram
        </button>
      </div>
    </div>
  );
};
```

### Vue.js Composition API Example

```javascript
import { ref, computed, onMounted } from 'vue';

export const useUserProfile = () => {
  const profile = ref(null);
  const loading = ref(true);
  const error = ref(null);
  
  const totalFollowers = computed(() => {
    if (!profile.value?.socialMedia) return 0;
    return profile.value.socialMedia.reduce((total, platform) => {
      return total + (platform.followers?.actual || 0);
    }, 0);
  });
  
  const activePlatforms = computed(() => {
    return profile.value?.socialMedia?.filter(p => p.isActive) || [];
  });
  
  const loadProfile = async () => {
    try {
      loading.value = true;
      error.value = null;
      const result = await safeUserProfile();
      profile.value = result.data;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  
  const updateProfile = async (updates) => {
    try {
      error.value = null;
      await safeUpdateProfile(updates);
      profile.value = { ...profile.value, ...updates };
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };
  
  onMounted(() => {
    loadProfile();
  });
  
  return {
    profile,
    loading,
    error,
    totalFollowers,
    activePlatforms,
    updateProfile,
    loadProfile
  };
};
```

---

**Last Updated**: January 2025  
**Examples Version**: 1.0.0
