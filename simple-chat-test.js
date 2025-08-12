#!/usr/bin/env node

/**
 * 🧪 Simple Chat System Test
 * 
 * Quick test to verify basic chat functionality is working
 */

import axios from 'axios';

const API_BASE = 'https://mobile.influence-me.in/api';
const TEST_TOKEN = 'test-token-user1';

console.log('🧪 Testing Basic Chat System...\n');

// Test 1: Health Check
try {
  console.log('1️⃣ Testing Health Check...');
  const healthResponse = await axios.get(`${API_BASE}/health`);
  
  if (healthResponse.data.status) {
    console.log('✅ Health Check: PASSED');
    console.log(`   Server Version: ${healthResponse.data.data.version}`);
  } else {
    console.log('❌ Health Check: FAILED');
  }
} catch (error) {
  console.log('❌ Health Check: FAILED -', error.message);
}

// Test 2: Create Chat Room
try {
  console.log('\n2️⃣ Testing Chat Room Creation...');
  const chatResponse = await axios.post(`${API_BASE}/chats/rooms`, {
    participantIds: ['test-user-1', 'test-user-2'],
    roles: ['influencer', 'brand']
  }, {
    headers: {
      'Authorization': `Bearer ${TEST_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (chatResponse.data.status) {
    console.log('✅ Chat Room Creation: PASSED');
    console.log(`   Room ID: ${chatResponse.data.data.roomId}`);
    
    const roomId = chatResponse.data.data.roomId;
    
    // Test 3: Send Normal Message
    try {
      console.log('\n3️⃣ Testing Normal Message...');
      const messageResponse = await axios.post(`${API_BASE}/chats/messages`, {
        roomId: roomId,
        messageType: 'text',
        content: 'Hello from simple test! 👋'
      }, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (messageResponse.data.status) {
        console.log('✅ Normal Message: PASSED');
        console.log(`   Message ID: ${messageResponse.data.data._id}`);
      } else {
        console.log('❌ Normal Message: FAILED');
      }
    } catch (error) {
      console.log('❌ Normal Message: FAILED -', error.response?.data?.message || error.message);
    }
    
    // Test 4: Send Encrypted Message
    try {
      console.log('\n4️⃣ Testing Encrypted Message...');
      const encryptedResponse = await axios.post(`${API_BASE}/chats/messages/encrypted`, {
        roomId: roomId,
        messageType: 'text',
        content: 'This is an encrypted message! 🔐'
      }, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (encryptedResponse.data.status) {
        console.log('✅ Encrypted Message: PASSED');
        console.log(`   Encrypted Message ID: ${encryptedResponse.data.data._id}`);
      } else {
        console.log('❌ Encrypted Message: FAILED');
      }
    } catch (error) {
      console.log('❌ Encrypted Message: FAILED -', error.response?.data?.message || error.message);
    }
    
    // Test 5: Get Chat Messages
    try {
      console.log('\n5️⃣ Testing Message Retrieval...');
      const messagesResponse = await axios.get(`${API_BASE}/chats/rooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      
      if (messagesResponse.data.status) {
        console.log('✅ Message Retrieval: PASSED');
        console.log(`   Messages Found: ${messagesResponse.data.data.messages.length}`);
      } else {
        console.log('❌ Message Retrieval: FAILED');
      }
    } catch (error) {
      console.log('❌ Message Retrieval: FAILED -', error.response?.data?.message || error.message);
    }
    
  } else {
    console.log('❌ Chat Room Creation: FAILED');
  }
} catch (error) {
  console.log('❌ Chat Room Creation: FAILED -', error.response?.data?.message || error.message);
}

console.log('\n🏁 Simple Chat Test Complete!');
console.log('\n📝 Note: For full Socket.IO testing, use the advanced test script with proper dependencies.');
