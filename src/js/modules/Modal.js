export default class Modal {
  constructor() {
    this.modal = null;
    this.input = null;
    this.button = null;
    this.errorDiv = null;
    this.resolvePromise = null;
  }

  show() {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      if (!this.modal) {
        this.createModal();
      } else {
        this.modal.style.display = 'flex';
        this.input.value = '';
        if (this.errorDiv) this.errorDiv.textContent = '';
      }
      this.button.onclick = () => {
        const nickname = this.input.value.trim();
        if (nickname) {
          if (this.errorDiv) this.errorDiv.textContent = '';
          resolve(nickname);
        } else {
          this.showError('Пожалуйста, введите никнейм');
        }
      };
    });
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-overlay';
    
    const container = document.createElement('div');
    container.className = 'modal-container';
    
    const title = document.createElement('h2');
    title.textContent = 'Выберите псевдоним';
    
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Введите никнейм';
    
    this.button = document.createElement('button');
    this.button.textContent = 'Продолжить';
    
    this.errorDiv = document.createElement('div');
    this.errorDiv.className = 'error-message';
    this.errorDiv.style.cssText = 'color: red; font-size: 12px; margin-top: 10px;';
    
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.button.click();
      }
    });
    
    container.append(title, this.input, this.button, this.errorDiv);
    this.modal.append(container);
    document.body.append(this.modal);
    this.input.focus();
  }

  showError(message) {
    if (this.errorDiv) {
      this.errorDiv.textContent = message;
    }
  }

  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}