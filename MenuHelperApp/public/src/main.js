//public/src/main.js

//public/src/*.js
import './auth.js';
import './admin.js';
import './user.js';

//public/src/styles/
import './styles/main.css';

//public/images/icons/*.svg
import '../images/icons/add_dish_icon.svg';
import '../images/icons/calculate_purchases_icon.svg';
import '../images/icons/contact_icon.svg';
import '../images/icons/favicon.svg';
import '../images/icons/logo.svg';
import '../images/icons/order_icon.svg';
import '../images/icons/view_menu_icon.svg';

import { firebaseConfig } from "../../firebase-config.js";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { showCollectionButtons } from './admin.js';

// Инициализация Firebase
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const ICON1_ID = 'icon1';
const ICON2_ID = 'icon2';
const ICON3_ID = 'icon3';
const ICON4_ID = 'icon4';
const ICON5_ID = 'icon5';

let GRID_SIZE;
let ICON_MARGIN;
const MARGIN_LEFT = 50; 
const MARGIN_TOP = 100;
const ICON_SIZE = 120;
let resizeTimeout; // Таймаут для дебаунсинга

// Функция для динамического обновления значений GRID_SIZE и MARGIN в зависимости от ширины контейнера
function updateGridAndMargins() {
    const dropzone = document.getElementById('admin-dashboard-container');
    const containerWidth = dropzone.offsetWidth;

    // Рассчитываем ICON_MARGIN как 1% от ширины контейнера и GRID_SIZE как сумма размера иконки и отступа
    ICON_MARGIN = containerWidth * 0.01; // 1% от ширины контейнера
    const GRID_SIZE = ICON_SIZE + ICON_MARGIN;   // Размер сетки: размер иконки + отступ

    // Обновляем размер сетки в CSS
    dropzone.style.setProperty('--grid-size', `${GRID_SIZE}px`);

    console.log(`GRID_SIZE: ${GRID_SIZE}, ICON_MARGIN: ${ICON_MARGIN}`);
}

// Функция для инициализации сетки и отслеживания изменения размера экрана
function initializeGrid() {
    // Обновляем сетку при загрузке страницы
    updateGridAndMargins();

    // Добавляем обработчик изменения размера окна с таймаутом (дебаунсинг)
    window.addEventListener('resize', () => {
        // Если таймер уже запущен, сбрасываем его
        clearTimeout(resizeTimeout);

        // Устанавливаем новый таймаут для пересчета через 200ms после завершения изменения размера окна
        resizeTimeout = setTimeout(() => {
            updateGridAndMargins();
        }, 200);
    });
}

function snapToGrid(x, y) {
    if (isNaN(x) || isNaN(y)) {
        console.error(`Invalid coordinates: x: ${x}, y: ${y}`);
        return { left: NaN, top: NaN }; // Возвращаем NaN, если входные значения некорректны
    }

    const left = Math.round((x - MARGIN_LEFT) / GRID_SIZE) * GRID_SIZE + MARGIN_LEFT;
    const top = Math.round((y - MARGIN_TOP) / GRID_SIZE) * GRID_SIZE + MARGIN_TOP;

    console.log(`Snapping to grid: original x: ${x}, y: ${y} -> snapped left: ${left}, top: ${top}`);
    
    return { left, top };
}

// Утилитарная функция для проверки занятости позиции
function isPositionFree(left, top, currentIconId) {
    const icons = document.querySelectorAll('.icon-container');
    for (const icon of icons) {
        if (icon.id !== currentIconId) {
            const iconLeft = parseFloat(icon.style.left);
            const iconTop = parseFloat(icon.style.top);
            if (iconLeft === left && iconTop === top) {
                return false;
            }
        }
    }
    return true;
}

// Утилитарная функция для сохранения позиций иконок
export function saveIconPositions() {
    const iconContainers = document.querySelectorAll('.icon-container');
    const positions = Array.from(iconContainers).map(icon => ({
        id: icon.id,
        left: icon.style.left,
        top: icon.style.top
    }));
    localStorage.setItem('iconPositions', JSON.stringify(positions));
}

// Функция для установки позиции иконки с привязкой к сетке
function setIconPosition(icon, x, y) {
    const dropzone = document.getElementById('admin-dashboard-container');

    // Проверка значений x и y перед привязкой к сетке
    if (isNaN(x) || isNaN(y)) {
        console.error(`Invalid coordinates: x: ${x}, y: ${y}`);
        return;
    }

    // Привязка к сетке с использованием обновленных значений
    const { left, top } = snapToGrid(x, y);

    // Логирование значений после привязки
    console.log(`Snapped Position: left: ${left}, top: ${top}`);

    // Ограничение по краям контейнера
    const clampedLeft = Math.max(MARGIN_LEFT, Math.min(left, dropzone.offsetWidth - icon.offsetWidth - MARGIN_LEFT));
    const clampedTop = Math.max(MARGIN_TOP, Math.min(top, dropzone.offsetHeight - icon.offsetHeight - MARGIN_TOP));

    console.log(`Calculated Position: left: ${left}, top: ${top}, Clamped Position: left: ${clampedLeft}, top: ${clampedTop}`);

    // Проверка занятости позиции и установка или возврат на исходную позицию
    if (isPositionFree(clampedLeft, clampedTop, icon.id)) {
        icon.style.left = `${clampedLeft}px`;
        icon.style.top = `${clampedTop}px`;
        console.log(`Position set for ${icon.id}: left: ${clampedLeft}, top: ${clampedTop}`);
    } else {
        icon.style.left = `${icon.dataset.originalLeft}px`;
        icon.style.top = `${icon.dataset.originalTop}px`;
        console.log(`Position occupied for ${icon.id}, reverting to original position.`);
    }
}

// Загрузка позиций иконок из локального хранилища
export function loadIconPositions() {
    const positions = JSON.parse(localStorage.getItem("iconPositions"));
    if (positions) {
        const dropzone = document.getElementById("admin-dashboard-container");
        updateGridAndMargins(); // Убедитесь, что сетка и отступы обновлены перед загрузкой

        positions.forEach((pos) => {
            const icon = document.getElementById(pos.id);
            if (icon) {
                // Перерасчет позиций иконок относительно новой сетки и контейнера
                const left = parseFloat(pos.left);
                const top = parseFloat(pos.top);

                // Привязка позиции к новой сетке и отступам
                const { left: snappedLeft, top: snappedTop } = snapToGrid(left, top);

                // Ограничение по краям контейнера
                const clampedLeft = Math.max(
                    MARGIN_LEFT,
                    Math.min(snappedLeft, dropzone.offsetWidth - icon.offsetWidth - MARGIN_LEFT)
                );
                const clampedTop = Math.max(
                    MARGIN_TOP,
                    Math.min(snappedTop, dropzone.offsetHeight - icon.offsetHeight - MARGIN_TOP)
                );

                // Установка позиции иконки
                icon.style.left = `${clampedLeft}px`;
                icon.style.top = `${clampedTop}px`;
            }
        });
    }
}

// Инициализация перетаскивания иконок
export function initializeDragAndDrop() {
    const iconContainers = document.querySelectorAll('.icon-container');

    // Инициализация события перетаскивания
    iconContainers.forEach(icon => {
        icon.addEventListener('dragstart', handleDragStart);
        icon.addEventListener('dragend', handleDragEnd);
    });

    const dashboardContainer = document.getElementById('admin-dashboard-container');
    dashboardContainer.addEventListener('dragover', handleDragOver);
    dashboardContainer.addEventListener('drop', handleDrop);

    // Обработчик изменения размера окна
    window.addEventListener('resize', handleResize);

    // Инициализируем размеры сетки и отступов при загрузке
    updateGridAndMargins();
}

// Обработчики для перетаскивания с мышью
function handleDragStart(event) {
    event.currentTarget.classList.add('dragging');
    event.dataTransfer.setData('text/plain', event.currentTarget.id);
}

function handleDragEnd(event) {
    event.currentTarget.classList.remove('dragging');
    console.log(`Dropped ${event.currentTarget.id}`); // Логирование
}

function handleDragOver(event) {
    event.preventDefault();
    console.log('Drag over dropzone'); // Логирование
}

// Функция для обработки события drop
function handleDrop(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    const draggableElement = document.getElementById(id);
    const dropzone = document.getElementById('admin-dashboard-container');

    // Рассчитываем координаты относительно контейнера
    const offsetX = event.clientX - dropzone.getBoundingClientRect().left;
    const offsetY = event.clientY - dropzone.getBoundingClientRect().top;

    // Ограничение перемещения иконок внутри видимой области контейнера
    const left = Math.max(0, Math.min(offsetX - (draggableElement.offsetWidth / 2), dropzone.offsetWidth - draggableElement.offsetWidth));
    const top = Math.max(0, Math.min(offsetY - (draggableElement.offsetHeight / 2), dropzone.offsetHeight - draggableElement.offsetHeight));

    draggableElement.style.left = `${left}px`;
    draggableElement.style.top = `${top}px`;

    saveIconPositions();
}

// Обработчик изменения размера окна
function handleResize() {
    updateGridAndMargins();

    // Обновляем позиции всех иконок с новой сеткой
    const iconContainers = document.querySelectorAll('.icon-container');
    iconContainers.forEach(icon => {
        const left = parseFloat(icon.style.left);
        const top = parseFloat(icon.style.top);
        const { left: snappedLeft, top: snappedTop } = snapToGrid(left, top);
        setIconPosition(icon, snappedLeft, snappedTop);
    });
}

// Функция для обработки двойного клика и касаний на иконках
export function addIconEventListeners() {
    document.getElementById(ICON1_ID).addEventListener('dblclick', showDishForm);
    document.getElementById(ICON2_ID).addEventListener('dblclick', showMenu);
    document.getElementById(ICON3_ID).addEventListener('dblclick', showPurchaseCalculationForm);
    document.getElementById(ICON4_ID).addEventListener('dblclick', showOrderForm);
    document.getElementById(ICON5_ID).addEventListener('dblclick', showCollectionButtons);

    document.getElementById(ICON1_ID).addEventListener('touchend', handleTouchEnd);
    document.getElementById(ICON2_ID).addEventListener('touchend', handleTouchEnd);
    document.getElementById(ICON3_ID).addEventListener('touchend', handleTouchEnd);
    document.getElementById(ICON4_ID).addEventListener('touchend', handleTouchEnd);
    document.getElementById(ICON5_ID).addEventListener('touchend', handleTouchEnd);
}

function handleTouchEnd(event) {
    const id = event.currentTarget.id;
    setTimeout(() => {
        switch (id) {
            case ICON1_ID:
                showDishForm();
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
            case ICON5_ID:
                showCollectionButtons();
                break;
        }
    }, 200);
}

let startY = 0;
let startX = 0;

// Функция для обработки начала касания (для жестов)
function handleTouchStart(event) {
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
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
    event.stopPropagation();
    console.log('Swipe up detected - closing modal');
    hideWelcomeModal();
}

// Получение "названия" пользователя из базы Firestore
export async function getLoggersName(uid) {
    try {
        // Проверяем, что 'doc' и 'getDoc' импортированы
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return userDoc.data().loggersName;
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error fetching loggersName:', error);
        return null;
    }
}

// Показ приветственного модального окна с "названием" пользователя
export function showWelcomeModal(loggersName) {
    const modal = document.getElementById('welcome-modal');
    const welcomeMessage = document.getElementById('welcome-message');
    const closeButton = document.getElementById('close-button');

    if (modal && welcomeMessage && closeButton) {
        const displayName = loggersName || 'Гость'; // Используем loggersName или 'Гость'

        welcomeMessage.textContent = `Добро пожаловать, ${displayName}!`;

        modal.classList.remove('hidden');

        closeButton.addEventListener('click', hideWelcomeModal);

        // Закрываем модальное окно через 3 секунды
        setTimeout(hideWelcomeModal, 3000);
    } else {
        console.error('One or more elements not found in the DOM.');
    }
}

// Скрытие приветственного модального окна
function hideWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (modal) {
        modal.classList.add('hidden');  // Hide modal

        // Убираем обработчики касания после закрытия модального окна
        modal.removeEventListener('touchstart', handleTouchStart);
        modal.removeEventListener('touchend', handleTouchEndGesture);

        // Убираем обработчик клика с кнопки закрытия
        const closeButton = document.getElementById('close-button');
        closeButton.removeEventListener('click', hideWelcomeModal);

    } else {
        console.error('Modal element not found in the DOM.');
    }
}
