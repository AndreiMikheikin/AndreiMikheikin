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

// Загрузка позиций иконок из локального хранилища
export function loadIconPositions() {
    const positions = JSON.parse(localStorage.getItem('iconPositions'));
    if (positions) {
        const dropzone = document.getElementById('admin-dashboard-content');
        positions.forEach(pos => {
            const icon = document.getElementById(pos.id);
            if (icon) {
                // Пропорциональная адаптация
                const left = parseFloat(pos.left) * (dropzone.offsetWidth / window.innerWidth);
                const top = parseFloat(pos.top) * (dropzone.offsetHeight / window.innerHeight);
                
                icon.style.left = `${left}px`;
                icon.style.top = `${top}px`;
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

// Инициализация перетаскивания и загрузка позиций после загрузки страницы
window.addEventListener('load', () => {
    initializeDragAndDrop();
    loadIconPositions();
    window.addEventListener('beforeunload', saveIconPositions);
});

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
