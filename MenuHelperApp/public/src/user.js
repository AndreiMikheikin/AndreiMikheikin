document.addEventListener('DOMContentLoaded', () => {
    const userContainer = document.createElement('div');
    userContainer.innerHTML = '<h2>Пользовательская панель</h2><p>Добро пожаловать, пользователь!</p>';
    document.body.appendChild(userContainer);
});
