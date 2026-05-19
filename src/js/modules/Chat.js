export default class Chat {
  constructor(containerId, currentUser, wsClient) {
    this.container = document.getElementById(containerId);
    this.currentUser = currentUser;
    this.wsClient = wsClient;
    this.input = null;
    this.sendButton = null;
    this._sending = false;
  }

  setWsClient(wsClient) {
    this.wsClient = wsClient;
  }

  render() {
    this.container.innerHTML = '';

    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';

    const messagesArea = document.createElement('div');
    messagesArea.id = 'messages-area';
    messagesArea.className = 'messages-area';

    const inputArea = document.createElement('div');
    inputArea.className = 'input-area';

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Введите ваше сообщение...';
    this.input.className = 'chat-input';

    this.sendButton = document.createElement('button');
    this.sendButton.textContent = 'Отправить';
    this.sendButton.className = 'send-button';

    inputArea.append(this.input, this.sendButton);
    chatContainer.append(messagesArea, inputArea);
    this.container.append(chatContainer);

    this.sendButton.onclick = () => this.send();
    this.input.onkeypress = (e) => {
      if (e.key === 'Enter') this.send();
    };
  }

  send() {
    if (this._sending || !this.wsClient) return;

    const message = this.input.value.trim();
    if (message) {
      this._sending = true;
      this.sendButton.disabled = true;
      this.sendButton.textContent = 'Отправка...';

      this.wsClient.sendMessage(message, this.currentUser);
      this.input.value = '';

      setTimeout(() => {
        this._sending = false;
        this.sendButton.disabled = false;
        this.sendButton.textContent = 'Отправить';
      }, 500);
    }
  }

  getMessagesContainer() {
    return this.container.querySelector('#messages-area');
  }
}