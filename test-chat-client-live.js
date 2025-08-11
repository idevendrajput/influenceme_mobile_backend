import { io } from 'socket.io-client';

// Test configuration for live server
const SERVER_URL = 'http://82.29.162.56:3001';
const TEST_USERS = [
  {
    userId: '507f1f77bcf86cd799439011',
    userName: 'TestBrand',
    userRole: 'brand',
    token: 'test-token-brand'
  },
  {
    userId: '507f1f77bcf86cd799439012',
    userName: 'TestInfluencer',
    userRole: 'influencer',
    token: 'test-token-influencer'
  }
];

class ChatTestClient {
  constructor(user) {
    this.user = user;
    this.socket = null;
    this.connected = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      console.log(`\n🔌 Connecting ${this.user.userName} (${this.user.userRole}) to ${SERVER_URL}...`);
      
      this.socket = io(SERVER_URL, {
        auth: {
          token: this.user.token,
          userId: this.user.userId,
          userRole: this.user.userRole,
          userName: this.user.userName
        },
        timeout: 10000
      });

      this.socket.on('connect', () => {
        console.log(`✅ ${this.user.userName} connected with ID: ${this.socket.id}`);
        this.connected = true;
        this.setupEventListeners();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.log(`❌ ${this.user.userName} connection failed:`, error.message);
        reject(error);
      });
    });
  }

  setupEventListeners() {
    // Room events
    this.socket.on('roomJoined', (data) => {
      console.log(`🏠 ${this.user.userName} joined room: ${data.roomId}`);
    });

    this.socket.on('roomLeft', (data) => {
      console.log(`🚪 ${this.user.userName} left room: ${data.roomId}`);
    });

    this.socket.on('userJoined', (data) => {
      console.log(`👋 ${data.name} (${data.role}) joined the room`);
    });

    this.socket.on('userLeft', (data) => {
      console.log(`👋 ${data.name} (${data.role}) left the room`);
    });

    // Message events
    this.socket.on('newMessage', (data) => {
      console.log(`📨 ${this.user.userName} received message from ${data.sender.name}: ${data.content}`);
    });

    this.socket.on('messageDelivered', (data) => {
      console.log(`✅ ${this.user.userName} message delivered: ${data.messageId}`);
    });

    // Typing events
    this.socket.on('userStartedTyping', (data) => {
      console.log(`✏️ ${data.name} started typing...`);
    });

    this.socket.on('userStoppedTyping', (data) => {
      console.log(`✏️ ${data.name} stopped typing`);
    });

    // Read receipts
    this.socket.on('messagesRead', (data) => {
      console.log(`👀 ${data.readBy.name} read messages: ${data.messageIds.join(', ')}`);
    });

    // Online users
    this.socket.on('onlineUsers', (data) => {
      console.log(`👥 Online users in ${data.roomId}: ${data.count} users`);
    });

    // Error handling
    this.socket.on('error', (data) => {
      console.log(`❌ ${this.user.userName} error: ${data.message}`);
    });

    // Connection health
    this.socket.on('pong', (data) => {
      console.log(`🏓 ${this.user.userName} received pong: ${data.timestamp}`);
    });
  }

  joinRoom(roomId) {
    console.log(`🏠 ${this.user.userName} joining room: ${roomId}`);
    this.socket.emit('joinRoom', { roomId, userId: this.user.userId });
  }

  leaveRoom(roomId) {
    console.log(`🚪 ${this.user.userName} leaving room: ${roomId}`);
    this.socket.emit('leaveRoom', { roomId });
  }

  sendMessage(roomId, message) {
    const messageId = Date.now().toString();
    console.log(`📤 ${this.user.userName} sending message: ${message}`);
    this.socket.emit('chatMessage', { 
      roomId, 
      message, 
      messageId,
      tempId: `temp_${messageId}`
    });
  }

  startTyping(roomId) {
    console.log(`✏️ ${this.user.userName} started typing...`);
    this.socket.emit('startTyping', { roomId });
  }

  stopTyping(roomId) {
    console.log(`✏️ ${this.user.userName} stopped typing`);
    this.socket.emit('stopTyping', { roomId });
  }

  markAsRead(roomId, messageIds) {
    console.log(`👀 ${this.user.userName} marking messages as read`);
    this.socket.emit('markAsRead', { roomId, messageIds });
  }

  getOnlineUsers(roomId) {
    console.log(`👥 ${this.user.userName} requesting online users`);
    this.socket.emit('getOnlineUsers', { roomId });
  }

  ping() {
    console.log(`🏓 ${this.user.userName} sending ping`);
    this.socket.emit('ping');
  }

  disconnect() {
    if (this.socket) {
      console.log(`🔌 ${this.user.userName} disconnecting...`);
      this.socket.disconnect();
      this.connected = false;
    }
  }
}

// Test scenario for live server
async function runChatTest() {
  console.log('🚀 Starting Socket.IO Chat System Test (LIVE SERVER)');
  console.log('==================================================\n');

  const brandClient = new ChatTestClient(TEST_USERS[0]);
  const influencerClient = new ChatTestClient(TEST_USERS[1]);
  const testRoomId = 'live_test_room_' + Date.now();

  try {
    // Step 1: Connect both clients
    console.log('Step 1: Connecting clients...');
    await brandClient.connect();
    await influencerClient.connect();
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Join room
    console.log('\nStep 2: Joining room...');
    brandClient.joinRoom(testRoomId);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    influencerClient.joinRoom(testRoomId);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Get online users
    console.log('\nStep 3: Getting online users...');
    brandClient.getOnlineUsers(testRoomId);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 4: Test typing indicators
    console.log('\nStep 4: Testing typing indicators...');
    brandClient.startTyping(testRoomId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    brandClient.stopTyping(testRoomId);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 5: Send messages
    console.log('\nStep 5: Sending messages...');
    brandClient.sendMessage(testRoomId, 'Hello from Brand! 👋 (LIVE TEST)');
    await new Promise(resolve => setTimeout(resolve, 1000));

    influencerClient.sendMessage(testRoomId, 'Hi Brand! Ready to collaborate! 🤝 (LIVE TEST)');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 6: Test read receipts
    console.log('\nStep 6: Testing read receipts...');
    brandClient.markAsRead(testRoomId, ['msg1', 'msg2']);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 7: Test ping-pong
    console.log('\nStep 7: Testing connection health...');
    brandClient.ping();
    influencerClient.ping();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 8: Leave room
    console.log('\nStep 8: Leaving room...');
    influencerClient.leaveRoom(testRoomId);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n🎉 Live chat system test completed successfully!');
    console.log('=============================================');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Cleanup
    setTimeout(() => {
      brandClient.disconnect();
      influencerClient.disconnect();
      process.exit(0);
    }, 2000);
  }
}

// Run the test
runChatTest().catch(console.error);
