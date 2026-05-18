import '../css/style.css';
import Modal from './modules/Modal.js';
import Chat from './modules/Chat.js';
import WebSocketClient from './modules/WebSocketClient.js';
import MessageRenderer from './modules/MessageRenderer.js';
import UserList from './modules/UserList.js';

const WS_URL = 'wss://YOUR-RENDER-URL.onrender.com'; // Замените позже на реальный URL

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
      const isRegistered = await this.registerUser(nickname, modal);
      if (isRegistered) {
        this.currentUser = isRegistered;
        modal.close();
      }
    }
    
    await this.initWebSocket();
    this.renderUI();
  }

  async registerUser(nickname, modal) {
    try {
      const response = await fetch('https://YOUR-RENDER-URL.onrender.com/new-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nickname })
      });
      
      const data = await response.json();
      
      if (data.status === 'ok') {
        return data.user;
      } else {
        modal.showError('Этот никнейм уже занят!');
        return null;
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      modal.showError('Ошибка сервера');
      return null;
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
    
    const originalGetMessagesContainer = this.chat.getMessagesContainer;
    this.messageRenderer.container = this.chat.getMessagesContainer();
  }
}

const app = new App();
app.init();

window.addEventListener('beforeunload', () => {
  if (app.wsClient && app.currentUser) {
    app.wsClient.exit(app.currentUser);
  }
});