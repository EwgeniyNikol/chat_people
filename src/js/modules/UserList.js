export default class UserList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.onExit = null;
    this._exitButton = null;
  }

  render(users) {
    if (!this.container) return;

    this.container.innerHTML = '';

    const title = document.createElement('h3');
    title.textContent = 'Участники';
    title.className = 'users-title';
    this.container.append(title);

    if (!users || users.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.textContent = 'Нет участников';
      emptyMsg.style.cssText = 'color:#999;padding:10px;text-align:center';
      this.container.append(emptyMsg);
    } else {
      users.forEach(user => {
        if (user && typeof user.name === 'string') {
          const userDiv = document.createElement('div');
          userDiv.className = 'user-item';
          userDiv.textContent = user.name;
          this.container.append(userDiv);
        }
      });
    }

    this._exitButton = document.createElement('button');
    this._exitButton.textContent = 'Выйти';
    this._exitButton.style.cssText = 'width:100%;padding:8px;margin-top:20px;background:#dc3545;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px';
    this._exitButton.onclick = () => {
      if (this.onExit) this.onExit();
    };
    this.container.append(this._exitButton);
  }
}