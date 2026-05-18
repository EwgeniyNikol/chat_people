export default class Modal {
  constructor() {
    this.modal = null;
    this.input = null;
    this.button = null;
    this.errorDiv = null;
  }

  show() {
    return new Promise((resolve) => {
      this.createModal();
      this.button.onclick = async () => {
        const nickname = this.input.value.trim();
        if (!nickname) {
          this.showError('Пожалуйста, введите никнейм');
          return;
        }
        
        this.clearError();
        
        try {
          const response = await fetch('https://chat-people-backend-viyo.onrender.com/new-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nickname })
          });
          
          const data = await response.json();
          
          if (response.status === 409) {
            this.showError('Этот никнейм уже занят! Пожалуйста, введите другой.');
          } else if (data.status === 'ok') {
            this.close();
            resolve(data.user);
          } else {
            this.showError('Ошибка сервера');
          }
        } catch (err) {
          this.showError('Ошибка соединения с сервером');
        }
      };
      
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.button.click();
      });
    });
  }

  clearError() {
    if (this.errorDiv) {
      this.errorDiv.textContent = '';
      this.errorDiv.style.display = 'none';
    }
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-overlay';
    this.modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000';
    
    const container = document.createElement('div');
    container.className = 'modal-container';
    container.style.cssText = 'background:white;padding:30px;border-radius:8px;text-align:center;min-width:300px';
    
    const title = document.createElement('h2');
    title.textContent = 'Выберите псевдоним';
    
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Введите никнейм';
    this.input.style.cssText = 'width:100%;padding:8px;margin:15px 0;box-sizing:border-box';
    
    this.button = document.createElement('button');
    this.button.textContent = 'Продолжить';
    this.button.style.cssText = 'padding:8px 20px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer';
    
    this.errorDiv = document.createElement('div');
    this.errorDiv.className = 'error-message';
    this.errorDiv.style.cssText = 'color:red;font-size:12px;margin-top:10px;display:none';
    
    container.append(title, this.input, this.button, this.errorDiv);
    this.modal.append(container);
    document.body.append(this.modal);
    this.input.focus();
  }

  showError(message) {
    if (this.errorDiv) {
      this.errorDiv.textContent = message;
      this.errorDiv.style.display = 'block';
    }
  }

  close() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }
}