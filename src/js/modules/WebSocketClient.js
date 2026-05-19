export default class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.onMessage = null;
    this.onUserList = null;
    this.onSystemMessage = null;
    this.onClose = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('Вебсокет подключён');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('Ошибка вебсокета:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (Array.isArray(data)) {
            if (this.onUserList) this.onUserList(data);
          } else if (data.type === 'send') {
            if (this.onMessage) this.onMessage(data);
          } else if (data.type === 'system' || data.type === 'error') {
            if (this.onSystemMessage) this.onSystemMessage(data);
          }
        } catch (e) {
          console.error('Ошибка парсинга сообщения:', e);
        }
      };

      this.ws.onclose = (event) => {
        console.log('Вебсокет отключён');
        if (this.onClose) this.onClose(event);
      };
    });
  }

  sendMessage(message, user) {
    const data = {
      type: 'send',
      message: message,
      user: { id: user.id, name: user.name },
      timestamp: Date.now()
    };
    this.ws.send(JSON.stringify(data));
  }

  exit(user) {
    const data = {
      type: 'exit',
      user: { id: user.id, name: user.name }
    };
    this.ws.send(JSON.stringify(data));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}