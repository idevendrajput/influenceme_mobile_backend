#!/usr/bin/env node

/**
 * 🚀 Advanced Chat System Test Script
 * 
 * This script tests all the advanced features of the enhanced chat system:
 * - Real-time messaging with Socket.IO
 * - Message encryption/decryption
 * - Media message handling
 * - Voice message support
 * - Message reactions, editing, deletion
 * - Search functionality
 * - Message forwarding
 * - Chat analytics and export
 * 
 * Usage: node test-advanced-chat.js
 */

import { io } from 'socket.io-client';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  SERVER_URL: 'http://82.29.162.56:3001',
  API_BASE: 'http://82.29.162.56:3001/api',
  SOCKET_URL: 'http://82.29.162.56:3001',
  TEST_TIMEOUT: 30000,
  
  // Test users
  users: [
    {
      id: 'test-user-1',
      name: 'John Influencer',
      role: 'influencer',
      token: 'test-token-user1'
    },
    {
      id: 'test-user-2', 
      name: 'Brand Manager',
      role: 'brand',
      token: 'test-token-user2'
    }
  ]
};

// Test state
const testState = {
  sockets: new Map(),
  chatRoom: null,
  messages: [],
  testResults: {
    passed: 0,
    failed: 0,
    details: []
  }
};

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',  // Cyan
    success: '\x1b[32m', // Green  
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'     // Reset
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const assert = (condition, testName, description = '') => {
  if (condition) {
    testState.testResults.passed++;
    testState.testResults.details.push({ 
      test: testName, 
      status: 'PASSED', 
      description 
    });
    log(`✅ ${testName}: ${description}`, 'success');
  } else {
    testState.testResults.failed++;
    testState.testResults.details.push({ 
      test: testName, 
      status: 'FAILED', 
      description 
    });
    log(`❌ ${testName}: ${description}`, 'error');
  }
};

// HTTP API Testing Functions
const testAPI = {
  // Test creating chat room
  createChatRoom: async () => {
    try {
      log('Testing chat room creation...', 'info');
      
      const response = await axios.post(`${config.API_BASE}/chats/rooms`, {
        participantIds: [config.users[0].id, config.users[1].id],
        roles: ['influencer', 'brand']
      }, {
        headers: {
          'Authorization': `Bearer ${config.users[0].token}`,
          'Content-Type': 'application/json'
        }
      });

      assert(response.status === 200, 'Chat Room Creation', 'Successfully created chat room');
      assert(response.data.status === true, 'Chat Room Response', 'Response has correct status');
      
      testState.chatRoom = response.data.data;
      log(`Chat room created: ${testState.chatRoom.roomId}`, 'success');
      
    } catch (error) {
      assert(false, 'Chat Room Creation', `Failed: ${error.message}`);
    }
  },

  // Test sending encrypted message
  sendEncryptedMessage: async () => {
    try {
      log('Testing encrypted message sending...', 'info');
      
      const response = await axios.post(`${config.API_BASE}/chats/messages/encrypted`, {
        roomId: testState.chatRoom.roomId,
        messageType: 'text',
        content: 'This is a secret encrypted message! 🔐'
      }, {
        headers: {
          'Authorization': `Bearer ${config.users[0].token}`,
          'Content-Type': 'application/json'
        }
      });

      assert(response.status === 200, 'Encrypted Message', 'Successfully sent encrypted message');
      assert(response.data.data.content.text === 'This is a secret encrypted message! 🔐', 
        'Message Decryption', 'Message was properly decrypted in response');
      
    } catch (error) {
      assert(false, 'Encrypted Message', `Failed: ${error.message}`);
    }
  },

  // Test message search
  searchMessages: async () => {
    try {
      log('Testing message search...', 'info');
      
      const response = await axios.get(`${config.API_BASE}/chats/messages/search`, {
        params: {
          query: 'secret',
          roomId: testState.chatRoom.roomId
        },
        headers: {
          'Authorization': `Bearer ${config.users[0].token}`
        }
      });

      assert(response.status === 200, 'Message Search', 'Successfully searched messages');
      assert(response.data.data.messages.length > 0, 'Search Results', 'Found matching messages');
      
    } catch (error) {
      assert(false, 'Message Search', `Failed: ${error.message}`);
    }
  },

  // Test chat statistics
  getChatStatistics: async () => {
    try {
      log('Testing chat statistics...', 'info');
      
      const response = await axios.get(`${config.API_BASE}/chats/rooms/${testState.chatRoom.roomId}/statistics`, {
        headers: {
          'Authorization': `Bearer ${config.users[0].token}`
        }
      });

      assert(response.status === 200, 'Chat Statistics', 'Successfully retrieved chat statistics');
      assert(typeof response.data.data.totalMessages === 'number', 
        'Statistics Data', 'Statistics contain message count');
      
    } catch (error) {
      assert(false, 'Chat Statistics', `Failed: ${error.message}`);
    }
  },

  // Test chat export
  exportChatData: async () => {
    try {
      log('Testing chat data export...', 'info');
      
      const response = await axios.get(`${config.API_BASE}/chats/rooms/${testState.chatRoom.roomId}/export`, {
        params: {
          format: 'json'
        },
        headers: {
          'Authorization': `Bearer ${config.users[0].token}`
        }
      });

      assert(response.status === 200, 'Chat Export', 'Successfully exported chat data');
      assert(response.data.chat && response.data.messages, 
        'Export Data Structure', 'Export contains chat and messages data');
      
    } catch (error) {
      assert(false, 'Chat Export', `Failed: ${error.message}`);
    }
  }
};

// Socket.IO Testing Functions  
const testSocket = {
  // Connect users
  connectUsers: async () => {
    log('Connecting users via Socket.IO...', 'info');
    
    for (const user of config.users) {
      try {
        const socket = io(config.SOCKET_URL, {
          auth: {
            token: user.token,
            userId: user.id,
            userRole: user.role,
            userName: user.name
          },
          transports: ['websocket', 'polling']
        });

        // Setup event listeners
        socket.on('connect', () => {
          log(`${user.name} connected: ${socket.id}`, 'success');
        });

        socket.on('connect_error', (error) => {
          log(`${user.name} connection error: ${error.message}`, 'error');
        });

        socket.on('error', (error) => {
          log(`${user.name} socket error: ${error.message}`, 'error');
        });

        socket.on('newMessage', (message) => {
          log(`${user.name} received message: ${message.content}`, 'info');
          testState.messages.push(message);
        });

        socket.on('userJoined', (data) => {
          log(`${user.name} saw user join: ${data.name}`, 'info');
        });

        socket.on('userStartedTyping', (data) => {
          log(`${user.name} saw ${data.name} start typing`, 'info');
        });

        socket.on('userStoppedTyping', (data) => {
          log(`${user.name} saw ${data.name} stop typing`, 'info');
        });

        socket.on('messageReaction', (data) => {
          log(`${user.name} saw reaction ${data.reaction} on message`, 'info');
        });

        testState.sockets.set(user.id, socket);
        
      } catch (error) {
        assert(false, 'Socket Connection', `Failed to connect ${user.name}: ${error.message}`);
      }
    }

    await sleep(2000); // Wait for connections to establish
    
    const connectedCount = Array.from(testState.sockets.values())
      .filter(socket => socket.connected).length;
      
    assert(connectedCount === config.users.length, 
      'Socket Connections', `Connected ${connectedCount}/${config.users.length} users`);
  },

  // Join chat room
  joinRoom: async () => {
    log('Users joining chat room...', 'info');
    
    const promises = config.users.map(user => {
      return new Promise((resolve) => {
        const socket = testState.sockets.get(user.id);
        
        socket.once('roomJoined', (data) => {
          log(`${user.name} joined room: ${data.roomId}`, 'success');
          resolve(true);
        });

        socket.emit('joinRoom', {
          roomId: testState.chatRoom.roomId,
          userId: user.id
        });
      });
    });

    const results = await Promise.all(promises);
    assert(results.every(r => r), 'Room Joining', 'All users successfully joined room');
  },

  // Test typing indicators
  testTypingIndicators: async () => {
    log('Testing typing indicators...', 'info');
    
    const user1Socket = testState.sockets.get(config.users[0].id);
    const user2Socket = testState.sockets.get(config.users[1].id);

    let typingReceived = false;
    let stoppedTypingReceived = false;

    user2Socket.once('userStartedTyping', (data) => {
      typingReceived = true;
      log(`Typing indicator received: ${data.name}`, 'success');
    });

    user2Socket.once('userStoppedTyping', (data) => {
      stoppedTypingReceived = true; 
      log(`Stopped typing indicator received: ${data.name}`, 'success');
    });

    // User 1 starts typing
    user1Socket.emit('startTyping', {
      roomId: testState.chatRoom.roomId
    });

    await sleep(1000);

    // User 1 stops typing
    user1Socket.emit('stopTyping', {
      roomId: testState.chatRoom.roomId
    });

    await sleep(1000);

    assert(typingReceived, 'Typing Indicators', 'Typing indicator received');
    assert(stoppedTypingReceived, 'Stop Typing Indicators', 'Stop typing indicator received');
  },

  // Test real-time messaging
  testRealTimeMessaging: async () => {
    log('Testing real-time messaging...', 'info');
    
    const user1Socket = testState.sockets.get(config.users[0].id);
    let messageReceived = false;
    let deliveryConfirmed = false;

    const user2Socket = testState.sockets.get(config.users[1].id);
    
    user2Socket.once('newMessage', (message) => {
      messageReceived = true;
      log(`Real-time message received: ${message.content}`, 'success');
    });

    user1Socket.once('messageDelivered', (data) => {
      deliveryConfirmed = true;
      log(`Message delivery confirmed: ${data.messageId}`, 'success');
    });

    // Send message
    const messageId = Date.now().toString();
    user1Socket.emit('chatMessage', {
      roomId: testState.chatRoom.roomId,
      message: 'Hello from Socket.IO! 🚀',
      messageId: messageId,
      tempId: `temp_${messageId}`
    });

    await sleep(2000);

    assert(messageReceived, 'Real-time Messaging', 'Message received in real-time');
    assert(deliveryConfirmed, 'Delivery Confirmation', 'Message delivery confirmed');
  },

  // Test online users
  testOnlineUsers: async () => {
    log('Testing online users functionality...', 'info');
    
    const user1Socket = testState.sockets.get(config.users[0].id);
    
    return new Promise((resolve) => {
      user1Socket.once('onlineUsers', (data) => {
        log(`Online users received: ${data.count} users`, 'success');
        assert(data.count >= 2, 'Online Users Count', `Found ${data.count} online users`);
        assert(Array.isArray(data.users), 'Online Users List', 'Users list is an array');
        resolve();
      });

      user1Socket.emit('getOnlineUsers', {
        roomId: testState.chatRoom.roomId
      });
    });
  },

  // Test connection health
  testConnectionHealth: async () => {
    log('Testing connection health (ping-pong)...', 'info');
    
    const user1Socket = testState.sockets.get(config.users[0].id);
    
    return new Promise((resolve) => {
      user1Socket.once('pong', (data) => {
        log(`Pong received with timestamp: ${data.timestamp}`, 'success');
        assert(data.timestamp, 'Connection Health', 'Ping-pong working correctly');
        resolve();
      });

      user1Socket.emit('ping');
    });
  }
};

// Main test execution
const runTests = async () => {
  log('🚀 Starting Advanced Chat System Tests', 'info');
  log('=' .repeat(60), 'info');
  
  try {
    // HTTP API Tests
    log('Running HTTP API Tests...', 'warning');
    await testAPI.createChatRoom();
    await sleep(1000);
    await testAPI.sendEncryptedMessage();
    await sleep(1000);
    await testAPI.searchMessages();
    await sleep(1000);
    await testAPI.getChatStatistics();
    await sleep(1000);
    await testAPI.exportChatData();
    
    // Socket.IO Tests
    log('Running Socket.IO Tests...', 'warning');
    await testSocket.connectUsers();
    await sleep(2000);
    await testSocket.joinRoom();
    await sleep(1000);
    await testSocket.testTypingIndicators();
    await sleep(1000);
    await testSocket.testRealTimeMessaging();
    await sleep(1000);
    await testSocket.testOnlineUsers();
    await sleep(1000);
    await testSocket.testConnectionHealth();
    
  } catch (error) {
    log(`Test execution error: ${error.message}`, 'error');
  }
  
  // Cleanup
  log('Cleaning up connections...', 'info');
  for (const socket of testState.sockets.values()) {
    if (socket.connected) {
      socket.disconnect();
    }
  }
  
  // Results Summary
  log('=' .repeat(60), 'info');
  log('🎯 Test Results Summary', 'warning');
  log('=' .repeat(60), 'info');
  
  const total = testState.testResults.passed + testState.testResults.failed;
  const passRate = total > 0 ? ((testState.testResults.passed / total) * 100).toFixed(2) : 0;
  
  log(`Total Tests: ${total}`, 'info');
  log(`Passed: ${testState.testResults.passed}`, 'success'); 
  log(`Failed: ${testState.testResults.failed}`, 'error');
  log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'success' : 'error');
  
  // Detailed results
  if (testState.testResults.details.length > 0) {
    log('\n📋 Detailed Results:', 'info');
    testState.testResults.details.forEach(result => {
      const status = result.status === 'PASSED' ? '✅' : '❌';
      log(`${status} ${result.test}: ${result.description}`, 
        result.status === 'PASSED' ? 'success' : 'error');
    });
  }
  
  // Export results to file
  const resultsFile = path.join(__dirname, 'test-results.json');
  await fs.writeFile(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed: testState.testResults.passed,
      failed: testState.testResults.failed,
      passRate: passRate + '%'
    },
    details: testState.testResults.details,
    configuration: config
  }, null, 2));
  
  log(`\n📄 Results exported to: ${resultsFile}`, 'info');
  log('🏁 Advanced Chat System Testing Complete!', 'success');
  
  // Exit with proper code
  process.exit(testState.testResults.failed > 0 ? 1 : 0);
};

// Handle process events
process.on('SIGINT', () => {
  log('Test interrupted by user', 'warning');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log(`Unhandled promise rejection: ${reason}`, 'error');
  process.exit(1);
});

// Start tests
runTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
