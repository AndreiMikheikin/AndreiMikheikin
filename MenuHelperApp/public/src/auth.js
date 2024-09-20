//auth.js

// Импорт необходимых модулей из Firebase
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { showWelcomeModal, getLoggersName, auth, db } from '../src/main.js';
import { loadAdminDashboard, showAdminContent } from "./admin.js";

// Валидация формы регистрации
function validateForm() {
    const isRegistration = document.getElementById('form-title').textContent === 'Регистрация';

    const loggersName = isRegistration ? document.getElementById('loggersName').value : '';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const role = document.getElementById('role').value;

    const isLoggersNameValid = isRegistration ? loggersName !== '' : true;
    const isEmailValid = email !== '';
    const isPasswordValid = password !== '';
    const isRoleSelected = role !== '';

    // Проверка требований к паролю
    const isLengthValid = password.length >= 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const doPasswordsMatch = password === confirmPassword;

    const areRequirementsMet = isLengthValid && hasLowercase && hasUppercase && hasNumber && doPasswordsMatch;

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = isRegistration 
        ? !(isLoggersNameValid && isEmailValid && isPasswordValid && isRoleSelected && areRequirementsMet) 
        : !(isEmailValid && isPasswordValid);

    submitBtn.classList.toggle('active', !submitBtn.disabled);

    document.getElementById('password-requirements').style.display = isRegistration ? 'block' : 'none';

    // Обновление статуса проверки требований к паролю
    toggleCheckMark('length-check', isLengthValid);
    toggleCheckMark('lowercase-check', hasLowercase);
    toggleCheckMark('uppercase-check', hasUppercase);
    toggleCheckMark('number-check', hasNumber);
    toggleCheckMark('match-check', doPasswordsMatch);
}

// Функция для отображения и скрытия галочек
function toggleCheckMark(id, condition) {
    const checkMark = document.getElementById(id).querySelector('.check');
    checkMark.style.display = condition ? 'inline-block' : 'none';
}

// Выбор роли пользователя
function selectRole(role) {
    document.getElementById('role').value = role;

    document.getElementById('admin-role-btn').classList.toggle('selected', role === 'admin');
    document.getElementById('user-role-btn').classList.toggle('selected', role === 'user');

    console.log(role);
    validateForm();
}

// Получение роли пользователя по UID
async function getUserRole(uid) {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return userDoc.data().role;
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error fetching user role:', error);
        return null;
    }
}

// Обработка отправки формы
async function handleSubmit(event) {
    event.preventDefault();

    const isRegistration = document.getElementById('form-title').textContent === 'Регистрация';
    const loadingIndicator = document.getElementById('loading-indicator');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Показываем индикатор загрузки
    loadingIndicator.classList.remove('hidden');

    // Для входа поле loggersName не нужно
    if (isRegistration) {
        const loggersName = document.getElementById('loggersName').value;
        const role = document.getElementById('role').value;
        try {
            // Регистрация нового пользователя
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Запись данных в Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: email,
                loggersName: loggersName, // Запись loggersName
                role: role,
                createdAt: new Date()
            });

            console.log(role);

            alert('Регистрация прошла успешно!');

            showPanel(role);
            showWelcomeModal(loggersName);
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            alert('Ошибка при регистрации. Пожалуйста, попробуйте снова.');
        } finally {
            // Скрываем индикатор загрузки
            loadingIndicator.classList.add('hidden');
        }
    } else {
        try {
            // Вход в систему
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const loggersName = await getLoggersName(user.uid);
            const role = await getUserRole(user.uid);
            console.log(role);
            showPanel(role);
            showWelcomeModal(loggersName);
        } catch (error) {
            console.error('Ошибка при входе:', error);
            alert('Ошибка при входе. Пожалуйста, попробуйте снова.');
        } finally {
            // Скрываем индикатор загрузки
            loadingIndicator.classList.add('hidden');
        }
    }
}

// Показать панель в зависимости от роли пользователя
export function showPanel(role) {
    document.getElementById('auth-container').style.display = 'none';
    console.log(role);
    if (role === 'admin') {
        // Убираем класс hidden для панели администратора
        document.getElementById('admin-dashboard-container').classList.remove('hidden');
        loadAdminDashboard();
    } else if (role === 'user') {
        // Убираем класс hidden для панели пользователя
        document.getElementById('user-dashboard-container').classList.remove('hidden');
    } else {
        console.error('Unknown role:', role);
        alert('Ошибка: неизвестная роль пользователя.');
    }
}

// Функия переключения панелей Регистрацция / Вход
function toggleForm() {
    const isFormFilled = document.getElementById('email').value || document.getElementById('password').value;

    if (isFormFilled && !confirm('Вы уверены, что хотите переключить форму? Все введенные данные будут потеряны.')) {
        return;
    }

    const title = document.getElementById('form-title');
    const confirmPassword = document.getElementById('confirm-password');
    const requirements = document.getElementById('password-requirements');
    const submitBtn = document.getElementById('submit-btn');
    const toggleLink = document.getElementById('toggle-link');
    const adminRoleBtn = document.getElementById('admin-role-btn');
    const userRoleBtn = document.getElementById('user-role-btn');
    const loggersNameInput = document.getElementById('loggersName'); // Получаем элемент поля loggersName

    const isLogin = title.textContent === 'Вход';

    // Очистка полей формы
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('loggersName').value = ''; // Очистка поля loggersName

    // Сброс отображения чеков
    const checkMarks = document.querySelectorAll('.check');
    checkMarks.forEach(check => check.style.display = 'none');

    // Обновление текста и видимости элементов
    title.textContent = isLogin ? 'Регистрация' : 'Вход';
    toggleLink.textContent = isLogin ? 'Есть аккаунт? Авторизация' : 'Нет аккаунта? Регистрация';
    
    confirmPassword.classList.toggle('hidden', !isLogin);
    requirements.classList.toggle('hidden', !isLogin);
    
    submitBtn.textContent = isLogin ? 'Зарегистрироваться' : 'Войти';

    // Скрыть/отобразить кнопки выбора ролей
    adminRoleBtn.classList.toggle('hidden', !isLogin);
    userRoleBtn.classList.toggle('hidden', !isLogin);

    // Управление видимостью поля loggersName: отображаем только при регистрации
    loggersNameInput.classList.toggle('hidden', !isLogin);

    // Валидация формы после переключения
    validateForm();
}

// Выход из аккаунта
export function logout() {
    signOut(auth)
        .then(() => {
            alert('Вы вышли из аккаунта');
            document.getElementById('auth-container').style.display = 'block';
            document.getElementById('admin-dashboard-container').classList.add('hidden');
            document.getElementById('user-dashboard-container').classList.add('hidden');
        })
        .catch((error) => {
            console.error('Logout error:', error);
            alert('Ошибка при выходе. Попробуйте снова.');
        });
}

function toggleForgotPasswordForm() {
    const authContainer = document.getElementById('auth-container');
    const forgotPasswordContainer = document.getElementById('forgot-password-container');

    if (forgotPasswordContainer.classList.contains('hidden')) {
        authContainer.classList.add('hidden');
        forgotPasswordContainer.classList.remove('hidden');
    } else {
        forgotPasswordContainer.classList.add('hidden');
        authContainer.classList.remove('hidden');
    }
}

// Валидация формы восстановления пароля
function validateForgotPasswordForm() {
    const email = document.getElementById('forgot-email').value;
    const isEmailValid = email !== '';

    const forgotSubmitBtn = document.getElementById('forgot-submit-btn');
    forgotSubmitBtn.disabled = !isEmailValid;
    forgotSubmitBtn.classList.toggle('active', isEmailValid);
}

// Восстановление пароля
function handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('forgot-email').value;

    fetchSignInMethodsForEmail(auth, email)
        .then((signInMethods) => {
            if (signInMethods.length === 0) {
                alert('Пользователь с таким email не найден. Проверьте корректность данных.');
            } else {
                return sendPasswordResetEmail(auth, email)
                    .then(() => {
                        alert('Ссылка для сброса пароля отправлена. Проверьте ваш почтовый ящик.');
                    });
            }
        })
        .catch((error) => {
            console.error('Password reset error:', error);
            alert('Ошибка при отправке ссылки для сброса пароля.');
        });
}

// Присваиваем функции глобальному объекту для использования в HTML
window.validateForm = validateForm;
window.selectRole = selectRole;
window.handleSubmit = handleSubmit;
window.toggleForm = toggleForm;
window.logout = logout;
window.toggleForgotPasswordForm = toggleForgotPasswordForm;
window.validateForgotPasswordForm = validateForgotPasswordForm;
window.handleForgotPassword = handleForgotPassword;
