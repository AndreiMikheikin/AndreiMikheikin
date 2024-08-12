import { loadAdminDashboard } from './admin.js';

const ICON1_ID = 'icon1';
const ICON2_ID = 'icon2';
const ICON3_ID = 'icon3';
const ICON4_ID = 'icon4';

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

// Инициализация перетаскивания иконок
export function initializeDragAndDrop() {
    const iconContainers = document.querySelectorAll('.icon-container');

    iconContainers.forEach(icon => {
        icon.addEventListener('dragstart', handleDragStart);
        icon.addEventListener('dragend', handleDragEnd);
    });

    document.getElementById('admin-dashboard-content').addEventListener('dragover', handleDragOver);
    document.getElementById('admin-dashboard-content').addEventListener('drop', handleDrop);
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
    const dropzone = document.getElementById('admin-dashboard-content');
    
    // Корректировка координат с учетом позиции внутри контейнера
    const offsetX = event.clientX - dropzone.getBoundingClientRect().left;
    const offsetY = event.clientY - dropzone.getBoundingClientRect().top;

    // Ограничение перемещения иконок внутри видимой области контейнера
    const left = Math.max(0, Math.min(offsetX - (draggableElement.offsetWidth / 2), dropzone.offsetWidth - draggableElement.offsetWidth));
    const top = Math.max(0, Math.min(offsetY - (draggableElement.offsetHeight / 2), dropzone.offsetHeight - draggableElement.offsetHeight));

    draggableElement.style.left = `${left}px`;
    draggableElement.style.top = `${top}px`;

    saveIconPositions();
}

// Функция для обработки двойного клика и касаний на иконках
export function addIconEventListeners() {
    document.getElementById(ICON1_ID).addEventListener('dblclick', showAddDishForm);
    document.getElementById(ICON2_ID).addEventListener('dblclick', showMenu);
    document.getElementById(ICON3_ID).addEventListener('dblclick', showPurchaseCalculationForm);
    document.getElementById(ICON4_ID).addEventListener('dblclick', showOrderForm);

    document.getElementById(ICON1_ID).addEventListener('touchend', handleTouchEnd);
    document.getElementById(ICON2_ID).addEventListener('touchend', handleTouchEnd);
    document.getElementById(ICON3_ID).addEventListener('touchend', handleTouchEnd);
    document.getElementById(ICON4_ID).addEventListener('touchend', handleTouchEnd);
}

function handleTouchEnd(event) {
    const id = event.currentTarget.id;
    setTimeout(() => {
        switch(id) {
            case ICON1_ID:
                showAddDishForm();
                break;
            case ICON2_ID:
                showMenu();
                break;
            case ICON3_ID:
                showPurchaseCalculationForm();
                break;
            case ICON4_ID:
                showOrderForm();
                break;
        }
    }, 200);
}

let startY = 0; // Начальная позиция по оси Y

// Показ приветственного модального окна с логином пользователя
export function showWelcomeModal(username) {
    const modal = document.getElementById('welcome-modal');
    
    // Извлечение логина без доменной зоны
    const displayName = username.split('@')[0];
    
    // Вставка имени в сообщение
    const welcomeMessage = document.getElementById('welcome-message');
    welcomeMessage.textContent = `Добро пожаловать, ${displayName}!`;
    
    modal.style.display = 'block';

    // Добавляем обработчики касания для swipe up
    modal.addEventListener('touchstart', handleTouchStart);
    modal.addEventListener('touchend', handleTouchEndGesture);

    // Добавляем обработчик клика на кнопку закрытия
    const closeButton = document.getElementById('close-button');
    closeButton.addEventListener('click', hideWelcomeModal);
}

// Скрытие приветственного модального окна
function hideWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    modal.style.display = 'none';

    // Убираем обработчики касания после закрытия модального окна
    modal.removeEventListener('touchstart', handleTouchStart);
    modal.removeEventListener('touchend', handleTouchEndGesture);

    // Убираем обработчик клика с кнопки закрытия
    const closeButton = document.getElementById('close-button');
    closeButton.removeEventListener('click', hideWelcomeModal);

    showAdminDashboard(); // Показать панель администратора после скрытия модального окна
}

// Показ панели администратора
function showAdminDashboard() {
    const adminContainer = document.getElementById('admin-dashboard-container');
    adminContainer.style.display = 'block';
    loadAdminDashboard(); // Вызов функции напрямую
}

// Функция для обработки начала касания (для жестов)
function handleTouchStart(event) {
    const touch = event.touches[0];
    startX = touch.clientX; // Сохранение начальной позиции X
    startY = touch.clientY; // Сохранение начальной позиции Y
}

// Функция для обработки конца касания (для жестов)
function handleTouchEndGesture(event) {
    const touch = event.changedTouches[0];
    const deltaY = touch.clientY - startY;

    // Обработка свайпа вверх (закрытие модального окна)
    if (Math.abs(deltaY) > 50 && deltaY < 0) {
        handleSwipeUp(event);
    }
}

// Функция для обработки свайпа вверх
function handleSwipeUp(event) {
    event.stopPropagation(); // Остановка распространения события на родительские элементы
    console.log('Swipe up detected - closing modal');
    hideWelcomeModal();
}
