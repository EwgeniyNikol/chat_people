export default class Modal {
  constructor() {
    this.modal = null;
    this.input = null;
    this.button = null;
    this.resolve = null;
    this._onClick = null;
    this._onEnter = null;
    this._onEscape = null;
  }

  open() {
    return new Promise((resolve) => {
      if (this._onClick) {
        this.button.removeEventListener('click', this._onClick);
      }
      if (this._onEnter) {
        this.input.removeEventListener('keypress', this._onEnter);
      }

      this.resolve = resolve;
      if (!this.modal) {
        this.createModal();
      }
      this.input.value = '';
      this.modal.style.display = 'flex';
      this.input.focus();

      this._onClick = () => {
        const nickname = this.input.value.trim();
        if (nickname) {
          this.button.removeEventListener('click', this._onClick);
          this.input.removeEventListener('keypress', this._onEnter);
          document.removeEventListener('keydown', this._onEscape);
          resolve(nickname);
        } else {
          this.setError('Пожалуйста, введите никнейм');
        }
      };

      this._onEnter = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this._onClick();
        }
      };

      this._onEscape = (e) => {
        if (e.key === 'Escape') {
          this.close();
          resolve('');
        }
      };

      this.button.addEventListener('click', this._onClick);
      this.input.addEventListener('keypress', this._onEnter);
      document.addEventListener('keydown', this._onEscape);
    });
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000';

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
        if (this.resolve) this.resolve('');
      }
    });

    const container = document.createElement('div');
    container.style.cssText = 'background:white;padding:30px;border-radius:8px;text-align:center;min-width:300px;position:relative';

    const title = document.createElement('h2');
    title.textContent = 'Выберите псевдоним';

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Введите никнейм';
    this.input.style.cssText = 'width:100%;padding:8px;margin:15px 0;box-sizing:border-box;border:1px solid #ccc;border-radius:4px';

    this.button = document.createElement('button');
    this.button.textContent = 'Продолжить';
    this.button.style.cssText = 'padding:8px 20px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer';

    this.errorDiv = document.createElement('div');
    this.errorDiv.className = 'error-message';
    this.errorDiv.style.cssText = 'color:red;font-size:12px;margin-top:10px;display:none';

    container.append(title, this.input, this.button, this.errorDiv);
    this.modal.append(container);
    document.body.append(this.modal);
  }

  setError(message) {
    const errorDiv = this.modal ? this.modal.querySelector('.error-message') : null;
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      clearTimeout(this._errorTimeout);
      this._errorTimeout = setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 3000);
    }
  }

  clearError() {
    clearTimeout(this._errorTimeout);
    const errorDiv = this.modal ? this.modal.querySelector('.error-message') : null;
    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.style.display = 'none';
    }
  }

  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
      this.clearError();
      document.removeEventListener('keydown', this._onEscape);
      if (this._onClick) {
        this.button.removeEventListener('click', this._onClick);
      }
      if (this._onEnter) {
        this.input.removeEventListener('keypress', this._onEnter);
      }
      this.resolve = null;
    }
  }
}