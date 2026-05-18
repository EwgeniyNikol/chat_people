import { format } from 'date-fns';

export default class MessageRenderer {
  constructor(containerId, currentUser) {
    this.container = document.getElementById(containerId);
    this.currentUser = currentUser;
  }

  renderMessage(messageData) {
    const { user, message, timestamp } = messageData;
    const isCurrentUser = user.id === this.currentUser.id;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isCurrentUser ? 'message-right' : 'message-left'}`;
    
    const nameSpan = document.createElement('div');
    nameSpan.className = 'message-name';
    nameSpan.textContent = isCurrentUser ? 'You' : user.name;
    
    const timeSpan = document.createElement('div');
    timeSpan.className = 'message-time';
    const date = timestamp ? new Date(timestamp) : new Date();
    timeSpan.textContent = format(date, 'HH:mm dd.MM.yyyy');
    
    const textSpan = document.createElement('div');
    textSpan.className = 'message-text';
    textSpan.textContent = message;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.append(nameSpan, timeSpan, textSpan);
    
    messageDiv.append(contentDiv);
    this.container.append(messageDiv);
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.container.scrollTop = this.container.scrollHeight;
  }

  clear() {
    this.container.innerHTML = '';
  }
}