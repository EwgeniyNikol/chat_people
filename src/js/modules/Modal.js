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
      this.button.onclick = () => {
        const nickname = this.input.value.trim();
        if (nickname) {
          this.clearError();
          resolve(nickname);
        } else {
          this.showError('Пожалуйста, введите никнейм');
        }
      };
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.button.click();
        }
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
    this.errorDiv.style.display = 'none';
    
    container.append(title, this.input, this.button, this.errorDiv);
    this.modal.append(container);
    document.body.append(this.modal);
    this.input.focus();
  }

  showError(message) {
    if (this.errorDiv) {
      this.errorDiv.textContent = message;
      this.errorDiv.style.display = 'block';
      setTimeout(() => {
        if (this.errorDiv) {
          this.errorDiv.style.display = 'none';
        }
      }, 3000);
    }
  }

  close() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }
}