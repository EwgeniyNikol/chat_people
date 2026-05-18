export default class Modal {
  constructor() {
    this.modal = null;
    this.input = null;
    this.button = null;
  }

  show() {
    return new Promise((resolve) => {
      this.createModal();
      this.button.onclick = () => {
        const nickname = this.input.value.trim();
        if (nickname) {
          this.modal.remove();
          resolve(nickname);
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
    
    container.append(title, this.input, this.button);
    this.modal.append(container);
    document.body.append(this.modal);
    this.input.focus();
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.textContent = message;
    errorDiv.className = 'error-message';
    this.modal.querySelector('.modal-container').append(errorDiv);
    setTimeout(() => errorDiv.remove(), 2000);
  }

  close() {
    if (this.modal) {
      this.modal.remove();
    }
  }
}