import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';

export default class MessageRenderer {
  constructor(containerId, currentUser) {
    this.container = document.getElementById(containerId);
    this.currentUser = currentUser;
    this._lastKey = null;
  }

  renderMessage(messageData) {
    const { user, message, timestamp } = messageData;

    const key = `${user.id}-${timestamp}-${message}`;
    if (key === this._lastKey) return;
    this._lastKey = key;

    const isCurrentUser = user.id === this.currentUser.id;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isCurrentUser ? 'message-right' : 'message-left'}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'message-name';
    nameSpan.textContent = isCurrentUser ? 'You' : user.name;

    const timeSpan = document.createElement('div');
    timeSpan.className = 'message-time';
    const date = timestamp ? new Date(timestamp) : new Date();
    timeSpan.textContent = format(date, 'HH:mm dd.MM.yyyy', { locale: ru });

    const textSpan = document.createElement('div');
    textSpan.className = 'message-text';
    textSpan.textContent = message;

    contentDiv.append(nameSpan, timeSpan, textSpan);
    messageDiv.append(contentDiv);
    this.container.append(messageDiv);
    this.scrollToBottom();
  }

  showSystemMessage(message) {
    if (!this.container) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.style.cssText = 'max-width:100%;justify-content:center;align-self:center';

    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = 'background:#fff3cd;padding:8px 16px;border-radius:12px;font-size:13px;color:#856404;text-align:center';

    contentDiv.textContent = message;
    messageDiv.append(contentDiv);
    this.container.append(messageDiv);
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.container) {
      this.container.scrollTop = this.container.scrollHeight;
    }
  }

  clear() {
    if (this.container) {
      this.container.innerHTML = '';
      this._lastKey = null;
    }
  }
}