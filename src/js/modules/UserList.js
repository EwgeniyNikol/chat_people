export default class UserList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(users) {
    this.container.innerHTML = '';
    
    const title = document.createElement('h3');
    title.textContent = 'Участники';
    title.className = 'users-title';
    this.container.append(title);
    
    users.forEach(user => {
      const userDiv = document.createElement('div');
      userDiv.className = 'user-item';
      userDiv.textContent = user.name;
      this.container.append(userDiv);
    });
  }
}