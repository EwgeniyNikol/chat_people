import '../css/style.css';
import Modal from './modules/Modal.js';
import Chat from './modules/Chat.js';
import WebSocketClient from './modules/WebSocketClient.js';
import MessageRenderer from './modules/MessageRenderer.js';
import UserList from './modules/UserList.js';

const WS_URL = 'wss://chat-people-backend-viyo.onrender.com';

class App {
  constructor() {
    this.currentUser = null;
    this.wsClient = null;
    this.messageRenderer = null;
    this.userList = null;
    this.chat = null;
  }

  async init() {
    const modal = new Modal();
    
    while (!this.currentUser) {
      const nickname = await modal.show();
      const result = await this.registerUser(nickname);
      
      if (result.success) {
        this.currentUser = result.user;
        modal.close();
      } else {
        modal.showError(result.message);
      }
    }
    
    await this.initWebSocket();
    this.renderUI();
  }

  async registerUser(nickname) {
    try {
      const response = await fetch('https://chat-people-backend-viyo.onrender.com/new-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nickname })
      });
      
      const data = await response.json();
      
      if (response.status === 409 || data.status === 'error') {
        return {
          success: false,
          message: 'Этот никнейм уже занят! Пожалуйста, введите другой.'
        };
      }
      
      if (data.status === 'ok') {
        return {
          success: true,
          user: data.user
        };
      }
      
      return {
        success: false,
        message: 'Ошибка сервера'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Ошибка соединения с сервером'
      };
    }
  }

  async initWebSocket() {
    this.wsClient = new WebSocketClient(WS_URL);
    await this.wsClient.connect();
    
    this.wsClient.onMessage = (data) => {
      this.messageRenderer.renderMessage(data);
    };
    
    this.wsClient.onUserList = (users) => {
      this.userList.render(users);
    };
  }

  renderUI() {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = '';
    
    const mainContainer = document.createElement('div');
    mainContainer.className = 'main-container';
    
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.id = 'user-list';
    
    const chatArea = document.createElement('div');
    chatArea.className = 'chat-area';
    chatArea.id = 'chat-area';
    
    mainContainer.append(sidebar, chatArea);
    appDiv.append(mainContainer);
    
    this.userList = new UserList('user-list');
    this.messageRenderer = new MessageRenderer('chat-area', this.currentUser);
    this.chat = new Chat('chat-area', this.currentUser, this.wsClient);
    
    this.chat.render();
    this.messageRenderer.container = this.chat.getMessagesContainer();
  }
}

const app = new App();
app.init();

window.addEventListener('pagehide', () => {
  if (app.wsClient && app.currentUser) {
    app.wsClient.exit(app.currentUser);
  }
});

window.addEventListener('beforeunload', () => {
  if (app.wsClient && app.currentUser) {
    app.wsClient.exit(app.currentUser);
  }
});