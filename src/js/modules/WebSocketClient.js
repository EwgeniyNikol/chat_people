export default class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.onMessage = null;
    this.onUserList = null;
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
        const data = JSON.parse(event.data);
        
        if (Array.isArray(data)) {
          if (this.onUserList) this.onUserList(data);
        } else if (data.type === 'send') {
          if (this.onMessage) this.onMessage(data);
        }
      };
      
      this.ws.onclose = () => {
        console.log('Вебсокет отключён');
      };
    });
  }

  sendMessage(message, user) {
    const data = {
      type: 'send',
      message: message,
      user: user
    };
    this.ws.send(JSON.stringify(data));
  }

  exit(user) {
    const data = {
      type: 'exit',
      user: user
    };
    this.ws.send(JSON.stringify(data));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}