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
    this.modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;
    
    const container = document.createElement('div');
    container.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
      min-width: 300px;
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'Выберите псевдоним';
    
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Введите никнейм';
    this.input.style.cssText = `
      width: 100%;
      padding: 8px;
      margin: 15px 0;
      box-sizing: border-box;
    `;
    
    this.button = document.createElement('button');
    this.button.textContent = 'Продолжить';
    this.button.style.cssText = `
      padding: 8px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    
    container.append(title, this.input, this.button);
    this.modal.append(container);
    document.body.append(this.modal);
    this.input.focus();
  }

  showError(message) {
    let errorDiv = this.modal.querySelector('.error-message');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.style.cssText = 'color: red; font-size: 12px; margin-top: 10px;';
      this.modal.querySelector('div').append(errorDiv);
    }
    errorDiv.textContent = message;
  }

  close() {
    if (this.modal) {
      this.modal.remove();
    }
  }
}