export default class UserList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
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
      return;
    }
    
    users.forEach(user => {
      if (user && typeof user.name === 'string') {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';
        userDiv.textContent = user.name;
        this.container.append(userDiv);
      }
    });
  }
}