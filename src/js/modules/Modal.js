export default class Modal {
  constructor() {
    this.modal = null;
    this.input = null;
    this.button = null;
    this.resolvePromise = null;
  }

  show() {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.createModal();
      this.button.onclick = () => {
        const nickname = this.input.value.trim();
        if (nickname) {
          this.resolvePromise(nickname);
          this.clearError();
          this.input.value = '';
        }
      };
    });
  }

  clearError() {
    const existingError = this.modal.querySelector('.error-message');
    if (existingError) existingError.remove();
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
    
    container.append(title, this.input, this.button);
    this.modal.append(container);
    document.body.append(this.modal);
    this.input.focus();
  }

  showError(message) {
    this.clearError();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    const container = this.modal.querySelector('.modal-container');
    if (container) {
      container.append(errorDiv);
    }
  }

  close() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }
}