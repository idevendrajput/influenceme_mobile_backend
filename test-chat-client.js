import { io } from 'socket.io-client';

// Test configuration
const SERVER_URL = 'http://localhost:3001';
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
      console.log(`\n🔌 Connecting ${this.user.userName} (${this.user.userRole})...`);
      
      this.socket = io(SERVER_URL, {
        auth: {
          token: this.user.token,
          userId: this.user.userId,
          userRole: this.user.userRole,
          userName: this.user.userName
        }
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

// Test scenario
async function runChatTest() {
  console.log('🚀 Starting Socket.IO Chat System Test\n');

  const brandClient = new ChatTestClient(TEST_USERS[0]);
  const influencerClient = new ChatTestClient(TEST_USERS[1]);
  const testRoomId = 'test_room_123';

  try {
    // Step 1: Connect both clients
    await brandClient.connect();
    await influencerClient.connect();
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Join room
    brandClient.joinRoom(testRoomId);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    influencerClient.joinRoom(testRoomId);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Get online users
    brandClient.getOnlineUsers(testRoomId);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 4: Test typing indicators
    brandClient.startTyping(testRoomId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    brandClient.stopTyping(testRoomId);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 5: Send messages
    brandClient.sendMessage(testRoomId, 'Hello from Brand! 👋');
    await new Promise(resolve => setTimeout(resolve, 1000));

    influencerClient.sendMessage(testRoomId, 'Hi Brand! Ready to collaborate! 🤝');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 6: Test read receipts
    brandClient.markAsRead(testRoomId, ['msg1', 'msg2']);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 7: Test ping-pong
    brandClient.ping();
    influencerClient.ping();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 8: Leave room
    influencerClient.leaveRoom(testRoomId);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n✅ Chat system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
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
