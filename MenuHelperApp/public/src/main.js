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

// Константы
const ICON_IDS = ['icon1', 'icon2', 'icon3', 'icon4', 'icon5'];
const GRID_SIZE = 150; // шаг сетки по X и Y
const ICON_MARGIN = 50; // отступ слева
const TOP_MARGIN = 100; // отступ сверху

// Массив для хранения пересечений сетки
let grid = [];
let icons = [];
const dropzone = document.getElementById('admin-dashboard-container');

// Инициализация сетки
export function initializeGrid(containerWidth, containerHeight) {
    grid = [];
    const cols = Math.floor((containerWidth - ICON_MARGIN) / GRID_SIZE);
    const rows = Math.floor((containerHeight - TOP_MARGIN) / GRID_SIZE);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            grid.push({
                index: `${row}:${col}`,
                occupied: 0, // Ячейка свободна
                x: col * GRID_SIZE + ICON_MARGIN,
                y: row * GRID_SIZE + TOP_MARGIN
            });
        }
    }
}

// Установка позиции иконки
function positionIcon(icon, x, y) {
    icon.style.left = `${x}px`;
    icon.style.top = `${y}px`;
    icon.style.position = 'absolute'; // Установка абсолютного позиционирования
}

// Привязка иконок к сетке
function snapIconsToGrid() {
    icons.forEach(icon => {
        const freeCell = grid.find(cell => cell.occupied === 0);
        if (freeCell) {
            freeCell.occupied = 1; // Занимаем ячейку
            positionIcon(icon, freeCell.x, freeCell.y); // Устанавливаем позицию иконки
        }
    });
}

// Обработка изменения размера окна и пересчет сетки
export function handleResize() {
    const containerWidth = dropzone.clientWidth;
    const containerHeight = dropzone.clientHeight;

    // Пересчитываем сетку
    initializeGrid(containerWidth, containerHeight);

    // Привязываем иконки заново
    snapIconsToGrid();
}

// Сохранение позиций иконок в LocalStorage
export function saveIconPositions() {
    const iconPositions = icons.map(icon => {
        return {
            id: icon.id,
            left: parseFloat(icon.style.left),
            top: parseFloat(icon.style.top)
        };
    });

    localStorage.setItem('iconPositions', JSON.stringify(iconPositions));
}

// Загрузка позиций иконок из LocalStorage
export function loadIconPositions() {
    const savedPositions = JSON.parse(localStorage.getItem('iconPositions'));

    if (savedPositions) {
        savedPositions.forEach(pos => {
            const icon = document.getElementById(pos.id);
            if (icon) {
                positionIcon(icon, pos.left, pos.top);
                // Обновляем сетку, помечаем ячейку как занятую
                const closestCell = findNearestGridCell(pos.left, pos.top);
                if (closestCell) {
                    closestCell.occupied = 1;
                }
            }
        });
    }
}

// Поиск ближайшей ячейки сетки
function findNearestGridCell(x, y) {
    return grid.reduce((prev, curr) => {
        const prevDist = Math.hypot(x - prev.x, y - prev.y);
        const currDist = Math.hypot(x - curr.x, y - curr.y);
        return currDist < prevDist ? curr : prev;
    });
}

// Инициализация
export function initializeIconsAndGrid() {
    const containerWidth = dropzone.clientWidth;
    const containerHeight = dropzone.clientHeight;

    // Инициализация сетки
    initializeGrid(containerWidth, containerHeight);

    // Найти все иконки в контейнере
    icons = ICON_IDS.map(id => document.getElementById(id));

    // Привязка иконок к сетке
    snapIconsToGrid();

    // Пересчет сетки при изменении размеров окна
    window.addEventListener('resize', handleResize);
}

// Функция для обработки двойного клика и касаний на иконках
export function addIconEventListeners() {
    document.getElementById(ICON_IDS[0]).addEventListener('dblclick', showDishForm);
    document.getElementById(ICON_IDS[1]).addEventListener('dblclick', showMenu);
    document.getElementById(ICON_IDS[2]).addEventListener('dblclick', showPurchaseCalculationForm);
    document.getElementById(ICON_IDS[3]).addEventListener('dblclick', showOrderForm);
    document.getElementById(ICON_IDS[4]).addEventListener('dblclick', showCollectionButtons);

    ICON_IDS.forEach(id => {
        document.getElementById(id).addEventListener('touchend', handleTouchEnd);
    });
}

function handleTouchEnd(event) {
    const id = event.currentTarget.id;
    setTimeout(() => {
        switch (id) {
            case ICON_IDS[0]:
                showDishForm();
                break;
            case ICON_IDS[1]:
                showMenu();
                break;
            case ICON_IDS[2]:
                showPurchaseCalculationForm();
                break;
            case ICON_IDS[3]:
                showOrderForm();
                break;
            case ICON_IDS[4]:
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
