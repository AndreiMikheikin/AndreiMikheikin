//public/src/admin.js

// Импорт необходимых функций из Firestore
import { collection, addDoc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, doc, query, where, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeDragAndDrop, saveIconPositions, addIconEventListeners } from "./main.js";

// IDs DOM элементов
const ADMIN_DASHBOARD_CONTENT_ID = "admin-dashboard-content";
const ICON1_ID = "icon1";
const ICON2_ID = "icon2";
const ICON3_ID = "icon3";
const ICON4_ID = "icon4";
const ICON5_ID = "icon5";

// Загрузка панели администратора
export function loadAdminDashboard() {
  console.log("Loading admin dashboard...");
  const adminContainer = document.getElementById("admin-dashboard-container");
  const adminContent = document.getElementById("admin-dashboard-content");

  if (adminContainer && adminContent) {
    // Скрываем adminContent и показываем adminContainer
    adminContent.style.display = "none";
    adminContainer.style.display = "block";

    // Заполняем adminContainer содержимым
    adminContainer.innerHTML = `
            <h2>Рабочий стол</h2>
            <button class="logout" onclick="logout()"><span class="material-icons-outlined">close</span></button>
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
            <div class="icon-container" id="${ICON5_ID}" draggable="true">
                <img src="images/icons/contact_icon.svg" alt="Коллекции элементов">
                <p>Коллекции элементов</p>
            </div>
        `;

    // Инициализируем события и загрузку
    addIconEventListeners();
    initializeDragAndDrop();
    loadIconPositions();

    // Сохраняем позиции иконок перед закрытием страницы
    window.addEventListener("beforeunload", saveIconPositions);
  } else {
    console.error(
      "Ошибка: не удалось найти admin-dashboard-container или admin-dashboard-content."
    );
  }

  // Загрузка позиций иконок из локального хранилища
  function loadIconPositions() {
    const positions = JSON.parse(localStorage.getItem("iconPositions"));
    if (positions) {
      const dropzone = document.getElementById("admin-dashboard-container");
      positions.forEach((pos) => {
        const icon = document.getElementById(pos.id);
        if (icon) {
          // Пропорциональная адаптация
          const left =
            parseFloat(pos.left) * (dropzone.offsetWidth / window.innerWidth);
          const top =
            parseFloat(pos.top) * (dropzone.offsetHeight / window.innerHeight);

          icon.style.left = `${left}px`;
          icon.style.top = `${top}px`;
        }
      });
    }
  }
}

// Функция для показа админского контента и скрытия панели
function showAdminContent() {
  const adminContainer = document.getElementById("admin-dashboard-container");
  const adminContent = document.getElementById("admin-dashboard-content");

  if (adminContainer && adminContent) {
    adminContainer.style.display = "none"; // Скрываем контейнер панели
    adminContent.style.display = "block"; // Показываем контент
  } else {
    console.error(
      "Ошибка: не удалось найти admin-dashboard-container или admin-dashboard-content."
    );
  }
}

window.loadAdminDashboard = loadAdminDashboard;

/* -------------------Форма добавления / редактирования блюд-------------------- */

// Функция для удаления ингредиента
function removeIngredient(button) {
  // Находим ближайший родительский элемент с классом .ingredient-group и удаляем его
  const ingredientGroup = button.closest(".ingredient-group");
  if (ingredientGroup) {
    ingredientGroup.remove();
  }
}

// Функция для добавления нового поля ингредиента
async function addIngredientField() {
  // Загружаем опции поставщиков из Firebase
  const supplierOptions = await loadSupplierOptions();

  // Находим контейнер для ингредиентов
  const ingredientsContainer = document.getElementById("ingredients-container");
  const index =
    ingredientsContainer.querySelectorAll(".ingredient-group").length;

  // Создаем новый div для группы ингредиентов
  const ingredientDiv = document.createElement("div");
  ingredientDiv.classList.add("ingredient-group");
  ingredientDiv.setAttribute("data-index", index);

  // Добавляем HTML-контент
  ingredientDiv.innerHTML = `
        <input type="text" id="ingredient-name" name="ingredient-name" placeholder="Название ингредиента" required>
        <input type="number" name="ingredient-weight" placeholder="Вес" class="weight-input" required>
        <select name="ingredient-unit">
            <option value="г">г</option>
            <option value="мл">мл</option>
            <option value="шт">шт</option>
        </select>
        <select name="ingredient-supplier">
            <option value="">Выберите поставщика</option>
            ${supplierOptions}
        </select>
        <button type="button" class="remove-ingredient-button"><span class="material-icons-outlined">delete</span></button>
    `;

  // Добавляем новую группу ингредиентов в контейнер
  ingredientsContainer.appendChild(ingredientDiv);
}

// Функция для добавления обработчиков событий после загрузки DOM
function addEventListeners() {
  const addIngredientButton = document.getElementById("add-ingredient");
  const loadDishButton = document.getElementById("load-dish-button");
  const deleteDishButton = document.getElementById("delete-dish-button");
  const saveDishButton = document.getElementById("save-dish-button");
  const sharedCheckbox = document.getElementById("shared");

  if (addIngredientButton) {
    // Добавляем обработчик события для кнопки добавления ингредиента
    addIngredientButton.addEventListener("click", addIngredientField);
  }

  if (loadDishButton) {
    // Добавляем обработчик события для загрузки блюда
    loadDishButton.addEventListener("click", loadDishForEditing);
  }

  if (deleteDishButton) {
    // Добавляем обработчик события для удаления блюда
    deleteDishButton.addEventListener("click", deleteDish);
  }

  if (saveDishButton) {
    // Обновляем обработчик события для кнопки сохранения блюда, чтобы использовать handleSubmit
    saveDishButton.addEventListener("click", handleSubmit);
  }

  if (sharedCheckbox) {
    // Обработчик изменения состояния чекбокса "Предоставить доступ"
    sharedCheckbox.addEventListener("change", function () {
      const sharedByContainer = document.getElementById("shared-by-container");
      // Отображаем или скрываем поле "Кто предоставил доступ" в зависимости от состояния чекбокса
      sharedByContainer.style.display = this.checked ? "block" : "none";
    });
  }

  // Делегирование события для удаления ингредиента
  document.addEventListener("click", function (event) {
    // Ищем ближайший элемент с классом .remove-ingredient-button
    const button = event.target.closest(".remove-ingredient-button");
    if (button) {
      // Вызываем функцию удаления ингредиента при нажатии на кнопку удаления
      removeIngredient(button);
    }
  });
}

// Функция для загрузки списка поставщиков из localStorage
function loadSupplierOptions() {
  console.log("Функция loadSupplierOptions() вызвана");

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Пользователь не аутентифицирован. Пожалуйста, выполните вход.");
      return `<option value="">Ошибка: пользователь не аутентифицирован</option>`;
    }

    // Формируем ключ для localStorage
    const userUID = user.uid;
    const localStorageKey = `collection_suppliers_${userUID}`;
    console.log("Используемый ключ localStorage:", localStorageKey);

    // Получаем данные о поставщиках из localStorage
    const suppliersData = localStorage.getItem(localStorageKey);

    if (!suppliersData) {
      console.log("Список поставщиков пуст.");
      return `<option value="">У вас нет поставщиков. <a href="#" onclick="showAddSupplierForm()">Добавьте первого поставщика!</a></option>`;
    }

    // Парсим данные
    const suppliers = JSON.parse(suppliersData);
    console.log("Загруженные данные о поставщиках из localStorage:", suppliers);

    // Генерация списка <option> с именем поставщика
    let options = "";
    suppliers.forEach((supplier) => {
      // Проверка на наличие свойства "name" у каждого поставщика
      if (supplier.name) {
        options += `<option value="${supplier.id}">${supplier.name}</option>`;
      } else {
        console.warn(
          `У поставщика с ID ${supplier.id} отсутствует поле "name"`
        );
      }
    });

    console.log("Сформированные опции для селекта:", options);
    return options;
  } catch (error) {
    console.error(
      "Произошла ошибка при загрузке данных из localStorage:",
      error
    );
    return `<option value="">Ошибка загрузки данных</option>`;
  }
}

// Функция для отображения формы добавления/редактирования блюда
window.showDishForm = async function showDishForm() {
  showAdminContent();
  const adminContent = document.getElementById("admin-dashboard-content");
  if (!adminContent) {
    console.error('Элемент с ID "admin-dashboard-content" не найден.');
    return;
  }

  // Загружаем список поставщиков
  const supplierOptions = await loadSupplierOptions();

  // HTML-код формы добавления/редактирования блюда
  adminContent.innerHTML = `
    <div class="add-dish-container">
        <h3 class="page-title">Добавить блюдо</h3>
        <form id="dish-form">
            <input type="text" id="category-name" name="category-name" placeholder="Название категории" required>
            <input type="text" id="dish-name" name="dish-name" placeholder="Название блюда" required>
            <div id="ingredients-container">
                <h4 class="ingredients-label">Ингредиенты</h4>
                <div class="ingredient-group">
                    <input type="text" id="ingredient-name" name="ingredient-name" placeholder="Название ингредиента" required>
                    <input type="number" name="ingredient-weight" placeholder="Вес" class="weight-input" required>
                    <select name="ingredient-unit">
                        <option value="г">г</option>
                        <option value="мл">мл</option>
                        <option value="шт">шт</option>
                    </select>
                    <select name="ingredient-supplier" required>
                        <option value="">Выберите поставщика</option>
                        ${supplierOptions}
                    </select>
                    <button type="button" class="remove-ingredient-button"><span class="material-icons-outlined">delete</span></button>
                </div>
            </div>
            <button type="button" id="add-ingredient" class="add-ingredient-button">Добавить ингредиент</button>
            <textarea id="dish-description" name="dish-description" placeholder="Описание приготовления, процесс и время" required></textarea>
            <input type="number" id="dish-total-weight" name="dish-total-weight" placeholder="Общий вес на порцию (г)" required>
            <input type="number" id="dish-price" name="dish-price" step="0.01" placeholder="Цена за порцию" required>
            <div>
                <input type="checkbox" id="shared" name="shared">
                <label for="shared">Предоставить доступ</label>
            </div>
            <div id="shared-by-container" style="display: none;">
                <input type="text" id="shared-by" name="shared-by" placeholder="Кто предоставил доступ">
            </div>
            <button type="submit" id="save-dish-button" class="submit-button">Добавить блюдо</button>
        </form>
        <button class="back-button" onclick="loadAdminDashboard()"><span class="material-icons-outlined">arrow_back</span></button>
        <div class="edit-dish-container">
            <h4>Редактировать существующее блюдо</h4>
            <form id="load-dish-form">
                <label for="load-dish">Выберите блюдо для редактирования:</label>
                <select id="load-dish" name="load-dish">
                    <option value="">Выберите блюдо</option>
                </select>
                <button type="button" id="load-dish-button">Загрузить блюдо</button>
                <button type="button" id="delete-dish-button">Удалить блюдо</button>
            </form>
        </div>
    </div>
    `;

  // Загрузка списка блюд в выпадающий список
  await loadDishOptions();

  // Добавление обработчиков событий
  addEventListeners();

  // Обработчик отправки формы
  const form = document.getElementById("dish-form");
  form.addEventListener("submit", handleSubmit);

  // Универсальная функция для получения данных из localStorage
  function getDataFromLocalStorage(localStorageKey) {
    console.log(`Загрузка данных из localStorage по ключу: ${localStorageKey}`);

    // Получаем данные из localStorage
    const data = localStorage.getItem(localStorageKey);

    if (!data) {
      console.log("Данные не найдены в localStorage");
      return [];
    }

    // Парсим данные
    const items = JSON.parse(data);

    // Создаем массив имен элементов
    const itemNames = items.map((item) => item.name);

    console.log(`Загруженные данные:`, itemNames);
    return itemNames;
  }

  // Инициализация автозаполнения для поля с категориями
  $(document).ready(function () {
    // Получаем категории из localStorage
    const userUID = getAuth().currentUser.uid;
    const categoriesKey = `collection_categories_${userUID}`;
    const categories = getDataFromLocalStorage(categoriesKey);

    // Инициализация автозаполнения для поля с категориями
    $("#category-name").autocomplete({
      source: categories,
    });

    // Получаем ингредиенты из localStorage
    const ingredientsKey = `collection_ingredients_${userUID}`;
    const ingredients = getDataFromLocalStorage(ingredientsKey);

    // Инициализация автозаполнения для поля с ингредиентами
    $("#ingredient-name").autocomplete({
      source: ingredients,
    });
  });
};

// Функция для загрузки опций блюд в выпадающий список
async function loadDishOptions() {
  const loadDishSelect = document.getElementById("load-dish");
  if (!loadDishSelect) {
    console.error('Элемент с ID "load-dish" не найден.');
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      alert("Пользователь не аутентифицирован. Пожалуйста, войдите в систему.");
      return;
    }

    // Ссылка на меню пользователя
    const userMenuRef = collection(db, `users/${user.uid}/menu`);
    const menuSnapshot = await getDocs(userMenuRef);

    // Очищаем select перед добавлением новых опций
    loadDishSelect.innerHTML = "";

    // Добавляем плейсхолдер "Выберите блюдо"
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Выберите блюдо";
    placeholderOption.disabled = true; // Отключаем возможность выбора этого пункта
    placeholderOption.selected = true; // Выбираем его по умолчанию
    loadDishSelect.appendChild(placeholderOption);

    // Группировка блюд по категориям
    const categories = {};

    menuSnapshot.forEach((doc) => {
      const dish = doc.data();
      const category = dish.category || "Без категории"; // Если категория не указана, используем "Без категории"

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({ id: doc.id, name: dish.name });
    });

    // Создаем опции для категорий и добавляем их в select
    for (const [category, dishes] of Object.entries(categories)) {
      if (dishes.length > 0) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = category;

        dishes.forEach((dish) => {
          const option = document.createElement("option");
          option.value = dish.id;
          option.textContent = dish.name;
          optgroup.appendChild(option);
        });

        loadDishSelect.appendChild(optgroup);
      }
    }
  } catch (error) {
    console.error("Ошибка при получении блюд:", error);
  }
}

// Функция для загрузки блюда для редактирования
async function loadDishForEditing() {
  const dishId = document.getElementById("load-dish").value;

  if (!dishId) {
    alert("Пожалуйста, выберите блюдо для редактирования.");
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    const dishDocRef = doc(db, `users/${user.uid}/menu`, dishId);
    const dishDoc = await getDoc(dishDocRef);

    if (dishDoc.exists()) {
      const dishData = dishDoc.data();

      document.getElementById("category-name").value = dishData.category || "";
      document.getElementById("dish-name").value = dishData.name || "";
      document.getElementById("dish-description").value =
        dishData.description || "";
      document.getElementById("dish-total-weight").value =
        dishData.totalWeight || "";
      document.getElementById("dish-price").value = dishData.price || "";
      document.getElementById("shared").checked = dishData.shared || false;
      document.getElementById("shared-by-container").style.display =
        dishData.shared ? "block" : "none";
      document.getElementById("shared-by").value = dishData.sharedBy || "";

      const ingredientsContainer = document.getElementById(
        "ingredients-container"
      );
      ingredientsContainer.innerHTML = "";

      // Загружаем опции поставщиков из Firebase
      const supplierOptions = await loadSupplierOptions();

      dishData.ingredients.forEach((ingredient, index) => {
        const ingredientDiv = document.createElement("div");
        ingredientDiv.classList.add("ingredient-group");
        ingredientDiv.setAttribute("data-index", index);

        ingredientDiv.innerHTML = `
                    <input type="text" name="ingredient-name" value="${ingredient.name
          }" placeholder="Название ингредиента" required>
                    <input type="number" name="ingredient-weight" value="${ingredient.weight
          }" placeholder="Вес" class="weight-input" required>
                    <select name="ingredient-unit">
                        <option value="г" ${ingredient.unit === "г" ? "selected" : ""
          }>г</option>
                        <option value="мл" ${ingredient.unit === "мл" ? "selected" : ""
          }>мл</option>
                        <option value="шт" ${ingredient.unit === "шт" ? "selected" : ""
          }>шт</option>
                    </select>
                    <select name="ingredient-supplier">
                        <option value="">Выберите поставщика</option>
                        ${supplierOptions}
                    </select>
                    <button type="button" class="remove-ingredient-button"><i class="fa fa-trash"></i></button>
                `;
        ingredientsContainer.appendChild(ingredientDiv);
      });

      updateIngredientIndices();
      document.getElementById("save-dish-button").textContent =
        "Сохранить изменения";
    } else {
      alert("Блюдо не найдено.");
    }
  } catch (error) {
    console.error("Ошибка загрузки блюда для редактирования:", error);
  }
}

// Функция для обновления индексов ингредиентов
function updateIngredientIndices() {
  const ingredientsContainer = document.getElementById("ingredients-container");
  ingredientsContainer
    .querySelectorAll(".ingredient-group")
    .forEach((ingredientDiv, index) => {
      ingredientDiv.setAttribute("data-index", index);
    });
}

// Функция для обработки отправки формы
async function handleSubmit(event) {
  event.preventDefault();

  const form = event.target.closest("form");

  const categoryNameInput = form.querySelector("#category-name");
  const dishNameInput = form.querySelector("#dish-name");
  const dishDescriptionInput = form.querySelector("#dish-description");
  const dishTotalWeightInput = form.querySelector("#dish-total-weight");
  const dishPriceInput = form.querySelector("#dish-price");
  const sharedCheckbox = form.querySelector("#shared");
  const sharedByInput = form.querySelector("#shared-by");

  if (
    !categoryNameInput ||
    !dishNameInput ||
    !dishDescriptionInput ||
    !dishTotalWeightInput ||
    !dishPriceInput ||
    !sharedCheckbox ||
    !sharedByInput
  ) {
    console.error("Ошибка: одно из полей формы не найдено.");
    return;
  }

  const categoryName = categoryNameInput.value;
  const dishName = dishNameInput.value;
  const dishDescription = dishDescriptionInput.value;
  const dishTotalWeight = parseFloat(dishTotalWeightInput.value);
  const dishPrice = parseFloat(dishPriceInput.value);
  const shared = sharedCheckbox.checked;
  const sharedBy = shared ? sharedByInput.value : "";

  // Сбор данных ингредиентов
  const ingredients = [];
  const ingredientGroups = form.querySelectorAll(".ingredient-group");

  ingredientGroups.forEach((group) => {
    const ingredientNameInput = group.querySelector(
      'input[name="ingredient-name"]'
    );
    const ingredientWeightInput = group.querySelector(
      'input[name="ingredient-weight"]'
    );
    const ingredientUnitSelect = group.querySelector(
      'select[name="ingredient-unit"]'
    );
    const ingredientSupplierSelect = group.querySelector(
      'select[name="ingredient-supplier"]'
    );

    if (
      ingredientNameInput &&
      ingredientWeightInput &&
      ingredientUnitSelect &&
      ingredientSupplierSelect
    ) {
      const name = ingredientNameInput.value;
      const weight = parseFloat(ingredientWeightInput.value);
      const unit = ingredientUnitSelect.value;
      const supplier =
        ingredientSupplierSelect.options[ingredientSupplierSelect.selectedIndex]
          .text;

      ingredients.push({
        name,
        weight,
        unit,
        supplier,
      });
    } else {
      console.error("Ошибка: одно из полей ингредиентов не найдено.");
    }
  });

  const user = auth.currentUser;
  if (!user) {
    return;
  }

  const dishData = {
    category: categoryName,
    name: dishName,
    description: dishDescription,
    totalWeight: dishTotalWeight,
    price: dishPrice,
    shared: shared,
    sharedBy: sharedBy,
    ingredients: ingredients,
  };

  try {
    // Добавляем проверки и добавление категорий и ингредиентов
    const userUid = user.uid;

    // Проверка наличия категории
    const categoriesRef = collection(db, `users/${userUid}/categories`);
    const categoryQuery = query(
      categoriesRef,
      where("name", "==", categoryName)
    );
    const categorySnapshot = await getDocs(categoryQuery);

    let categoryExists = false;
    if (categorySnapshot.empty) {
      // Категория не существует, добавляем её
      await addDoc(categoriesRef, {
        name: categoryName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      categoryExists = false;
      console.log(
        `Новая категория "${categoryName}" добавлена в коллекцию категорий.`
      );
    } else {
      categoryExists = true;
    }

    // Проверка наличия ингредиентов
    const ingredientsRef = collection(db, `users/${userUid}/ingredients`);
    const ingredientNames = ingredients.map((ing) => ing.name);
    const ingredientsQuery = query(
      ingredientsRef,
      where("name", "in", ingredientNames)
    );
    const ingredientsSnapshot = await getDocs(ingredientsQuery);

    const existingIngredientNames = ingredientsSnapshot.docs.map(
      (doc) => doc.data().name
    );
    const newIngredients = ingredients.filter(
      (ing) => !existingIngredientNames.includes(ing.name)
    );

    // Добавляем новые ингредиенты
    for (const newIngredient of newIngredients) {
      await addDoc(ingredientsRef, {
        name: newIngredient.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(
        `Новый ингредиент "${newIngredient.name}" добавлен в коллекцию ингредиентов.`
      );
    }

    // Продолжаем сохранение блюда
    const dishesRef = collection(db, `users/${user.uid}/menu`);
    const dishQuerySnapshot = await getDocs(
      query(
        dishesRef,
        where("name", "==", dishData.name),
        where("category", "==", dishData.category)
      )
    );

    let existingDishId = null;
    dishQuerySnapshot.forEach((doc) => {
      existingDishId = doc.id;
    });

    if (existingDishId) {
      const existingDishDocRef = doc(
        db,
        `users/${user.uid}/menu`,
        existingDishId
      );
      await setDoc(existingDishDocRef, dishData);

      if (dishData.shared) {
        const publicDishData = {
          category: categoryName,
          name: dishName,
          description: dishDescription,
          totalWeight: dishTotalWeight,
          sharedBy: sharedBy,
          ingredients: ingredients.map(({ name, weight, unit }) => ({
            name,
            weight,
            unit,
          })),
        };
        const publicDishDocRef = doc(db, "public_menu", existingDishId);
        await setDoc(publicDishDocRef, publicDishData);
      } else {
        const publicDishDocRef = doc(db, "public_menu", existingDishId);
        await deleteDoc(publicDishDocRef);
      }

      alert(
        "Блюдо с таким именем и категорией уже существует. Обновлено существующее блюдо."
      );
    } else {
      const dishDocRef = doc(collection(db, `users/${user.uid}/menu`));
      await setDoc(dishDocRef, dishData);

      if (dishData.shared) {
        const publicDishData = {
          category: categoryName,
          name: dishName,
          description: dishDescription,
          totalWeight: dishTotalWeight,
          sharedBy: sharedBy,
          ingredients: ingredients.map(({ name, weight, unit }) => ({
            name,
            weight,
            unit,
          })),
        };
        const publicDishDocRef = doc(db, "public_menu", dishDocRef.id);
        await setDoc(publicDishDocRef, publicDishData);
      }

      alert("Блюдо добавлено успешно!");
    }

    if (!categoryExists || newIngredients.length > 0) {
      if (
        confirm(
          "Были добавлены новые категории или ингредиенты. Выполнить синхронизацию коллекций сейчас?"
        )
      ) {
        await syncAllCollections(); // Предполагается, что у вас есть функция синхронизации всех коллекций
      }
    }

    form.reset();
    loadAdminDashboard();
  } catch (error) {
    console.error("Ошибка при сохранении блюда:", error);
    alert(
      "Произошла ошибка при сохранении блюда. Пожалуйста, попробуйте снова."
    );
  }
}

// Функция для удаления блюда
async function deleteDish() {
  const dishId = document.getElementById("load-dish").value;
  const user = auth.currentUser;

  if (!dishId) {
    alert("Пожалуйста, выберите блюдо для удаления.");
    return;
  }

  if (!user) {
    return;
  }

  const confirmation = confirm("Вы уверены, что хотите удалить это блюдо?");

  if (!confirmation) {
    return;
  }

  try {
    const dishDocRef = doc(db, `users/${user.uid}/menu`, dishId);
    const publicDishDocRef = doc(db, "public_menu", dishId);

    await deleteDoc(dishDocRef);
    await deleteDoc(publicDishDocRef);

    alert("Блюдо успешно удалено.");
    loadAdminDashboard();
  } catch (error) {
    console.error("Ошибка при удалении блюда:", error);
    alert("Произошла ошибка при удалении блюда. Пожалуйста, попробуйте снова.");
  }
}

// Вызов функций инициализации
document.addEventListener("DOMContentLoaded", () => {
  addEventListeners();
});

/* -----------------Форма отображения меню с возможностью редактирования цены и удаления--------------------- */

// Показ меню
window.showMenu = async function showMenu() {
  showAdminContent();
  const adminContent = document.getElementById(ADMIN_DASHBOARD_CONTENT_ID);
  adminContent.innerHTML = `
        <div class="show-menu-container">

            <h3 class="page-title">Меню</h3>
            <div id="loading-indicator" style="display: none;">
                <p>Загрузка, пожалуйста подождите...</p>
                <div class="spinner"></div>
            </div>
            <div id="menu-list"></div>
            
            <button class="back-button" onclick="loadAdminDashboard()"><span class="material-icons-outlined">arrow_back</span></button>
        </div>
    `;

  const loadingIndicator = document.getElementById("loading-indicator");
  const menuList = document.getElementById("menu-list");

  // Показываем индикатор загрузки
  loadingIndicator.style.display = "flex";

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userUid = user.uid;

      // Получаем подколлекцию menu для текущего пользователя
      const userMenuRef = collection(db, `users/${userUid}/menu`);
      const querySnapshot = await getDocs(userMenuRef);
      menuList.innerHTML = "";

      // Проверяем, пустое ли меню
      if (querySnapshot.empty) {
        menuList.innerHTML = `
                    <p>Ваше меню пока пусто. <a href="#" onclick="showAddDishForm()">Добавьте первое блюдо!</a></p>
                `;
        return;
      }

      // Организация блюд по категориям
      const categories = {};
      querySnapshot.forEach((doc) => {
        const dish = doc.data();
        const category = dish.category ? dish.category : "Без категории";
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push({ id: doc.id, ...dish });
        console.log("Получено блюдо с сервера:", { id: doc.id, ...dish });
      });

      // Отображение блюд по категориям
      for (const category in categories) {
        const categoryDiv = document.createElement("div");
        categoryDiv.classList.add("category");
        categoryDiv.innerHTML = `<h4>Категория: ${category}</h4>`;
        menuList.appendChild(categoryDiv);

        const dishContainer = document.createElement("div");
        dishContainer.classList.add("dish-container");
        categoryDiv.appendChild(dishContainer);

        categories[category].forEach((dish) => {
          const ingredients =
            Array.isArray(dish.ingredients) && dish.ingredients.length > 0
              ? dish.ingredients.map((ingredient) => ingredient.name).join(", ")
              : "Нет ингредиентов";

          const dishCard = document.createElement("div");
          dishCard.classList.add("dish-card");
          dishCard.innerHTML = `
                    <h5>${dish.name}</h5>
                    <p class="ingredients"> ${ingredients}</p>
                    <p>Вес: ${dish.totalWeight ? dish.totalWeight : "Не указано"
            } гр</p>
                    <div class="price-container">
                        <input type="number" value="${dish.price
            }" class="price-input" data-id="${dish.id
            }" data-original-value="${dish.price}" disabled> руб.
                        <button class="edit-button" aria-label="Редактировать"><span class="material-icons-outlined">edit</span></button>
                        <button class="save-button" data-id="${dish.id
            }" style="display:none" aria-label="Сохранить"><span class="material-icons-outlined">save</span></button>
                        <button class="cancel-button" style="display:none" aria-label="Отменить"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <button class="delete-button" data-id="${dish.id
            }" aria-label="Удалить"><span class="material-icons-outlined">delete</span></button>
                `;

          // Найдем элемент с классом ingredients и добавим атрибут title
          const ingredientElement = dishCard.querySelector(".ingredients");
          ingredientElement.setAttribute(
            "title",
            ingredientElement.textContent.trim()
          );

          dishContainer.appendChild(dishCard);
        });
      }

      // Добавление обработчиков событий для кнопок редактирования, сохранения, отмены и удаления
      document.querySelectorAll(".edit-button").forEach((button) => {
        button.addEventListener("click", handleEditClick);
      });

      document.querySelectorAll(".save-button").forEach((button) => {
        button.addEventListener("click", handleSaveClick);
      });

      document.querySelectorAll(".cancel-button").forEach((button) => {
        button.addEventListener("click", handleCancelClick);
      });

      document.querySelectorAll(".delete-button").forEach((button) => {
        button.addEventListener("click", handleDeleteClick);
      });
    } else {
      console.error("Пользователь не аутентифицирован");
      alert("Пожалуйста, войдите в систему, чтобы просмотреть меню.");
    }
  } catch (error) {
    console.error("Ошибка при загрузке меню:", error);
    alert(`Ошибка при загрузке меню: ${error.message}`);
  } finally {
    // Скрываем индикатор загрузки
    loadingIndicator.style.display = "none";
  }
};

// Функция редактирования цены
function handleEditClick(event) {
  const button = event.currentTarget;
  const priceInput = button
    .closest(".price-container")
    .querySelector(".price-input");
  const saveButton = button
    .closest(".price-container")
    .querySelector(".save-button");
  const cancelButton = button
    .closest(".price-container")
    .querySelector(".cancel-button");

  if (!priceInput || !saveButton || !cancelButton) return;

  // Сохраняем текущее значение цены в атрибут data-original-value
  priceInput.setAttribute("data-original-value", priceInput.value);

  // Разрешаем редактирование поля ввода
  priceInput.disabled = false;

  // Скрываем кнопку "Редактировать" и показываем кнопки "Сохранить" и "Отменить"
  button.style.display = "none";
  saveButton.style.display = "inline";
  cancelButton.style.display = "inline";
}

// Сохранение редактирования
function handleSaveClick(event) {
  const button = event.currentTarget;
  const priceInput = button
    .closest(".price-container")
    .querySelector(".price-input");
  const editButton = button
    .closest(".price-container")
    .querySelector(".edit-button");
  const cancelButton = button
    .closest(".price-container")
    .querySelector(".cancel-button");

  if (!priceInput || !editButton || !cancelButton) return;

  const newPrice = priceInput.value;
  const dishId = button.getAttribute("data-id");

  console.log("Сохранение новой цены:", { dishId, newPrice });

  // Получаем текущего пользователя
  const user = auth.currentUser;
  if (!user) {
    alert("Пользователь не аутентифицирован. Пожалуйста, выполните вход.");
    return;
  }

  // Сохранение новой цены в Firestore в коллекции текущего пользователя
  updateDoc(doc(db, `users/${user.uid}/menu`, dishId), { price: newPrice })
    .then(() => {
      console.log("Цена успешно обновлена:", { dishId, newPrice });
      alert("Цена успешно обновлена");
      priceInput.disabled = true;
      button.style.display = "none";
      cancelButton.style.display = "none";
      editButton.style.display = "inline";
    })
    .catch((error) => {
      console.error("Ошибка при обновлении цены:", error);
      alert(`Ошибка при обновлении цены: ${error.message}`);
    });
}

// Отмена редактирования
function handleCancelClick(event) {
  const button = event.currentTarget;
  const priceInput = button
    .closest(".price-container")
    .querySelector(".price-input");
  const editButton = button
    .closest(".price-container")
    .querySelector(".edit-button");
  const saveButton = button
    .closest(".price-container")
    .querySelector(".save-button");

  if (!priceInput || !editButton || !saveButton) return;

  // Восстановление значения цены из атрибута data-original-value
  const originalValue = priceInput.getAttribute("data-original-value");
  console.log("Отмена редактирования цены, восстановление значения:", {
    originalValue,
  });
  priceInput.value = originalValue;
  priceInput.disabled = true;
  button.style.display = "none";
  saveButton.style.display = "none";
  editButton.style.display = "inline";
}

// Функция удаления блюда
function handleDeleteClick(event) {
  const button = event.currentTarget;
  const dishId = button.getAttribute("data-id");

  const confirmation = confirm("Вы уверены, что хотите удалить это блюдо?");
  if (confirmation) {
    console.log("Удаление блюда:", { dishId });

    // Получаем текущего пользователя
    const user = auth.currentUser;
    if (!user) {
      alert("Пользователь не аутентифицирован. Пожалуйста, выполните вход.");
      return;
    }

    // Удаление блюда из Firestore в коллекции текущего пользователя
    deleteDoc(doc(db, `users/${user.uid}/menu`, dishId))
      .then(() => {
        console.log("Блюдо успешно удалено:", { dishId });
        alert("Блюдо успешно удалено");
        showMenu(); // Обновляем меню после удаления блюда
      })
      .catch((error) => {
        console.error("Ошибка при удалении блюда:", error);
        alert(`Ошибка при удалении блюда: ${error.message}`);
      });
  }
}

/* ----------------Форма подсчета закупок с разбивкой по поставщикам (возможен подсчет на несколько дат)------------------------- */

// Показ формы подсчета закупок
window.showPurchaseCalculationForm = function showPurchaseCalculationForm() {
  showAdminContent();
  const adminContent = document.getElementById(ADMIN_DASHBOARD_CONTENT_ID);
  adminContent.innerHTML = `
    <div class="calculation-form-container">
        <h3 class="page-title">Подсчет закупок</h3>
        <div id="loading-indicator" style="display: none;">
            <p>Загрузка, пожалуйста подождите...</p>
            <div class="spinner"></div>
        </div>
        <form id="purchase-calculation-form">
            <label for="order-select">Выберите заказ:</label>
            <select id="order-select" name="order-select">
                <option value="">Выберите заказ:</option>
                <!-- Динамически добавляемые опции -->
            </select>
            <button type="button" id="load-order-button">Загрузить заказ</button>
            <div id="date-list"></div>
            <button type="button" id="calculate-purchases-button">Рассчитать</button>
            <button type="button" class="back-button" onclick="loadAdminDashboard()"><span class="material-icons-outlined">arrow_back</span></button>
        </form>
        <div id="ingredients-list">
            <!-- Здесь будет отображен список ингредиентов и их вес -->
        </div>
    </div>
    `;

  // Обработчики событий для кнопок
  document
    .getElementById("load-order-button")
    .addEventListener("click", addOrderToList);
  document
    .getElementById("calculate-purchases-button")
    .addEventListener("click", calculatePurchases);

  // Загрузим список заказов в select
  loadOrders();
};

// Функция добавления заказа в список
async function addOrderToList() {
  const orderSelect = document.getElementById("order-select");
  const selectedOrderId = orderSelect.value;

  if (!selectedOrderId) {
    alert("Выберите заказ для добавления.");
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      alert("Пользователь не аутентифицирован.");
      return;
    }

    const userOrdersRef = collection(db, `users/${user.uid}/orders`);
    const docRef = doc(userOrdersRef, selectedOrderId);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      alert("Заказ не найден.");
      return;
    }

    const orderData = docSnapshot.data();
    const dateList = document.getElementById("date-list");
    const formattedDate = orderData.orderDate
      .toDate()
      .toISOString()
      .split("T")[0];

    // Проверка на дублирование даты
    if (
      document.querySelector(
        `.calculation-order-date[data-date="${formattedDate}"]`
      )
    ) {
      alert("Заказы на эту дату уже были добавлены.");
      return;
    }

    // Создание нового элемента для отображения даты и данных о заказчике
    const dateElement = document.createElement("div");
    dateElement.classList.add("calculation-order-date");
    dateElement.setAttribute(
      "data-date",
      orderData.orderDate.toDate().toISOString().split("T")[0]
    );
    dateElement.setAttribute("data-order-id", selectedOrderId); // Добавляем ID заказа
    dateElement.innerHTML = `
            <p><strong>Дата заказа:</strong> ${orderData.orderDate.toDate().toISOString().split("T")[0]
      }</p>
            <p><strong>Имя заказчика:</strong> ${orderData.customerName || "Не указано"
      }</p>
            <p><strong>Телефон заказчика:</strong> ${orderData.customerPhone || "Не указано"
      }</p>
            <button type="button" class="remove-date-button"><span class="material-icons-outlined">delete</span></button>
        `;

    dateElement
      .querySelector(".remove-date-button")
      .addEventListener("click", () => dateElement.remove());
    dateList.appendChild(dateElement);
  } catch (error) {
    console.error("Ошибка при добавлении заказа в список:", error);
    alert(`Ошибка при добавлении заказа: ${error.message}`);
  }
}

// Функция подсчета закупок
async function calculatePurchases() {
  const ingredientsList = document.getElementById("ingredients-list");
  ingredientsList.innerHTML = "<h4>Необходимые ингредиенты и их вес:</h4>";

  const dateElements = document.querySelectorAll(".calculation-order-date");

  if (dateElements.length === 0) {
    alert("Добавьте хотя бы один заказ для расчета.");
    return;
  }

  const ingredientsMap = new Map();

  // Показываем индикатор загрузки
  const loadingIndicator = document.getElementById("loading-indicator");
  loadingIndicator.style.display = "flex";

  try {
    // Получаем текущего пользователя
    const user = auth.currentUser;
    if (!user) {
      alert("Пользователь не аутентифицирован. Пожалуйста, выполните вход.");
      return;
    }

    // Проходим по каждому добавленному заказу
    for (const dateElement of dateElements) {
      const selectedDate = dateElement.getAttribute("data-date");
      const orderId = dateElement.getAttribute("data-order-id"); // Теперь мы добавляем id заказа в data-атрибут

      console.log(`Загрузка заказа с ID: ${orderId} на дату: ${selectedDate}`);

      // Запрос заказа по ID для конкретного пользователя
      const userOrdersRef = collection(db, `users/${user.uid}/orders`);
      const docRef = doc(userOrdersRef, orderId);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        console.warn(`Заказ с ID ${orderId} не найден.`);
        continue;
      }

      const orderData = docSnapshot.data();
      const menuItems = orderData.menuItems;

      console.log(
        `Обработка заказа с ${menuItems.length} элементами меню на дату ${selectedDate}`
      );

      for (const item of menuItems) {
        await getIngredientsForDish(
          user.uid,
          item.name,
          item.quantity,
          ingredientsMap
        );
      }
    }

    // Отображение списка ингредиентов
    displayIngredients(ingredientsMap);
  } catch (error) {
    console.error("Ошибка при расчете закупок:", error);
    alert(`Ошибка при расчете закупок: ${error.message}`);
  } finally {
    // Скрываем индикатор загрузки
    loadingIndicator.style.display = "none";
  }
}

// Функция для получения ингредиентов конкретного блюда
async function getIngredientsForDish(
  userId,
  dishName,
  quantity,
  ingredientsMap
) {
  console.log(`Загрузка ингредиентов для блюда: ${dishName}`);

  // Запрос ингредиентов конкретного блюда из меню пользователя
  const userMenuRef = collection(db, `users/${userId}/menu`);
  const querySnapshot = await getDocs(
    query(userMenuRef, where("name", "==", dishName))
  );

  if (querySnapshot.empty) {
    console.warn(`Блюдо ${dishName} не найдено в меню.`);
    return;
  }

  const dishData = querySnapshot.docs[0].data();
  const ingredients = dishData.ingredients;

  ingredients.forEach((ingredient) => {
    const ingredientName = ingredient.name
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    const weightPerPortion = parseFloat(ingredient.weight);
    const totalWeight = weightPerPortion * quantity;
    const unit = ingredient.unit || "г"; // по умолчанию граммы
    const supplier = ingredient.supplier || "Без поставщика";

    const key = `${supplier}|${ingredientName}|${unit}`;

    if (ingredientsMap.has(key)) {
      const existingWeight = ingredientsMap.get(key);
      ingredientsMap.set(key, existingWeight + totalWeight);
    } else {
      ingredientsMap.set(key, totalWeight);
    }
  });
}

// Функция отображения ингредиентов
function displayIngredients(ingredientsMap) {
  const ingredientsList = document.getElementById("ingredients-list");
  ingredientsList.innerHTML = ""; // Очищаем перед отображением

  if (ingredientsMap.size === 0) {
    ingredientsList.innerHTML += "<p>Ингредиенты не найдены.</p>";
    return;
  }

  const suppliersMap = new Map();

  // Группируем ингредиенты по поставщикам
  ingredientsMap.forEach((totalWeight, key) => {
    const [supplier, ingredientName, unit] = key.split("|");

    if (!suppliersMap.has(supplier)) {
      suppliersMap.set(supplier, []);
    }

    suppliersMap.get(supplier).push({
      ingredientName,
      totalWeight,
      unit,
    });
  });

  // Создаем список ингредиентов для каждого поставщика
  suppliersMap.forEach((ingredients, supplier) => {
    const supplierDiv = document.createElement("div");
    supplierDiv.classList.add("supplier-group");
    const supplierTitle = document.createElement("h4");
    supplierTitle.textContent = `Поставщик: ${supplier}`;
    supplierDiv.appendChild(supplierTitle);

    const ul = document.createElement("ul");
    ingredients.forEach(({ ingredientName, totalWeight, unit }) => {
      let displayWeight = totalWeight;
      if (unit === "г" && totalWeight > 1000) {
        displayWeight = displayWeight / 1000;
        unit = "кг";
      } else if (unit === "мл" && totalWeight > 1000) {
        displayWeight = displayWeight / 1000;
        unit = "л";
      }

      displayWeight =
        displayWeight % 1 === 0 ? displayWeight : displayWeight.toFixed(2);

      const li = document.createElement("li");
      li.textContent = `${capitalizeFirstLetter(
        ingredientName
      )}: ${displayWeight} ${unit}`;
      ul.appendChild(li);
    });

    supplierDiv.appendChild(ul);
    ingredientsList.appendChild(supplierDiv);
  });
}

// Капитализация первой буквы
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/* -------------------Форма оформления / редактирования / удаления заказа (печать заказа)--------------------- */

// Показ формы оформления заказа
window.showOrderForm = function showOrderForm() {
  showAdminContent();
  loadOrders();
  const adminContent = document.getElementById(ADMIN_DASHBOARD_CONTENT_ID);
  adminContent.innerHTML = `
    <div class="show-order-container">
        <h3>Загрузка заказа по дате</h3>
        <div class="order-select-container">
            <label for="order-select">Выберите заказ для редактирования:</label>
            <select id="order-select" name="order-select">
                <option value="">Выберите заказ:</option>
                <!-- Динамически добавляемые опции -->
            </select>
            <button type="button" id="load-order-button"><span class="material-icons-outlined">upload</span></button>
            <button type="button" id="delete-order-button"><span class="material-icons-outlined">delete</span></button>
        </div>

        <h3 class="page-title">Оформление заказа</h3>
        <form id="order-form">
            <div class="order-properties-container">
                <div class="property">
                    <label for="order-date">Дата заказа:</label>
                    <input type="date" id="order-date" name="order-date" required="">
                </div>

                <div class="property">
                    <label for="order-customer-name">Имя заказчика:</label>
                    <input type="text" id="order-customer-name" name="order-customer-name" required="">
                </div>

                <div class="property">
                    <label for="order-customer-phone">Телефон заказчика:</label>
                    <input type="tel" id="order-customer-phone" name="order-customer-phone" required="">
                </div>

                <div class="property">
                    <label for="order-else-properties">Дополнительные данные:</label>
                    <textarea name="order-else-properties" id="order-else-properties" cols="30" rows="5"></textarea>
                </div>
            </div>

            <h4>Бланк заказа</h4>
            <div id="order-blank">
                <!-- Здесь будут добавляться выбранные блюда -->
            </div>

            <div class="container">
                <label for="total-sum">Итоговая сумма заказа:</label>
                <input type="number" id="total-sum" name="total-sum" readonly><span>&nbsp;руб.</span>
            </div>

            <label for="menu-items">Выберите блюдо:</label>
            <select id="menu-items" name="menu-items">
                <option value="">Выберите блюдо</option>
            </select>
            <button type="button" id="add-dish-to-order">Добавить блюдо</button>

            <h4>Дополнительные услуги</h4>
            <div id="additional-services">
                <!-- Здесь будут добавляться дополнительные услуги -->
            </div>
            <button type="button" id="add-service">Добавить услугу</button>

            <div class="container">
                <label for="prepayment">Внесенная предоплата:</label>
                <input type="number" id="prepayment" name="prepayment"><span>&nbsp;руб.</span>
            </div>

            <div class="container">
                <label for="final-sum">Сумма доплаты:</label>
                <input type="number" id="final-sum" name="final-sum" readonly><span>&nbsp;руб.</span>
            </div>

            <button type="button" id="print-order">Распечатать заказ</button>
            <button type="button" id="save-order">Сохранить заказ</button>
            <button type="button" class="back-button" onclick="loadAdminDashboard()"><span class="material-icons-outlined">arrow_back</span></button>
        </form>

        <div id="print-modal" class="modal hidden">
            <div class="modal-content">
                <span class="modal-close-button">&times;</span>
                <div id="print-content"></div>
                <button type="button" id="confirm-print">Печать</button>
            </div>
        </div>
    </div>
    `;

  loadMenuItems();
  document
    .getElementById("add-dish-to-order")
    .addEventListener("click", addDishToOrder);
  document
    .getElementById("add-service")
    .addEventListener("click", addServiceField);
  document
    .getElementById("prepayment")
    .addEventListener("input", updateFinalSum);
  document
    .getElementById("print-order")
    .addEventListener("click", showPrintModal);
  document.getElementById("save-order").addEventListener("click", saveOrder);
  document
    .getElementById("load-order-button")
    .addEventListener("click", loadOrderByDate);
  document
    .getElementById("delete-order-button")
    .addEventListener("click", deleteOrder);
};

// Загрузка заказа по дате и заказчику
let currentOrderId = null; // Переменная для хранения текущего ID заказа

// Загрузка заказа для редактирования
async function loadOrderByDate() {
  const orderSelect = document.getElementById("order-select");
  const selectedOrderId = orderSelect.value;

  if (!selectedOrderId) {
    alert("Выберите заказ для загрузки.");
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      alert("Пользователь не аутентифицирован. Пожалуйста, выполните вход.");
      return;
    }

    // Получаем ссылку на заказ
    const orderRef = doc(db, `users/${user.uid}/orders/${selectedOrderId}`);
    const docSnapshot = await getDoc(orderRef);

    if (!docSnapshot.exists()) {
      alert("Заказ не найден.");
      return;
    }

    const orderData = docSnapshot.data();
    currentOrderId = selectedOrderId; // Сохраняем ID заказа в переменной

    // Заполнение полей формы данными заказа
    document.getElementById("order-date").value = orderData.orderDate
      .toDate()
      .toISOString()
      .split("T")[0];
    document.getElementById("order-customer-name").value =
      orderData.customerName || "";
    document.getElementById("order-customer-phone").value =
      orderData.customerPhone || "";
    document.getElementById("order-else-properties").value =
      orderData.additionalProperties || "";

    // Очищаем и заполняем поля меню и дополнительных услуг
    const orderBlank = document.getElementById("order-blank");
    orderBlank.innerHTML = "";

    // Группировка блюд по категориям
    const categories = {};

    orderData.menuItems.forEach((item) => {
      const category = item.category || "Без категории"; // Если категория не указана, используем "Без категории"

      if (!categories[category]) {
        categories[category] = [];
      }

      categories[category].push(item);
    });

    // Создаем элементы для каждой категории и её блюд
    for (const [category, dishes] of Object.entries(categories)) {
      let categoryContainer = document.createElement("div");
      categoryContainer.classList.add("category-container");
      categoryContainer.setAttribute("data-category", category);

      // Создаем заголовок категории
      const categoryHeader = document.createElement("h3");
      categoryHeader.textContent = category;
      categoryContainer.appendChild(categoryHeader);

      // Добавляем блюда в соответствующий контейнер категории
      dishes.forEach((item) => {
        const orderItem = document.createElement("div");
        orderItem.classList.add("dish-card");
        orderItem.innerHTML = `
                    <p>${item.name}</p>
                    <input type="number" value="${item.quantity}" min="1" class="dish-quantity" data-price="${item.price}">
                    <span>${item.price} руб.</span>
                    <span class="dish-total-price">${item.total} руб.</span>
                    <button type="button" class="remove-button"><span class="material-icons-outlined">delete</span></button>
                `;
        orderItem
          .querySelector(".remove-button")
          .addEventListener("click", () => {
            categoryContainer.removeChild(orderItem);
            if (categoryContainer.children.length === 1) {
              // Если остался только заголовок
              orderBlank.removeChild(categoryContainer);
            }
            updateTotalSum();
          });
        orderItem
          .querySelector(".dish-quantity")
          .addEventListener("input", () => {
            updateDishTotalPrice(orderItem);
            updateTotalSum();
          });
        categoryContainer.appendChild(orderItem);
      });

      orderBlank.appendChild(categoryContainer);
    }

    // Заполнение дополнительных услуг
    const servicesContainer = document.getElementById("additional-services");
    servicesContainer.innerHTML = "";

    orderData.additionalServices.forEach((service) => {
      const serviceDiv = document.createElement("div");
      serviceDiv.classList.add("service");
      serviceDiv.innerHTML = `
                <input type="text" name="service-name" value="${service.name}" required>
                <input type="number" name="service-quantity" value="${service.quantity}" min="1">
                <input type="number" name="service-price" value="${service.price}" required>
                <input type="number" name="service-total" value="${service.total}" readonly>
                <button type="button" class="remove-service"><span class="material-icons-outlined">delete</span></button>
            `;
      serviceDiv
        .querySelector(".remove-service")
        .addEventListener("click", () => {
          serviceDiv.remove();
          updateFinalSum();
        });
      serviceDiv
        .querySelector('input[name="service-quantity"]')
        .addEventListener("input", updateServiceTotal);
      serviceDiv
        .querySelector('input[name="service-price"]')
        .addEventListener("input", updateServiceTotal);
      servicesContainer.appendChild(serviceDiv);
    });

    // Заполнение итоговых данных
    document.getElementById("total-sum").value = orderData.totalSum;
    document.getElementById("prepayment").value = orderData.prepayment;
    document.getElementById("final-sum").value = orderData.finalSum;

    updateFinalSum();
  } catch (error) {
    console.error("Ошибка при загрузке заказа:", error);
    alert(`Ошибка при загрузке заказа: ${error.message}`);
  }
}

// Загрузка списка блюд с группировкой по категориям
window.loadMenuItems = async function loadMenuItems() {
  const menuItemsSelect = document.getElementById("menu-items");

  if (!menuItemsSelect) {
    console.error('Элемент с ID "menu-items" не найден.');
    return;
  }

  try {
    // Получаем текущего пользователя
    const user = auth.currentUser;
    if (!user) {
      alert("Пользователь не аутентифицирован. Пожалуйста, выполните вход.");
      return;
    }

    // Ссылка на меню пользователя
    const userMenuRef = collection(db, `users/${user.uid}/menu`);
    const menuSnapshot = await getDocs(userMenuRef);

    // Очищаем select перед добавлением новых опций
    menuItemsSelect.innerHTML = "";

    // Добавляем плейсхолдер "Выберите блюдо"
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Выберите блюдо";
    placeholderOption.disabled = true; // Отключаем возможность выбора этого пункта
    placeholderOption.selected = true; // Выбираем его по умолчанию
    menuItemsSelect.appendChild(placeholderOption);

    // Группировка блюд по категориям
    const categories = {};

    menuSnapshot.forEach((doc) => {
      const dish = doc.data();
      const category = dish.category || "Без категории"; // Если категория не указана, используем "Без категории"

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({
        id: doc.id,
        name: dish.name,
        price: dish.price,
      });
    });

    // Создаем опции для категорий и добавляем их в select
    for (const [category, dishes] of Object.entries(categories)) {
      if (dishes.length > 0) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = category;

        dishes.forEach((dish) => {
          const option = document.createElement("option");
          // Включаем категорию в JSON-строку
          option.value = JSON.stringify({
            id: dish.id,
            name: dish.name,
            price: dish.price,
            category,
          });
          option.textContent = dish.name;
          optgroup.appendChild(option);
        });

        menuItemsSelect.appendChild(optgroup);
      }
    }
  } catch (error) {
    console.error("Ошибка при получении блюд:", error);
    alert(`Ошибка при получении блюд: ${error.message}`);
  }
};

// Функция для добавления блюда в заказ
function addDishToOrder() {
  const menuItemsSelect = document.getElementById("menu-items");
  const orderBlank = document.getElementById("order-blank");
  const selectedItemValue = menuItemsSelect.value;

  if (!selectedItemValue) {
    alert("Пожалуйста, выберите блюдо.");
    return;
  }

  const selectedItem = JSON.parse(selectedItemValue);

  // Проверяем наличие категории в выбранном пункте
  const category = selectedItem.category
    ? selectedItem.category
    : "Без категории";

  // Проверяем, существует ли контейнер для этой категории
  let categoryContainer = document.querySelector(
    `.category-container[data-category="${category}"]`
  );

  if (!categoryContainer) {
    // Создаем контейнер для категории, если он еще не создан
    categoryContainer = document.createElement("div");
    categoryContainer.classList.add("category-container");
    categoryContainer.setAttribute("data-category", category);

    // Создаем заголовок категории
    const categoryHeader = document.createElement("h3");
    categoryHeader.textContent = category;
    categoryContainer.appendChild(categoryHeader);

    // Добавляем контейнер для блюд этой категории в бланк заказа
    orderBlank.appendChild(categoryContainer);
  }

  // Создаем элемент заказа
  const orderItem = document.createElement("div");
  orderItem.classList.add("order-item");
  orderItem.innerHTML = `
        <div class="dish-card">
            <p>${selectedItem.name}</p>
            <input type="number" value="1" min="1" class="dish-quantity" data-price="${selectedItem.price}">
            <span>${selectedItem.price} руб.</span>
            <span class="dish-total-price">${selectedItem.price} руб.</span>
            <button type="button" class="remove-button"><span class="material-icons-outlined">delete</span></button>
        </div>
    `;
  updateTotalSum();
  // Добавляем обработчик для удаления блюда из заказа
  orderItem.querySelector(".remove-button").addEventListener("click", () => {
    categoryContainer.removeChild(orderItem);
    // Если категория пустая, удаляем контейнер
    if (categoryContainer.children.length === 1) {
      // только заголовок остался
      orderBlank.removeChild(categoryContainer);
    }
    updateTotalSum();
  });

  // Добавляем обработчик для изменения количества блюда
  orderItem.querySelector(".dish-quantity").addEventListener("input", () => {
    updateDishTotalPrice(orderItem);
    updateTotalSum();
  });

  // Добавляем блюдо в соответствующий контейнер категории
  categoryContainer.appendChild(orderItem);
  updateTotalSum();
}

// Обновление итоговой суммы заказа
function updateTotalSum() {
  const orderItems = document.querySelectorAll(".order-item");
  let totalSum = 0;

  orderItems.forEach((item) => {
    const quantity =
      parseFloat(item.querySelector(".dish-quantity").value) || 0;
    const price =
      parseFloat(
        item.querySelector(".dish-quantity").getAttribute("data-price")
      ) || 0;
    const totalPrice = (quantity * price).toFixed(2);
    item.querySelector(".dish-total-price").textContent = `${totalPrice} руб.`;
    totalSum += parseFloat(totalPrice);
  });

  document.getElementById("total-sum").value = totalSum.toFixed(2);
  updateFinalSum();
}

// Обновление итоговой суммы блюда
function updateDishTotalPrice(orderItem) {
  const quantity =
    parseFloat(orderItem.querySelector(".dish-quantity").value) || 0;
  const price =
    parseFloat(
      orderItem.querySelector(".dish-quantity").getAttribute("data-price")
    ) || 0;
  const totalPrice = (quantity * price).toFixed(2);
  orderItem.querySelector(
    ".dish-total-price"
  ).textContent = `${totalPrice} руб.`;

  updateTotalSum();
}

// Добавление дополнительной услуги
function addServiceField() {
  const servicesContainer = document.getElementById("additional-services");

  const serviceDiv = document.createElement("div");
  serviceDiv.classList.add("service");
  serviceDiv.innerHTML = `
        <input type="text" name="service-name" placeholder="Название услуги" required>
        <input type="number" name="service-quantity" placeholder="Количество" value="1" min="1">
        <input type="number" name="service-price" placeholder="Цена" required>
        <input type="number" name="service-total" placeholder="Итоговая сумма" readonly>
        <button type="button" class="remove-service"><span class="material-icons-outlined">delete</span></button>
    `;

  serviceDiv.querySelector(".remove-service").addEventListener("click", () => {
    serviceDiv.remove();
    updateFinalSum();
  });

  serviceDiv
    .querySelector('input[name="service-quantity"]')
    .addEventListener("input", updateServiceTotal);
  serviceDiv
    .querySelector('input[name="service-price"]')
    .addEventListener("input", updateServiceTotal);

  servicesContainer.appendChild(serviceDiv);
}

// Обновление итоговой суммы услуги
function updateServiceTotal(event) {
  const serviceDiv = event.target.closest(".service");
  const quantity =
    parseFloat(
      serviceDiv.querySelector('input[name="service-quantity"]').value
    ) || 0;
  const price =
    parseFloat(serviceDiv.querySelector('input[name="service-price"]').value) ||
    0;
  const total = (quantity * price).toFixed(2);
  serviceDiv.querySelector('input[name="service-total"]').value = total;

  updateFinalSum();
}

// Обновление окончательной суммы заказа
function updateFinalSum() {
  const totalSum = parseFloat(document.getElementById("total-sum").value) || 0;
  const prepayment =
    parseFloat(document.getElementById("prepayment").value) || 0;
  let additionalServicesTotal = 0;

  const services = document.querySelectorAll(".service");
  services.forEach((service) => {
    additionalServicesTotal +=
      parseFloat(service.querySelector('input[name="service-total"]').value) ||
      0;
  });

  const finalSum = (totalSum + additionalServicesTotal - prepayment).toFixed(2);
  document.getElementById("final-sum").value = finalSum;
}

// Показ модального окна для печати
function showPrintModal() {
  const printContent = generatePrintContent(); // Генерируем контент для печати
  const printModal = document.getElementById("print-modal");
  const printContentContainer = document.getElementById("print-content");

  printContentContainer.innerHTML = printContent; // Вставляем сгенерированный контент в модальное окно
  printModal.classList.remove("hidden"); // Удаляем класс 'hidden', чтобы показать модальное окно

  // Обработчик закрытия модального окна
  const closeModalButton = document.querySelector(".modal-close-button");
  closeModalButton.addEventListener("click", () => {
    printModal.classList.add("hidden"); // Добавляем класс 'hidden', чтобы скрыть модальное окно
  });

  const confirmPrintButton = document.getElementById("confirm-print");
  confirmPrintButton.addEventListener("click", () => {
    printElement(printContent); // Передаем сгенерированный контент в функцию печати
    printModal.classList.add("hidden"); // Скрываем модальное окно после печати
  });
}

// Функция для печати переданного HTML-контента
function printElement(content) {
  const printWindow = window.open("", "", "height=600,width=800");

  // Генерируем HTML-документ для печати
  printWindow.document.write(`
        <html>
            <head>
                <title>Печать заказа</title>
                <style>
                    /* Стили для печати */
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    h3, h4, h5 {
                        margin: 0;
                        padding: 5px 0;
                    }
                    ul {
                        list-style-type: none;
                        padding: 0;
                    }
                    li {
                        padding: 5px 0;
                    }
                    p {
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
        </html>
    `);

  printWindow.document.close(); // Закрываем поток записи
  printWindow.focus(); // Устанавливаем фокус на новое окно
  printWindow.print(); // Запускаем печать
  printWindow.close(); // Закрываем окно после печати
}

// Генерация контента для печати
function generatePrintContent() {
  const orderDate = document.getElementById("order-date").value;
  const customerName = document.getElementById("order-customer-name").value;
  const customerPhone = document.getElementById("order-customer-phone").value;
  const elseProperties = document.getElementById("order-else-properties").value;
  const totalSum = parseFloat(
    document.getElementById("total-sum").value
  ).toFixed(2);
  const prepayment = parseFloat(
    document.getElementById("prepayment").value
  ).toFixed(2);
  const finalSum = parseFloat(
    document.getElementById("final-sum").value
  ).toFixed(2);

  let printContent = `
        <h3>Заказ на дату: ${orderDate}</h3>
        <h4>Заказчик: ${customerName} <> ${customerPhone}</h4>
        <h5>Примечания: ${elseProperties}</h5>
        <h4>Бланк заказа:</h4>
    `;

  // Находим все контейнеры категорий
  const categoryContainers = document.querySelectorAll(".category-container");

  // Перебираем каждый контейнер категории для извлечения пунктов заказа
  categoryContainers.forEach((container) => {
    const categoryName = container.getAttribute("data-category");
    printContent += `<h5>${categoryName}</h5><ul>`; // Добавляем название категории как подзаголовок

    const orderItems = container.querySelectorAll(".order-item");
    orderItems.forEach((item) => {
      const dishName = item.querySelector("p").textContent;
      const quantity = item.querySelector(".dish-quantity").value;
      const totalPrice = item.querySelector(".dish-total-price").textContent;
      printContent += `<li>${dishName} &nbsp;&nbsp;&nbsp;&nbsp; ${quantity} шт. &nbsp;&nbsp;&nbsp;&nbsp; ${totalPrice}</li>`;
    });

    printContent += "</ul>"; // Закрываем список блюд в категории
  });

  printContent += `
        </br>
        <p>Итоговая сумма заказа: ${totalSum} руб.</p>
        </br>
        <h4>Дополнительные услуги:</h4>
        <ul>
    `;

  const services = document.querySelectorAll(".service");
  services.forEach((service) => {
    const serviceName = service.querySelector(
      'input[name="service-name"]'
    ).value;
    const quantity = service.querySelector(
      'input[name="service-quantity"]'
    ).value;
    const total =
      parseFloat(
        service.querySelector('input[name="service-total"]').value
      ).toFixed(2) + " руб.";
    printContent += `<li>${serviceName} &nbsp;&nbsp;&nbsp;&nbsp; кол-во: ${quantity} &nbsp;&nbsp;&nbsp;&nbsp; ${total}</li>`;
  });

  printContent += `
        </ul>
        </br></br>
        <p>Внесенная предоплата: ${prepayment} руб.</p>
        <p>Итоговая сумма с учетом услуг и предоплаты: ${finalSum} руб.</p>
    `;

  return printContent;
}

// Сохранение заказа (нового или существующего)
async function saveOrder() {
  const orderDate = new Date(document.getElementById("order-date").value);
  const totalSum = parseFloat(document.getElementById("total-sum").value) || 0;
  const prepayment =
    parseFloat(document.getElementById("prepayment").value) || 0;
  const finalSum = parseFloat(document.getElementById("final-sum").value) || 0;

  const orderData = {
    orderDate: Timestamp.fromDate(orderDate),
    customerName: document.getElementById("order-customer-name").value,
    customerPhone: document.getElementById("order-customer-phone").value,
    additionalProperties: document.getElementById("order-else-properties")
      .value,
    menuItems: [], // Здесь соберите данные всех блюд из формы
    additionalServices: [], // Здесь соберите данные всех дополнительных услуг из формы
    totalSum: totalSum,
    prepayment: prepayment,
    finalSum: finalSum,
  };

  // Собираем данные меню
  document
    .querySelectorAll(".category-container")
    .forEach((categoryContainer) => {
      const category = categoryContainer.getAttribute("data-category");
      categoryContainer.querySelectorAll(".order-item").forEach((orderItem) => {
        const name = orderItem.querySelector("p").textContent;
        const quantity =
          parseFloat(orderItem.querySelector(".dish-quantity").value) || 0;
        const price =
          parseFloat(
            orderItem.querySelector(".dish-quantity").getAttribute("data-price")
          ) || 0;
        const total =
          parseFloat(
            orderItem.querySelector(".dish-total-price").textContent
          ) || 0;
        orderData.menuItems.push({ category, name, quantity, price, total });
      });
    });

  // Собираем данные дополнительных услуг
  document.querySelectorAll(".service").forEach((serviceDiv) => {
    const name = serviceDiv.querySelector('input[name="service-name"]').value;
    const quantity =
      parseFloat(
        serviceDiv.querySelector('input[name="service-quantity"]').value
      ) || 0;
    const price =
      parseFloat(
        serviceDiv.querySelector('input[name="service-price"]').value
      ) || 0;
    const total =
      parseFloat(
        serviceDiv.querySelector('input[name="service-total"]').value
      ) || 0;
    orderData.additionalServices.push({ name, quantity, price, total });
  });

  try {
    // Получаем текущего пользователя
    const user = auth.currentUser;
    if (!user) {
      alert("Пользователь не аутентифицирован. Пожалуйста, выполните вход.");
      return;
    }

    const userOrdersRef = collection(db, `users/${user.uid}/orders`);

    if (currentOrderId) {
      // Если есть ID заказа, обновляем существующий заказ
      await updateDoc(doc(userOrdersRef, currentOrderId), orderData);
    } else {
      // Если ID нет, создаем новый заказ
      await addDoc(userOrdersRef, orderData);
    }
    alert("Заказ успешно сохранен.");
  } catch (error) {
    console.error("Ошибка при сохранении заказа:", error);
    alert(`Ошибка при сохранении заказа: ${error.message}`);
  }
  loadOrders();
}

// Загрузка заказов в выпадающий список
async function loadOrders() {
  try {
    const user = auth.currentUser;
    if (!user) {
      alert("Пользователь не аутентифицирован.");
      return;
    }

    const userOrdersRef = collection(db, `users/${user.uid}/orders`);
    const currentDate = new Date();
    const oneMonthAgo = new Date(
      currentDate.setMonth(currentDate.getMonth() - 1)
    );
    const oneMonthAgoTimestamp = Timestamp.fromDate(oneMonthAgo);

    // Запрашиваем заказы за последний месяц
    const querySnapshot = await getDocs(
      query(userOrdersRef, where("orderDate", ">=", oneMonthAgoTimestamp))
    );

    const orderSelect = document.getElementById("order-select");
    orderSelect.innerHTML = '<option value="">Выберите заказ:</option>'; // Очищаем старые опции

    const ordersByDate = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.orderDate.toDate(); // Преобразуем Timestamp в Date
      const date = timestamp.toISOString().split("T")[0]; // Преобразуем Date в строку формата YYYY-MM-DD

      if (!ordersByDate[date]) {
        ordersByDate[date] = [];
      }
      ordersByDate[date].push({
        id: doc.id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
      });
    });

    // Генерация опций для селекта
    Object.keys(ordersByDate)
      .sort()
      .forEach((date) => {
        const group = document.createElement("optgroup");
        group.label = date;
        ordersByDate[date].forEach((order) => {
          const option = document.createElement("option");
          option.value = order.id;
          option.textContent = `${order.customerName} (${order.customerPhone})`;
          group.appendChild(option);
        });
        orderSelect.appendChild(group);
      });
  } catch (error) {
    console.error("Ошибка при загрузке заказов:", error);
    alert(`Ошибка при загрузке заказов: ${error.message}`);
  }
}

// Удаление заказа
async function deleteOrder() {
  const selectedOrderId = document.getElementById("order-select").value;
  if (!selectedOrderId) {
    alert("Выберите заказ для удаления.");
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      alert("Пользователь не аутентифицирован.");
      return;
    }

    const userOrdersRef = collection(db, `users/${user.uid}/orders`);
    await deleteDoc(doc(userOrdersRef, selectedOrderId));
    alert("Заказ успешно удален.");

    loadOrders(); // Перезагружаем список заказов
  } catch (error) {
    console.error("Ошибка при удалении заказа:", error);
    alert(`Ошибка при удалении заказа: ${error.message}`);
  }
}

window.loadOrders = loadOrders;

/* ---------------------Форма добавления / редактирования / удаления коллекций-------------------------- */

// Получить данные из localStorage по ключу
function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Сохранить данные в localStorage
function setToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Функция для проверки дубликатов и удаления повторяющихся элементов
function removeDuplicates(dataArray, key = "name") {
  const uniqueData = dataArray.filter(
    (value, index, self) =>
      index === self.findIndex((item) => item[key] === value[key])
  );
  return uniqueData;
}

// Синхронизация коллекций (Firestore -> localStorage)
async function syncCollectionFromFirestore(collectionType) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Пользователь не аутентифицирован. Пожалуйста, выполните вход.");
      return;
    }

    const userUid = user.uid;
    let collectionRef;
    let localStorageKey = `collection_${collectionType}_${userUid}`;

    // Определяем коллекцию в зависимости от типа
    switch (collectionType) {
      case "suppliers":
        collectionRef = collection(db, `users/${userUid}/suppliers`);
        break;
      case "categories":
        collectionRef = collection(db, `users/${userUid}/categories`);
        break;
      case "services":
        collectionRef = collection(db, `users/${userUid}/services`);
        break;
      case "ingredients":
        collectionRef = collection(db, `users/${userUid}/ingredients`);
        break;
      default:
        console.error("Неверный тип коллекции.");
        return;
    }

    // Загружаем данные из Firestore
    const collectionSnapshot = await getDocs(collectionRef);
    const collectionData = collectionSnapshot.docs.map((doc) => {
      const data = doc.data();

      // Для поставщиков сохраняем phone и address, для остальных только name
      if (collectionType === "suppliers") {
        return {
          id: doc.id,
          name: data.name,
          phone: data.phone,
          address: data.address,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      } else {
        return {
          id: doc.id,
          name: data.name,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      }
    });

    // Удаление дубликатов перед сохранением в localStorage
    const uniqueCollectionData = removeDuplicates(collectionData);

    // Сохраняем данные в localStorage
    setToLocalStorage(localStorageKey, uniqueCollectionData);

    console.log(
      `Коллекция ${collectionType} синхронизирована с Firestore и сохранена в localStorage`
    );
  } catch (error) {
    console.error(`Ошибка при синхронизации ${collectionType}:`, error);
  }
}

// Вызов синхронизации для всех коллекций
async function syncAllCollections() {
  await syncCollectionFromFirestore("suppliers");
  await syncCollectionFromFirestore("categories");
  await syncCollectionFromFirestore("services");
  await syncCollectionFromFirestore("ingredients");
  alert("Синхронизация всех коллекций завершена!");
}

// Функция для отображения коллекций поставщиков, категорий и дополнительных услуг
async function showCollections(collectionType) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Пользователь не аутентифицирован. Пожалуйста, выполните вход.");
      return;
    }

    const userUid = user.uid;
    let localStorageKey = `collection_${collectionType}_${userUid}`;

    // Берем данные из localStorage
    const collectionData = getFromLocalStorage(localStorageKey);

    if (!collectionData) {
      alert(
        `Данные ${collectionType} не найдены в localStorage. Пожалуйста, выполните синхронизацию.`
      );
      return;
    }

    const collectionContent = document.getElementById("collection-content");
    let title;

    // Устанавливаем заголовок в зависимости от типа коллекции
    switch (collectionType) {
      case "suppliers":
        title = "Список поставщиков";
        break;
      case "categories":
        title = "Список категорий";
        break;
      case "services":
        title = "Дополнительные услуги";
        break;
      case "ingredients":
        title = "Ингредиенты";
        break;
    }

    // Формируем HTML-контент для отображения
    collectionContent.innerHTML = `
            <div class="${collectionType}-list">
                <h2>${title}</h2>
                <ul id="${collectionType}-ul">
                    ${collectionData
        .map(
          (item) => `
                        <li>
                            <strong>${item.name || "Не указано"}</strong> <br>
                            ${collectionType === "suppliers"
              ? `
                                Телефон: ${item.phone || "Не указан"} <br>
                                Адрес: ${item.address || "Не указан"} <br>
                            `
              : ""
            }
                            <button data-id="${item.id
            }" class="edit-${collectionType}-btn">
                                <span class="material-icons-outlined">edit</span>
                            </button>
                            <button data-id="${item.id
            }" class="delete-${collectionType}-btn">
                                <span class="material-icons-outlined">delete</span>
                            </button>
                        </li>
                    `
        )
        .join("")}
                </ul>
                <button class="add-${collectionType}-btn" onclick="showAddForm('${collectionType}')">
                    <span class="material-icons-outlined">add</span> Добавить элемент
                </button>
            </div>
            `;

    // Добавляем обработчики для кнопок редактирования и удаления
    const editButtons = document.querySelectorAll(
      `.edit-${collectionType}-btn`
    );
    editButtons.forEach((button) =>
      button.addEventListener("click", (event) =>
        handleCollectionsEditClick(event, collectionType)
      )
    );

    const deleteButtons = document.querySelectorAll(
      `.delete-${collectionType}-btn`
    );
    deleteButtons.forEach((button) =>
      button.addEventListener("click", (event) =>
        handleCollectionsDeleteClick(event, collectionType)
      )
    );
  } catch (error) {
    console.error(`Ошибка при загрузке ${collectionType}:`, error);
    alert(`Ошибка при загрузке ${collectionType}: ${error.message}`);
  }
}

// Функция для отображения формы добавления нового элемента
function showAddForm(collectionType) {
  const collectionContent = document.getElementById("collection-content");

  // Генерируем дополнительные поля для коллекции "Поставщики"
  const additionalFields =
    collectionType === "suppliers"
      ? `
        <label for="suppliersPhone">Телефон:</label>
        <input type="text" id="suppliersPhone" name="suppliersPhone" required>
        
        <label for="suppliersAddress">Адрес:</label>
        <input type="text" id="suppliersAddress" name="suppliersAddress" required>
    `
      : "";

  const collectionTitles = {
    suppliers: "поставщики",
    categories: "категории",
    services: "дополнительные услуги",
    ingredients: "ингредиенты",
  };

  const titleInRussian = collectionTitles[collectionType] || "Элемент";

  // Отображаем форму для добавления элемента коллекции
  collectionContent.innerHTML = `
        <div class="add-${collectionType}-form-container">
            <h2>Добавить элемент в коллекцию ${titleInRussian}</h2>
            <form id="add-${collectionType}-form">
                <label for="${collectionType}Name">Название:</label>
                <input type="text" id="${collectionType}Name" name="${collectionType}Name" required>

                ${additionalFields}
                
                <button type="submit"><span class="material-icons-outlined">save</span> Сохранить</button>
            </form>
            <button class="back-button" onclick="showCollections('${collectionType}')">Назад</button>
        </div>
    `;

  const formContainer = document.querySelector(
    ".add-" + collectionType + "-form-container"
  );
  formContainer.style.position = "relative";

  // Обрабатываем отправку формы
  const addForm = document.getElementById(`add-${collectionType}-form`);
  addForm.addEventListener("submit", (event) =>
    handleCollectionsAddItem(event, collectionType)
  );
}

// Обработчик добавления нового элемента в коллекцию
async function handleCollectionsAddItem(event, collectionType) {
  event.preventDefault();

  const itemName = document.getElementById(`${collectionType}Name`).value;
  const itemPhone =
    collectionType === "suppliers"
      ? document.getElementById("suppliersPhone").value
      : null;
  const itemAddress =
    collectionType === "suppliers"
      ? document.getElementById("suppliersAddress").value
      : null;

  if (!itemName) {
    alert("Пожалуйста, введите название.");
    return;
  }

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Пользователь не аутентифицирован. Пожалуйста, выполните вход.");
      return;
    }

    const userUid = user.uid;
    let collectionRef;
    let localStorageKey = `collection_${collectionType}_${userUid}`;

    // Определяем коллекцию в зависимости от типа
    switch (collectionType) {
      case "suppliers":
        collectionRef = collection(db, `users/${userUid}/suppliers`);
        break;
      case "categories":
        collectionRef = collection(db, `users/${userUid}/categories`);
        break;
      case "services":
        collectionRef = collection(db, `users/${userUid}/services`);
        break;
      case "ingredients":
        collectionRef = collection(db, `users/${userUid}/ingredients`);
        break;
    }

    // Данные для добавления
    const newItem = {
      name: itemName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (collectionType === "suppliers") {
      newItem.phone = itemPhone;
      newItem.address = itemAddress;
    }

    // Добавляем элемент в Firestore
    const newDoc = await addDoc(collectionRef, newItem);

    // Добавляем элемент в localStorage
    const cachedData = getFromLocalStorage(localStorageKey) || [];
    cachedData.push({ id: newDoc.id, ...newItem });
    setToLocalStorage(localStorageKey, cachedData);

    alert("Элемент успешно добавлен!");
    showCollections(collectionType); // Обновляем список
  } catch (error) {
    console.error(`Ошибка при добавлении элемента в ${collectionType}:`, error);
    alert(
      `Ошибка при добавлении элемента в ${collectionType}: ${error.message}`
    );
  }
}

// Обработчик удаления элемента из коллекции
async function handleCollectionsDeleteClick(event, collectionType) {
  const itemId = event.target.closest("button").getAttribute("data-id");

  if (!itemId) {
    alert("ID элемента не найден.");
    return;
  }

  if (!confirm("Вы уверены, что хотите удалить этот элемент?")) {
    return;
  }

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Пользователь не аутентифицирован. Пожалуйста, выполните вход.");
      return;
    }

    const userUid = user.uid;
    let docRef;
    let localStorageKey = `collection_${collectionType}_${userUid}`;

    // Определяем документ в зависимости от типа коллекции и ID элемента
    switch (collectionType) {
      case "suppliers":
        docRef = doc(db, `users/${userUid}/suppliers`, itemId);
        break;
      case "categories":
        docRef = doc(db, `users/${userUid}/categories`, itemId);
        break;
      case "services":
        docRef = doc(db, `users/${userUid}/services`, itemId);
        break;
      case "ingredients":
        docRef = doc(db, `users/${userUid}/ingredients`, itemId);
        break;
    }

    // Удаляем элемент из Firestore
    await deleteDoc(docRef);

    // Удаляем элемент из localStorage
    const cachedData = getFromLocalStorage(localStorageKey) || [];
    const updatedData = cachedData.filter((item) => item.id !== itemId);
    setToLocalStorage(localStorageKey, updatedData);

    alert("Элемент успешно удален!");
    showCollections(collectionType); // Обновляем список
  } catch (error) {
    console.error(`Ошибка при удалении элемента из ${collectionType}:`, error);
    alert(
      `Ошибка при удалении элемента из ${collectionType}: ${error.message}`
    );
  }
}

// Обработчик редактирования элемента
async function handleCollectionsEditClick(event, collectionType) {
  const button = event.currentTarget;
  const itemId = button.getAttribute("data-id");

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Пользователь не аутентифицирован. Пожалуйста, выполните вход.");
      return;
    }

    const userUid = user.uid;
    let collectionDocRef;

    // Определяем документ коллекции в зависимости от типа
    switch (collectionType) {
      case "suppliers":
        collectionDocRef = doc(db, `users/${userUid}/suppliers`, itemId);
        break;
      case "categories":
        collectionDocRef = doc(db, `users/${userUid}/categories`, itemId);
        break;
      case "services":
        collectionDocRef = doc(db, `users/${userUid}/services`, itemId);
        break;
    }

    const docSnapshot = await getDoc(collectionDocRef);
    if (docSnapshot.exists()) {
      const item = docSnapshot.data();
      showEditForm(itemId, collectionType, item);
    } else {
      alert("Элемент не найден.");
    }
  } catch (error) {
    console.error(
      `Ошибка при загрузке данных элемента из ${collectionType}:`,
      error
    );
    alert(
      `Ошибка при загрузке данных элемента из ${collectionType}: ${error.message}`
    );
  }
}

// Функция для отображения формы редактирования элемента
function showEditForm(itemId, collectionType, itemData) {
  const collectionContent = document.getElementById("collection-content");

  // Генерируем дополнительные поля для коллекции "Поставщики"
  const additionalFields =
    collectionType === "suppliers"
      ? `
        <label for="suppliersPhone">Телефон:</label>
        <input type="text" id="suppliersPhone" name="suppliersPhone" value="${itemData.phone || ""
      }" required>
        
        <label for="suppliersAddress">Адрес:</label>
        <input type="text" id="suppliersAddress" name="suppliersAddress" value="${itemData.address || ""
      }" required>
    `
      : "";

  const collectionTitles = {
    suppliers: "поставщик",
    categories: "категория",
    services: "дополнительная услуга",
    ingredients: "ингредиент",
  };

  const titleInRussian = collectionTitles[collectionType] || "элемент";

  // Отображаем форму для редактирования элемента коллекции
  collectionContent.innerHTML = `
        <div class="edit-${collectionType}-form-container">
            <h2>Редактировать ${titleInRussian}</h2>
            <form id="edit-${collectionType}-form">
                <label for="name">Название:</label>
                <input type="text" id="name" name="name" value="${itemData.name || ""
    }" required>
                
                ${additionalFields}
                
                <button type="submit"><span class="material-icons-outlined">save</span> Сохранить</button>
            </form>
            <button class="back-button" onclick="showCollections('${collectionType}')">Назад</button>
        </div>
    `;

  // Обрабатываем отправку формы редактирования
  const editForm = document.getElementById(`edit-${collectionType}-form`);
  editForm.addEventListener("submit", (event) =>
    handleCollectionsUpdateItem(event, collectionType, itemId)
  );
}

// Обработчик обновления элемента в коллекции
async function handleCollectionsUpdateItem(event, collectionType, itemId) {
  event.preventDefault();

  const itemName = document.getElementById("name").value;
  const itemPhone =
    collectionType === "suppliers"
      ? document.getElementById("suppliersPhone").value
      : null;
  const itemAddress =
    collectionType === "suppliers"
      ? document.getElementById("suppliersAddress").value
      : null;

  if (!itemName) {
    alert("Пожалуйста, введите название.");
    return;
  }

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Пользователь не аутентифицирован. Пожалуйста, выполните вход.");
      return;
    }

    const userUid = user.uid;
    let docRef;
    let localStorageKey = `collection_${collectionType}_${userUid}`;

    // Определяем документ в зависимости от типа коллекции и ID элемента
    switch (collectionType) {
      case "suppliers":
        docRef = doc(db, `users/${userUid}/suppliers`, itemId);
        break;
      case "categories":
        docRef = doc(db, `users/${userUid}/categories`, itemId);
        break;
      case "services":
        docRef = doc(db, `users/${userUid}/services`, itemId);
        break;
      case "ingredients":
        docRef = doc(db, `users/${userUid}/ingredients`, itemId);
        break;
    }

    // Данные для обновления
    const updatedItem = {
      name: itemName,
      updatedAt: new Date(),
    };

    if (collectionType === "suppliers") {
      updatedItem.phone = itemPhone;
      updatedItem.address = itemAddress;
    }

    // Обновляем данные в Firestore
    await updateDoc(docRef, updatedItem);

    // Обновляем данные в localStorage
    const cachedData = getFromLocalStorage(localStorageKey) || [];
    const itemIndex = cachedData.findIndex((item) => item.id === itemId);
    cachedData[itemIndex] = { id: itemId, ...updatedItem };
    setToLocalStorage(localStorageKey, cachedData);

    alert("Элемент успешно обновлен!");
    showCollections(collectionType); // Обновляем список
  } catch (error) {
    console.error(`Ошибка при обновлении элемента в ${collectionType}:`, error);
    alert(
      `Ошибка при обновлении элемента в ${collectionType}: ${error.message}`
    );
  }
}

// Функция для отображения выбора коллекций
export async function showCollectionButtons() {
  showAdminContent(); // Загружаем основное содержимое админ-панели
  const adminContent = document.getElementById("admin-dashboard-content");

  // Добавляем кнопки для выбора коллекций как вкладки
  adminContent.innerHTML = `
        <button id="update-collections-btn" class="update-btn">
            <span class="material-symbols-outlined">sync</span>
        </button>
        <div id="collection-tabs">
            <button id="show-suppliers-btn" class="tab-button active-tab">Поставщики</button>
            <button id="show-categories-btn" class="tab-button">Категории</button>
            <button id="show-services-btn" class="tab-button">Дополнительные услуги</button>
            <button id="show-ingredients-btn" class="tab-button">Ингредиенты</button>
        </div>
        <div id="collection-content">
            <!-- Здесь будут отображаться элементы коллекций -->
        </div>
        <button type="button" class="back-button" onclick="loadAdminDashboard()">
            <span class="material-icons-outlined">arrow_back</span>
        </button>
    `;

  document
    .getElementById("update-collections-btn")
    .addEventListener("click", async () => {
      syncAllCollections();
    });

  // Получаем кнопки для выбора коллекций
  const showSuppliersBtn = document.getElementById("show-suppliers-btn");
  const showCategoriesBtn = document.getElementById("show-categories-btn");
  const showServicesBtn = document.getElementById("show-services-btn");
  const showIngredientsBtn = document.getElementById("show-ingredients-btn");

  // Добавляем обработчики событий для каждой кнопки
  showSuppliersBtn.addEventListener("click", () =>
    switchTab("suppliers", showSuppliersBtn)
  );
  showCategoriesBtn.addEventListener("click", () =>
    switchTab("categories", showCategoriesBtn)
  );
  showServicesBtn.addEventListener("click", () =>
    switchTab("services", showServicesBtn)
  );
  showIngredientsBtn.addEventListener("click", () =>
    switchTab("ingredients", showIngredientsBtn)
  );

  // По умолчанию отображаем вкладку "Поставщики"
  showCollections("suppliers");
}

// Функция переключения вкладок
function switchTab(collectionType, activeButton) {
  // Убираем класс активной вкладки у всех кнопок
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => button.classList.remove("active-tab"));

  // Добавляем класс активной вкладки выбранной кнопке
  activeButton.classList.add("active-tab");

  // Отображаем выбранную коллекцию
  showCollections(collectionType);
}

// Добавление функций в глобалную область видимости
window.showCollectionButtons = showCollectionButtons;
window.showAddForm = showAddForm;
window.showCollections = showCollections;