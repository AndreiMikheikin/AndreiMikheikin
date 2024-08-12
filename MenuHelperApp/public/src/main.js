// Сохранение позиций иконок в локальное хранилище
export function saveIconPositions() {
    const iconContainers = document.querySelectorAll('.icon-container');
    const positions = Array.from(iconContainers).map(icon => ({
        id: icon.id,
        left: icon.style.left,
        top: icon.style.top
    }));
    localStorage.setItem('iconPositions', JSON.stringify(positions));
}

// Загрузка позиций иконок из локального хранилища
export function loadIconPositions() {
    const positions = JSON.parse(localStorage.getItem('iconPositions'));
    if (positions) {
        positions.forEach(pos => {
            const icon = document.getElementById(pos.id);
            if (icon) {
                icon.style.left = pos.left;
                icon.style.top = pos.top;
            }
        });
    }
}

// Инициализация перетаскивания иконок
export function initializeDragAndDrop() {
    const iconContainers = document.querySelectorAll('.icon-container');

    iconContainers.forEach(icon => {
        icon.addEventListener('dragstart', handleDragStart);
        icon.addEventListener('dragend', handleDragEnd);

        // Поддержка сенсорных устройств
        icon.addEventListener('touchstart', handleTouchStart);
        icon.addEventListener('touchmove', handleTouchMove);
        icon.addEventListener('touchend', handleTouchEnd);
    });

    document.getElementById('admin-dashboard-content').addEventListener('dragover', handleDragOver);
    document.getElementById('admin-dashboard-content').addEventListener('drop', handleDrop);

    // Для сенсорных устройств
    document.getElementById('admin-dashboard-content').addEventListener('touchmove', handleTouchMove);
    document.getElementById('admin-dashboard-content').addEventListener('touchend', handleTouchEnd);
}

// Обработчики для перетаскивания с мышью
function handleDragStart(event) {
    event.currentTarget.classList.add('dragging');
    event.dataTransfer.setData('text/plain', event.currentTarget.id);
}

function handleDragEnd(event) {
    event.currentTarget.classList.remove('dragging');
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    const draggableElement = document.getElementById(id);
    const dropzone = event.target;
    
    const offsetX = event.clientX - dropzone.getBoundingClientRect().left;
    const offsetY = event.clientY - dropzone.getBoundingClientRect().top;
    
    draggableElement.style.left = `${offsetX - (draggableElement.offsetWidth / 2)}px`;
    draggableElement.style.top = `${offsetY - (draggableElement.offsetHeight / 2)}px`;

    saveIconPositions();
}

// Обработчики для сенсорных устройств
function handleTouchStart(event) {
    const icon = event.currentTarget;
    icon.classList.add('dragging');
    const touch = event.touches[0];
    icon.dataset.touchX = touch.clientX;
    icon.dataset.touchY = touch.clientY;
}

function handleTouchMove(event) {
    event.preventDefault(); // Предотвращает скроллинг страницы
    const icon = event.currentTarget;
    const touch = event.touches[0];
    
    const offsetX = touch.clientX - icon.dataset.touchX;
    const offsetY = touch.clientY - icon.dataset.touchY;

    icon.style.left = `${icon.offsetLeft + offsetX}px`;
    icon.style.top = `${icon.offsetTop + offsetY}px`;

    icon.dataset.touchX = touch.clientX;
    icon.dataset.touchY = touch.clientY;
}

function handleTouchEnd(event) {
    const icon = event.currentTarget;
    icon.classList.remove('dragging');
    saveIconPositions();
}

// Инициализация перетаскивания и загрузка позиций после загрузки страницы
window.addEventListener('load', () => {
    initializeDragAndDrop();
    loadIconPositions();
    window.addEventListener('beforeunload', saveIconPositions);
});


// Показ приветственного модального окна
export function showWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    modal.style.display = 'block';
}

// Скрытие приветственного модального окна
export function hideWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    modal.style.display = 'none';
    showAdminDashboard(); // Показать панель администратора после скрытия модального окна
}
