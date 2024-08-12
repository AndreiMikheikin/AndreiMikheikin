// Импорт необходимых функций из Firestore
import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { initializeDragAndDrop, loadIconPositions } from './main.js';

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

// IDs DOM элементов
const ADMIN_DASHBOARD_CONTENT_ID = 'admin-dashboard-content';
const ICON1_ID = 'icon1';
const ICON2_ID = 'icon2';
const ICON3_ID = 'icon3';
const ICON4_ID = 'icon4';
const INGREDIENTS_CONTAINER_ID = 'ingredients-container';
const PURCHASE_RESULT_ID = 'purchase-result';

// Показ панели администратора
function showAdminDashboard() {
    const adminContainer = document.getElementById('admin-dashboard-container');
    adminContainer.style.display = 'block';
    loadAdminDashboard();
}

// Загрузка панели администратора
window.loadAdminDashboard = function loadAdminDashboard() {
    console.log('Loading admin dashboard...');
    const adminContent = document.getElementById(ADMIN_DASHBOARD_CONTENT_ID);
    adminContent.innerHTML = `
        <div class="icon-container" id="${ICON1_ID}" draggable="true">
            <img src="images/icons/add_dish_icon.svg" alt="Добавить блюдо">
            <p>Добавить блюдо</p>
        </div>
        <div class="icon-container" id="${ICON2_ID}" draggable="true">
            <img src="images/icons/view_menu_icon.svg" alt="Просмотр меню">
            <p>Просмотр меню</p>
        </div>
        <div class="icon-container" id="${ICON3_ID}" draggable="true">
            <img src="images/icons/calculate_purchases_icon.svg" alt="Подсчет закупок">
            <p>Подсчет закупок</p>
        </div>
        <div class="icon-container" id="${ICON4_ID}" draggable="true">
            <img src="images/icons/order_icon.svg" alt="Оформление заказа">
            <p>Оформление заказа</p>
        </div>
    `;

    addIconEventListeners();
    initializeDragAndDrop();
    loadIconPositions();
}

// Функция для обработки двойного клика и касаний на иконках
function addIconEventListeners() {
    document.getElementById(ICON1_ID).addEventListener('dblclick', showAddDishForm);
    document.getElementById(ICON2_ID).addEventListener('dblclick', showMenu);
    document.getElementById(ICON3_ID).addEventListener('dblclick', showPurchaseCalculationForm);
    document.getElementById(ICON4_ID).addEventListener('dblclick', showOrderForm);

    document.getElementById(ICON1_ID).addEventListener('touchend', handleTouchEnd);
    document.getElementById(ICON2_ID).addEventListener('touchend', handleTouchEnd);
    document.getElementById(ICON3_ID).addEventListener('touchend', handleTouchEnd);
    document.getElementById(ICON4_ID).addEventListener('touchend', handleTouchEnd);
}

// Переменные для отслеживания касаний
let lastTouchTime = 0;

// Функция для обработки касаний
function handleTouchEnd(event) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTouchTime;

    if (tapLength < 500 && tapLength > 0) {
        const targetId = event.currentTarget.id;
        if (targetId === ICON1_ID) {
            showAddDishForm();
        } else if (targetId === ICON2_ID) {
            showMenu();
        } else if (targetId === ICON3_ID) {
            calculatePurchases();
        }
    }
    lastTouchTime = currentTime;
}

// Показ формы добавления блюда
window.showAddDishForm = function showAddDishForm() {
    const adminContent = document.getElementById(ADMIN_DASHBOARD_CONTENT_ID);
    adminContent.innerHTML = `
    <h3>Добавить блюдо</h3>
    <form id="add-dish-form" onsubmit="handleAddDish(event)">
        <input type="text" id="category-name" name="category-name" placeholder="Название категории" required>
        <input type="text" id="dish-name" name="dish-name" placeholder="Название блюда" required>
        <div id="ingredients-container">
            <h4>Ингредиенты</h4>
            <div class="ingredient">
                <input type="text" name="ingredient-name" placeholder="Название ингредиента" required>
                <input type="number" name="ingredient-weight" placeholder="Вес (г)" required>
            </div>
        </div>
        <button type="button" id="add-ingredient">Добавить ингредиент</button>
        <textarea id="dish-description" name="dish-description" placeholder="Описание этапов, процесса и времени приготовления" required></textarea>
        <input type="number" id="dish-total-weight" name="dish-total-weight" placeholder="Общий вес блюда на 1 порцию (г)" required>
        <input type="number" id="dish-price" name="dish-price" placeholder="Стоимость 1 порции (руб.)" required>
        <button type="submit">Добавить</button>
    </form>
    <button class="back-button" onclick="loadAdminDashboard()">Назад</button>
    `;

    document.getElementById('add-ingredient').addEventListener('click', addIngredientField);
}

// Добавление поля ингредиента
function addIngredientField() {
    const ingredientsContainer = document.getElementById(INGREDIENTS_CONTAINER_ID);
    const ingredientDiv = document.createElement('div');
    ingredientDiv.classList.add('ingredient');
    ingredientDiv.innerHTML = `
        <input type="text" name="ingredient-name" placeholder="Название ингредиента" required>
        <input type="number" name="ingredient-weight" placeholder="Вес (г)" required>
    `;
    ingredientsContainer.appendChild(ingredientDiv);
}

// Обработка добавления блюда
window.handleAddDish = async function handleAddDish(event) {
    event.preventDefault();
    const category = document.getElementById('category-name').value;
    const name = document.getElementById('dish-name').value;

    const ingredients = [];
    const ingredientDivs = document.querySelectorAll(`#${INGREDIENTS_CONTAINER_ID} .ingredient`);
    ingredientDivs.forEach(div => {
        const ingredientName = div.querySelector('input[name="ingredient-name"]').value;
        const ingredientWeight = div.querySelector('input[name="ingredient-weight"]').value;
        ingredients.push({ name: ingredientName, weight: ingredientWeight });
    });

    const description = document.getElementById('dish-description').value;
    const totalWeight = document.getElementById('dish-total-weight').value;
    const price = document.getElementById('dish-price').value;

    try {
        // Добавляем блюдо в базу данных
        const dishData = { category, name, ingredients, description, totalWeight, price };
        const docRef = await addDoc(collection(db, 'menu'), dishData);

        console.log('Блюдо успешно добавлено:', docRef.id, dishData);

        alert('Блюдо добавлено');
        loadAdminDashboard();
    } catch (error) {
        console.error('Ошибка при добавлении блюда:', error);
        alert(`Ошибка при добавлении блюда: ${error.message}`);
    }
}

// Показ меню
window.showMenu = async function showMenu() {
const adminContent = document.getElementById(ADMIN_DASHBOARD_CONTENT_ID);
    adminContent.innerHTML = `
        <h3>Меню</h3>
        <div id="loading-indicator" style="display: none;">
            <p>Загрузка, пожалуйста подождите...</p>
            <div class="spinner"></div>
        </div>
        <div id="menu-list"></div>
        <button class="back-button" onclick="loadAdminDashboard()">Назад</button>
    `;

    const loadingIndicator = document.getElementById('loading-indicator');
    const menuList = document.getElementById('menu-list');

    // Показываем индикатор загрузки
    loadingIndicator.style.display = 'flex';

    try {
        const querySnapshot = await getDocs(collection(db, 'menu'));
        menuList.innerHTML = '';

        // Организация блюд по категориям
        const categories = {};
        querySnapshot.forEach((doc) => {
            const dish = doc.data();
            const category = dish.category ? dish.category : 'Без категории';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push({ id: doc.id, ...dish });
            console.log('Получено блюдо с сервера:', { id: doc.id, ...dish });
        });

        // Отображение блюд по категориям
        for (const category in categories) {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category');
            categoryDiv.innerHTML = `<h4>Категория: ${category}</h4>`;
            menuList.appendChild(categoryDiv);

            const dishContainer = document.createElement('div');
            dishContainer.classList.add('dish-container');
            categoryDiv.appendChild(dishContainer);

            categories[category].forEach((dish) => {
                const ingredients = Array.isArray(dish.ingredients) && dish.ingredients.length > 0 ? dish.ingredients.map(ingredient => ingredient.name).join(', ') : 'Нет ингредиентов';
                const dishCard = document.createElement('div');
                dishCard.classList.add('dish-card');
                dishCard.innerHTML = `
                    <h5>${dish.name}</h5>
                    <p>Ингредиенты: ${ingredients}</p>
                    <p>Вес: ${dish.totalWeight ? dish.totalWeight : 'Не указано'} гр</p>
                    <div class="price-container">
                        <input type="number" value="${dish.price}" class="price-input" data-id="${dish.id}" data-original-value="${dish.price}" disabled> руб.
                        <button class="edit-button">Редактировать</button>
                        <button class="save-button" data-id="${dish.id}" style="display:none">Сохранить</button>
                        <button class="cancel-button" style="display:none">Отменить</button>
                    </div>
                    <button class="delete-button" data-id="${dish.id}">(X)</button>
                `;
                dishContainer.appendChild(dishCard);
            });
        }

        // Добавление обработчиков событий для кнопок редактирования, сохранения, отмены и удаления
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', handleEditClick);
        });

        document.querySelectorAll('.save-button').forEach(button => {
            button.addEventListener('click', handleSaveClick);
        });

        document.querySelectorAll('.cancel-button').forEach(button => {
            button.addEventListener('click', handleCancelClick);
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', handleDeleteClick);
        });
    } catch (error) {
        console.error('Ошибка при загрузке меню:', error);
        alert(`Ошибка при загрузке меню: ${error.message}`);
    } finally {
        // Скрываем индикатор загрузки
        loadingIndicator.style.display = 'none';
    }
}

function handleEditClick(event) {
    const button = event.target;
    const priceInput = button.previousElementSibling;
    const saveButton = button.nextElementSibling;
    const cancelButton = saveButton.nextElementSibling;

    // Сохраняем текущее значение цены в атрибут data-original-value
    priceInput.setAttribute('data-original-value', priceInput.value);

    priceInput.disabled = false;
    button.style.display = 'none';
    saveButton.style.display = 'inline';
    cancelButton.style.display = 'inline';
}

function handleSaveClick(event) {
    const button = event.target;
    const priceInput = button.previousElementSibling.previousElementSibling;
    const editButton = priceInput.nextElementSibling;
    const cancelButton = button.nextElementSibling;

    const newPrice = priceInput.value;
    const dishId = button.getAttribute('data-id');

    console.log('Сохранение новой цены:', { dishId, newPrice });

    // Сохранение новой цены в Firestore
    updateDoc(doc(db, 'menu', dishId), { price: newPrice })
        .then(() => {
            console.log('Цена успешно обновлена:', { dishId, newPrice });
            alert('Цена успешно обновлена');
            priceInput.disabled = true;
            button.style.display = 'none';
            cancelButton.style.display = 'none';
            editButton.style.display = 'inline';
        })
        .catch(error => {
            console.error('Ошибка при обновлении цены:', error);
            alert(`Ошибка при обновлении цены: ${error.message}`);
        });
}

function handleCancelClick(event) {
    const button = event.target;
    const priceInput = button.previousElementSibling.previousElementSibling.previousElementSibling;
    const editButton = priceInput.nextElementSibling;
    const saveButton = button.previousElementSibling;

    // Восстановление значения цены из атрибута data-original-value
    const originalValue = priceInput.getAttribute('data-original-value');
    console.log('Отмена редактирования цены, восстановление значения:', { originalValue });
    priceInput.value = originalValue;
    priceInput.disabled = true;
    button.style.display = 'none';
    saveButton.style.display = 'none';
    editButton.style.display = 'inline';
}

function handleDeleteClick(event) {
    const button = event.target;
    const dishId = button.getAttribute('data-id');

    const confirmation = confirm('Вы уверены, что хотите удалить это блюдо?');
    if (confirmation) {
        console.log('Удаление блюда:', { dishId });
        // Удаление блюда из Firestore
        deleteDoc(doc(db, 'menu', dishId))
            .then(() => {
                console.log('Блюдо успешно удалено:', { dishId });
                alert('Блюдо успешно удалено');
                showMenu();
            })
            .catch(error => {
                console.error('Ошибка при удалении блюда:', error);
                alert(`Ошибка при удалении блюда: ${error.message}`);
            });
    }
}

// Показ формы подсчета закупок
window.showPurchaseCalculationForm = function showPurchaseCalculationForm() {
    const adminContent = document.getElementById(ADMIN_DASHBOARD_CONTENT_ID);
    adminContent.innerHTML = `
        <h3>Подсчет необходимых закупок</h3>
        <div id="loading-indicator" style="display: none;">
            <p>Загрузка, пожалуйста подождите...</p>
            <div class="spinner"></div>
        </div>
        <form id="purchase-calculation-form">
            <label for="calculation-order-date">Выберите дату заказа:</label>
            <input type="date" id="calculation-order-date" name="calculation-order-date">
            <button type="button" id="add-date-button">Добавить дату</button>
            <div id="date-list"></div>
            <button type="button" id="calculate-purchases-button">Рассчитать</button>
        </form>
        <div id="ingredients-list">
            <!-- Здесь будет отображен список ингредиентов и их вес -->
        </div>

        <button type="button" class="back-button" onclick="loadAdminDashboard()">Назад</button>
    `;

    // Обработчики событий для кнопок
    document.getElementById('add-date-button').addEventListener('click', addDateToList);
    document.getElementById('calculate-purchases-button').addEventListener('click', calculatePurchases);
}

// Функция добавления даты в список
function addDateToList() {
    const dateInput = document.getElementById('calculation-order-date');
    const dateList = document.getElementById('date-list');

    const selectedDate = dateInput.value;

    // Проверка на пустую дату
    if (!selectedDate) {
        alert('Пожалуйста, выберите дату.');
        return;
    }

    // Проверка на дублирование даты
    if (document.querySelector(`.calculation-order-date[data-date="${selectedDate}"]`)) {
        alert('Эта дата уже была добавлена.');
        return;
    }

    // Создание нового элемента для отображения даты
    const dateElement = document.createElement('div');
    dateElement.classList.add('calculation-order-date');
    dateElement.setAttribute('data-date', selectedDate);
    dateElement.textContent = selectedDate;

    // Добавление кнопки для удаления даты
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Удалить';
    removeButton.addEventListener('click', () => dateElement.remove());

    dateElement.appendChild(removeButton);
    dateList.appendChild(dateElement);

    // Очистка поля ввода даты после добавления
    dateInput.value = '';
}

async function calculatePurchases() {
    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = '<h4>Необходимые ингредиенты и их вес:</h4>';

    const dateElements = document.querySelectorAll('.calculation-order-date');

    if (dateElements.length === 0) {
        alert('Выберите хотя бы одну дату.');
        return;
    }

    const ingredientsMap = new Map();

    // Показываем индикатор загрузки
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'flex';

    try {
        for (const dateElement of dateElements) {
            const date = dateElement.getAttribute('data-date');
            console.log(`Загрузка заказов на дату: ${date}`);

            // Запрос заказов на указанную дату
            const querySnapshot = await getDocs(query(collection(db, 'orders'), where('orderDate', '==', date)));

            if (querySnapshot.empty) {
                console.warn(`Заказы на дату ${date} не найдены.`);
                continue;
            }

            for (const doc of querySnapshot.docs) {
                const orderData = doc.data();
                const menuItems = orderData.menuItems;

                console.log(`Обработка заказа с ${menuItems.length} элементами меню на дату ${date}`);
                
                for (const item of menuItems) {
                    await getIngredientsForDish(item.name, item.quantity, ingredientsMap);
                }
            }
        }

        // Отображение списка ингредиентов
        displayIngredients(ingredientsMap);

    } catch (error) {
        console.error('Ошибка при расчете закупок:', error);
        alert(`Ошибка при расчете закупок: ${error.message}`);
    } finally {
        // Скрываем индикатор загрузки
        loadingIndicator.style.display = 'none';
    }
}


// Функция для получения ингредиентов конкретного блюда
async function getIngredientsForDish(dishName, quantity, ingredientsMap) {
    console.log(`Загрузка ингредиентов для блюда: ${dishName}`);

    const querySnapshot = await getDocs(query(collection(db, 'menu'), where('name', '==', dishName)));

    if (querySnapshot.empty) {
        console.warn(`Блюдо ${dishName} не найдено в меню.`);
        return;
    }

    const dishData = querySnapshot.docs[0].data();
    const ingredients = dishData.ingredients;

    ingredients.forEach(ingredient => {
        const ingredientName = ingredient.name.replace(/\s+/g, ' ').trim().toLowerCase();
        const weightPerPortion = parseFloat(ingredient.weight);

        if (ingredientsMap.has(ingredientName)) {
            const existingWeight = ingredientsMap.get(ingredientName);
            ingredientsMap.set(ingredientName, existingWeight + weightPerPortion * quantity);
        } else {
            ingredientsMap.set(ingredientName, weightPerPortion * quantity);
        }
    });
}

function displayIngredients(ingredients) {
    const ingredientsList = document.getElementById('ingredients-list');

    if (ingredients.size === 0) {
        ingredientsList.innerHTML += '<p>Ингредиенты не найдены.</p>';
        return;
    }

    const ul = document.createElement('ul');

    ingredients.forEach((totalWeight, ingredientName) => {
        let displayWeight = totalWeight;
        let unit = 'г';

        if (totalWeight > 200) {
            displayWeight = displayWeight / 1000;
            unit = 'кг';
        }

        displayWeight = displayWeight % 1 === 0 ? displayWeight : displayWeight.toFixed(2);

        const li = document.createElement('li');
        li.textContent = `${capitalizeFirstLetter(ingredientName)}: ${displayWeight} ${unit}`;
        ul.appendChild(li);
    });

    ingredientsList.appendChild(ul);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


// Показ формы оформления заказа
window.showOrderForm = function showOrderForm() {
    const adminContent = document.getElementById(ADMIN_DASHBOARD_CONTENT_ID);
    adminContent.innerHTML = `
        <h3>Загрузка заказа по дате</h3>
        <form id="load-order-form">
            <label for="load-order-date">Выберите дату:</label>
            <input type="date" id="load-order-date" name="load-order-date" required>
            <button type="button" id="load-order-button">Загрузить заказ</button>
        </form>

        <h3>Оформление заказа</h3>
        <form id="order-form">
            <label for="order-date">Дата заказа:</label>
            <input type="date" id="order-date" name="order-date" required>

            <label for="end-date">Дата окончания:</label>
            <input type="date" id="end-date" name="end-date" required>

            <label for="menu-items">Выберите блюдо:</label>
            <select id="menu-items" name="menu-items">
                <option value="">Выберите блюдо</option>
            </select>
            <button type="button" id="add-dish-to-order">Добавить блюдо</button>

            <h4>Бланк заказа</h4>
            <div id="order-blank">
                <!-- Здесь будут добавляться выбранные блюда -->
            </div>

            <h4>Дополнительные услуги</h4>
            <div id="additional-services">
                <button type="button" id="add-service">Добавить услугу</button>
            </div>

            <label for="total-sum">Итоговая сумма заказа:</label>
            <input type="number" id="total-sum" name="total-sum" readonly>

            <label for="prepayment">Внесенная предоплата:</label>
            <input type="number" id="prepayment" name="prepayment">

            <label for="final-sum">Итоговая сумма с учетом услуг и предоплаты:</label>
            <input type="number" id="final-sum" name="final-sum" readonly>

            <button type="button" id="print-order">Распечатать</button>
            <button type="button" id="save-order">Сохранить заказ</button>
            <button type="button" class="back-button" onclick="loadAdminDashboard()">Назад</button>
        </form>

        <div id="print-modal" class="modal">
            <div class="modal-content">
                <span class="modal-close-button">&times;</span>
                <div id="print-content"></div>
                <button type="button" id="confirm-print">Печать</button>
            </div>
        </div>
    `;

    loadMenuItems();
    document.getElementById('add-dish-to-order').addEventListener('click', addDishToOrder);
    document.getElementById('add-service').addEventListener('click', addServiceField);
    document.getElementById('prepayment').addEventListener('input', updateFinalSum);
    document.getElementById('print-order').addEventListener('click', showPrintModal);
    document.getElementById('save-order').addEventListener('click', saveOrder);
    document.getElementById('load-order-button').addEventListener('click', loadOrderByDate);
}

// Загрузка заказа по дате
let currentOrderId = null;

async function loadOrderByDate() {
    const loadOrderDate = document.getElementById('load-order-date').value;

    try {
        // Запрос к базе данных Firestore
        const querySnapshot = await getDocs(query(collection(db, 'orders'), where('orderDate', '==', loadOrderDate)));

        if (querySnapshot.empty) {
            alert('Заказ на эту дату не найден.');
            return;
        }

        // Получение данных заказа
        const docSnapshot = querySnapshot.docs[0];
        const orderData = docSnapshot.data();
        currentOrderId = docSnapshot.id; // Сохранение ID заказа

        // Заполнение формы данными заказа
        document.getElementById('order-date').value = orderData.orderDate;
        document.getElementById('end-date').value = orderData.endDate;

        const orderBlank = document.getElementById('order-blank');
        orderBlank.innerHTML = '';

        orderData.menuItems.forEach(item => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item');
            orderItem.innerHTML = `
                <p>${item.name}</p>
                <input type="number" value="${item.quantity}" min="1" class="dish-quantity" data-price="${item.price}">
                <span>${item.price} руб.</span>
                <span class="dish-total-price">${item.total}</span>
                <button type="button" class="remove-button">Удалить</button>
            `;
            orderItem.querySelector('.remove-button').addEventListener('click', () => {
                orderBlank.removeChild(orderItem);
                updateTotalSum();
            });
            orderItem.querySelector('.dish-quantity').addEventListener('input', () => {
                updateDishTotalPrice(orderItem);
                updateTotalSum();
            });
            orderBlank.appendChild(orderItem);
        });

        const servicesContainer = document.getElementById('additional-services');
        servicesContainer.innerHTML = '<button type="button" id="add-service">Добавить услугу</button>';

        orderData.additionalServices.forEach(service => {
            const serviceDiv = document.createElement('div');
            serviceDiv.classList.add('service');
            serviceDiv.innerHTML = `
                <input type="text" name="service-name" value="${service.name}" required>
                <input type="number" name="service-quantity" value="${service.quantity}" min="1">
                <input type="number" name="service-price" value="${service.price}" required>
                <input type="number" name="service-total" value="${service.total}" readonly>
                <button type="button" class="remove-service">Удалить</button>
            `;
            serviceDiv.querySelector('.remove-service').addEventListener('click', () => {
                serviceDiv.remove();
                updateFinalSum();
            });
            serviceDiv.querySelector('input[name="service-quantity"]').addEventListener('input', updateServiceTotal);
            serviceDiv.querySelector('input[name="service-price"]').addEventListener('input', updateServiceTotal);
            servicesContainer.appendChild(serviceDiv);
        });

        document.getElementById('total-sum').value = orderData.totalSum;
        document.getElementById('prepayment').value = orderData.prepayment;
        document.getElementById('final-sum').value = orderData.finalSum;

        updateFinalSum();

    } catch (error) {
        console.error('Ошибка при загрузке заказа:', error);
        alert(`Ошибка при загрузке заказа: ${error.message}`);
    }
}

// Загрузка списка блюд
window.loadMenuItems = async function loadMenuItems() {
    const menuItemsSelect = document.getElementById('menu-items');

    try {
        const menuSnapshot = await getDocs(collection(db, 'menu'));

        menuSnapshot.forEach(doc => {
            const dish = doc.data();
            const option = document.createElement('option');
            option.value = JSON.stringify({ id: doc.id, name: dish.name, price: dish.price });
            option.textContent = dish.name;
            menuItemsSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка при получении блюд:', error);
        alert(`Ошибка при получении блюд: ${error.message}`);
    }
}

// Добавление блюда в заказ
function addDishToOrder() {
    const menuItemsSelect = document.getElementById('menu-items');
    const orderBlank = document.getElementById('order-blank');
    const selectedItemValue = menuItemsSelect.value;

    if (!selectedItemValue) {
        alert('Пожалуйста, выберите блюдо.');
        return;
    }

    const selectedItem = JSON.parse(selectedItemValue);

    const orderItem = document.createElement('div');
    orderItem.classList.add('order-item');
    orderItem.innerHTML = `
        <p>${selectedItem.name}</p>
        <input type="number" value="1" min="1" class="dish-quantity" data-price="${selectedItem.price}">
        <span>${selectedItem.price} руб.</span>
        <span class="dish-total-price">${selectedItem.price} руб.</span>
        <button type="button" class="remove-button">Удалить</button>
    `;

    orderItem.querySelector('.remove-button').addEventListener('click', () => {
        orderBlank.removeChild(orderItem);
        updateTotalSum();
    });

    orderItem.querySelector('.dish-quantity').addEventListener('input', () => {
        updateDishTotalPrice(orderItem);
        updateTotalSum();
    });

    orderBlank.appendChild(orderItem);
    updateTotalSum();
}

// Обновление итоговой суммы заказа
function updateTotalSum() {
    const orderItems = document.querySelectorAll('.order-item');
    let totalSum = 0;

    orderItems.forEach(item => {
        const quantity = item.querySelector('.dish-quantity').value;
        const price = item.querySelector('.dish-quantity').getAttribute('data-price');
        const totalPrice = quantity * price;
        item.querySelector('.dish-total-price').textContent = `${totalPrice} руб.`;
        totalSum += totalPrice;
    });

    document.getElementById('total-sum').value = totalSum;
    updateFinalSum();
}

// Обновление итоговой суммы блюда
function updateDishTotalPrice(orderItem) {
    const quantity = orderItem.querySelector('.dish-quantity').value;
    const price = orderItem.querySelector('.dish-quantity').getAttribute('data-price');
    const totalPrice = quantity * price;
    orderItem.querySelector('.dish-total-price').textContent = `${totalPrice} руб.`;
}

// Добавление дополнительной услуги
function addServiceField() {
    const servicesContainer = document.getElementById('additional-services');

    const serviceDiv = document.createElement('div');
    serviceDiv.classList.add('service');
    serviceDiv.innerHTML = `
        <input type="text" name="service-name" placeholder="Название услуги" required>
        <input type="number" name="service-quantity" placeholder="Количество" value="1" min="1">
        <input type="number" name="service-price" placeholder="Цена" required>
        <input type="number" name="service-total" placeholder="Итоговая сумма" readonly>
        <button type="button" class="remove-service">Удалить</button>
    `;

    serviceDiv.querySelector('.remove-service').addEventListener('click', () => {
        serviceDiv.remove();
        updateFinalSum();
    });

    serviceDiv.querySelector('input[name="service-quantity"]').addEventListener('input', updateServiceTotal);
    serviceDiv.querySelector('input[name="service-price"]').addEventListener('input', updateServiceTotal);

    servicesContainer.appendChild(serviceDiv);
}

// Обновление итоговой суммы услуги
function updateServiceTotal(event) {
    const serviceDiv = event.target.closest('.service');
    const quantity = serviceDiv.querySelector('input[name="service-quantity"]').value;
    const price = serviceDiv.querySelector('input[name="service-price"]').value;
    const total = quantity * price;
    serviceDiv.querySelector('input[name="service-total"]').value = total;

    updateFinalSum();
}

// Обновление окончательной суммы заказа
function updateFinalSum() {
    const totalSum = parseFloat(document.getElementById('total-sum').value) || 0;
    const prepayment = parseFloat(document.getElementById('prepayment').value) || 0;
    let additionalServicesTotal = 0;

    const services = document.querySelectorAll('.service');
    services.forEach(service => {
        additionalServicesTotal += parseFloat(service.querySelector('input[name="service-total"]').value) || 0;
    });

    const finalSum = totalSum + additionalServicesTotal - prepayment;
    document.getElementById('final-sum').value = finalSum;
}

// Показ модального окна для печати
function showPrintModal() {
    const printContent = document.getElementById('print-content');
    printContent.innerHTML = generatePrintContent();

    const printModal = document.getElementById('print-modal');
    printModal.style.display = 'block';

    // Обработчик закрытия модального окна
    const closeModalButton = document.querySelector('.modal-close-button');
    closeModalButton.addEventListener('click', () => {
        printModal.style.display = 'none';
    });

    const confirmPrintButton = document.getElementById('confirm-print');
    confirmPrintButton.addEventListener('click', () => {
        window.print();
        printModal.style.display = 'none';
    });
}

// Генерация контента для печати
function generatePrintContent() {
    const orderDate = document.getElementById('order-date').value;
    const totalSum = document.getElementById('total-sum').value;
    const prepayment = document.getElementById('prepayment').value;
    const finalSum = document.getElementById('final-sum').value;

    let printContent = `
        <h3>Заказ на дату: ${orderDate}</h3>
        <h4>Бланк заказа:</h4>
        <ul>
    `;

    const orderItems = document.querySelectorAll('.order-item');
    orderItems.forEach(item => {
        const dishName = item.querySelector('p').textContent;
        const quantity = item.querySelector('.dish-quantity').value;
        const totalPrice = item.querySelector('.dish-total-price').textContent;
        printContent += `<li>${dishName} &nbsp;&nbsp;&nbsp;&nbsp; ${quantity} шт. &nbsp;&nbsp;&nbsp;&nbsp; ${totalPrice}</li>`;
    });

    printContent += `
        </ul>
        </br>
        <p>Итоговая сумма заказа: ${totalSum} руб.</p>
        </br>
        <h4>Дополнительные услуги:</h4>
        <ul>
    `;

    const services = document.querySelectorAll('.service');
    services.forEach(service => {
        const serviceName = service.querySelector('input[name="service-name"]').value;
        const quantity = service.querySelector('input[name="service-quantity"]').value;
        const total = service.querySelector('input[name="service-total"]').value;
        printContent += `<li>${serviceName} &nbsp;&nbsp;&nbsp;&nbsp; кол-во: ${quantity} &nbsp;&nbsp;&nbsp;&nbsp; ${total} руб.</li>`;
    });

    printContent += `
        </ul>
        </br></br>
        <p>Внесенная предоплата: ${prepayment} руб.</p>
        <p>Итоговая сумма с учетом услуг и предоплаты: ${finalSum} руб.</p>
    `;

    return printContent;
}

// Сохранение заказа
async function saveOrder() {
    const orderDate = document.getElementById('order-date').value;
    const endDate = document.getElementById('end-date').value;
    const totalSum = parseFloat(document.getElementById('total-sum').value) || 0;
    const prepayment = parseFloat(document.getElementById('prepayment').value) || 0;
    const finalSum = parseFloat(document.getElementById('final-sum').value) || 0;

    let menuItems = [];
    document.querySelectorAll('.order-item').forEach(item => {
        menuItems.push({
            name: item.querySelector('p').textContent,
            quantity: parseInt(item.querySelector('.dish-quantity').value),
            price: parseFloat(item.querySelector('.dish-quantity').getAttribute('data-price')),
            total: parseFloat(item.querySelector('.dish-total-price').textContent)
        });
    });

    let additionalServices = [];
    document.querySelectorAll('.service').forEach(service => {
        additionalServices.push({
            name: service.querySelector('input[name="service-name"]').value,
            quantity: parseInt(service.querySelector('input[name="service-quantity"]').value),
            price: parseFloat(service.querySelector('input[name="service-price"]').value),
            total: parseFloat(service.querySelector('input[name="service-total"]').value)
        });
    });

    const orderData = {
        orderDate,
        endDate,
        menuItems,
        additionalServices,
        totalSum,
        prepayment,
        finalSum
    };

    try {
        if (currentOrderId) {
            // Обновление существующего заказа
            await updateDoc(doc(db, 'orders', currentOrderId), orderData);
        } else {
            // Создание нового заказа
            await addDoc(collection(db, 'orders'), orderData);
        }
        alert('Заказ успешно сохранен.');
    } catch (error) {
        console.error('Ошибка при сохранении заказа:', error);
        alert(`Ошибка при сохранении заказа: ${error.message}`);
    }
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
window.onload = function () {
    loadAdminDashboard();
}

// Адаптивность интерфейса
window.onresize = function () {
    const adminContent = document.getElementById('admin-dashboard-content');
    if (window.innerWidth < 768) {
        adminContent.classList.add('mobile-view');
    } else {
        adminContent.classList.remove('mobile-view');
    }
}
