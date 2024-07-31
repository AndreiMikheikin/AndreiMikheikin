import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAjJIU3lCSJivMJ9UbihXD1dqu8ivf-8OU",
    authDomain: "menuhelperapp.firebaseapp.com",
    projectId: "menuhelperapp",
    storageBucket: "menuhelperapp.appspot.com",
    messagingSenderId: "118002716868",
    appId: "1:118002716868:web:2623db6910ab0771c87991"
};

// Инициализация Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Загрузка панели администратора
function loadAdminDashboard() {
    const adminContent = document.getElementById('admin-dashboard-content');
    adminContent.innerHTML = `
        <div class="icon-container" onclick="showAddDishForm()">
            <img src="path/to/add_dish_icon.png" alt="Добавить блюдо">
            <p>Добавить блюдо</p>
        </div>
        <div class="icon-container" onclick="showMenu()">
            <img src="path/to/view_menu_icon.png" alt="Просмотр меню">
            <p>Просмотр меню</p>
        </div>
        <div class="icon-container" onclick="calculatePurchases()">
            <img src="path/to/calculate_purchases_icon.png" alt="Подсчет закупок">
            <p>Подсчет закупок</p>
        </div>
    `;
}

// Показ формы добавления блюда
window.showAddDishForm = function showAddDishForm() {
    const adminContent = document.getElementById('admin-dashboard-content');
    adminContent.innerHTML = `
        <h3>Добавить блюдо</h3>
        <form id="add-dish-form" onsubmit="handleAddDish(event)">
            <input type="text" id="dish-name" name="dish-name" placeholder="Название блюда" required>
            <textarea id="dish-description" name="dish-description" placeholder="Описание блюда" required></textarea>
            <input type="number" id="dish-price" name="dish-price" placeholder="Цена" required>
            <button type="submit">Добавить</button>
        </form>
    `;
}

// Обработка добавления блюда
window.handleAddDish = async function handleAddDish(event) {
    event.preventDefault();
    const name = document.getElementById('dish-name').value;
    const description = document.getElementById('dish-description').value;
    const price = document.getElementById('dish-price').value;

    try {
        await addDoc(collection(db, 'menu'), { name, description, price });
        alert('Блюдо добавлено');
        loadAdminDashboard();
    } catch (error) {
        alert(`Ошибка при добавлении блюда: ${error.message}`);
    }
}

// Показ меню
window.showMenu = async function showMenu() {
    const adminContent = document.getElementById('admin-dashboard-content');
    adminContent.innerHTML = `<h3>Меню</h3><div id="menu-list">Загрузка...</div>`;

    try {
        const querySnapshot = await getDocs(collection(db, 'menu'));
        const menuList = document.getElementById('menu-list');
        menuList.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const dish = doc.data();
            const dishDiv = document.createElement('div');
            dishDiv.classList.add('dish');
            dishDiv.innerHTML = `
                <p><strong>${dish.name}</strong></p>
                <p>${dish.description}</p>
                <p>Цена: ${dish.price} руб.</p>
            `;
            menuList.appendChild(dishDiv);
        });
    } catch (error) {
        alert(`Ошибка при загрузке меню: ${error.message}`);
    }
}

// Подсчет закупок
window.calculatePurchases = function calculatePurchases() {
    const adminContent = document.getElementById('admin-dashboard-content');
    adminContent.innerHTML = `
        <h3>Подсчет закупок</h3>
        <form id="calculate-purchases-form" onsubmit="handleCalculatePurchases(event)">
            <select id="dish-select" name="dish-select" multiple required></select>
            <button type="submit">Подсчитать</button>
        </form>
        <div id="purchase-result"></div>
    `;

    loadDishesIntoSelect();
}

// Загрузка блюд в select элемент
window.loadDishesIntoSelect = async function loadDishesIntoSelect() {
    const dishSelect = document.getElementById('dish-select');
    dishSelect.innerHTML = '<option value="" disabled>Загрузка...</option>';

    try {
        const querySnapshot = await getDocs(collection(db, 'menu'));
        dishSelect.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const dish = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = dish.name;
            dishSelect.appendChild(option);
        });
    } catch (error) {
        alert(`Ошибка при загрузке блюд: ${error.message}`);
    }
}

// Обработка подсчета закупок
window.handleCalculatePurchases = function handleCalculatePurchases(event) {
    event.preventDefault();
    const selectedDishes = Array.from(document.getElementById('dish-select').selectedOptions).map(option => option.text);
    const purchaseResult = document.getElementById('purchase-result');
    purchaseResult.innerHTML = `<p>Выбранные блюда: ${selectedDishes.join(', ')}</p>`;
}

// Функция выхода
window.logout = function logout() {
    signOut(auth).then(() => {
        document.getElementById('admin-dashboard-container').style.display = 'none';
        document.getElementById('auth-container').style.display = 'block';
    }).catch((error) => {
        alert(`Ошибка при выходе: ${error.message}`);
    });
}

// Загрузка панели администратора при загрузке скрипта
window.onload = function() {
    loadAdminDashboard();
}
