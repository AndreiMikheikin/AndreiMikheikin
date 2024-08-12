// src/auth.js

// Импорт необходимых модулей из Firebase
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, fetchSignInMethodsForEmail } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { showWelcomeModal } from '../src/main.js';

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
const auth = getAuth(app);

// Валидация формы аутентификации
function validateForm() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const role = document.getElementById('role').value;

    const isEmailValid = email !== '';
    const isPasswordValid = password !== '';
    const isRoleSelected = role !== '';

    const isRegistration = document.getElementById('form-title').textContent === 'Регистрация';

    // Проверка требований к паролю
    const isLengthValid = password.length >= 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const doPasswordsMatch = password === confirmPassword;

    const areRequirementsMet = isLengthValid && hasLowercase && hasUppercase && hasNumber && doPasswordsMatch;

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = isRegistration 
        ? !(isEmailValid && isPasswordValid && isRoleSelected && areRequirementsMet) 
        : !(isEmailValid && isPasswordValid && isRoleSelected);
    
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

    const roleButtons = document.querySelectorAll('.role-selection button');
    roleButtons.forEach(button => button.classList.remove('selected'));

    document.querySelector(`.role-selection button.${role}`).classList.add('selected');
    validateForm();
}

// Обработка отправки формы аутентификации
function handleSubmit(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    const role = event.target.role.value;

    const isRegistration = document.getElementById('form-title').textContent === 'Регистрация';

    if (isRegistration) {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log('User registered:', userCredential.user);
                alert('Регистрация успешна!');
                
                // Передаем email пользователя в showWelcomeModal
                showWelcomeModal(userCredential.user.email);
                showPanel(role);
            })
            .catch((error) => {
                console.error('Error registering:', error);
                alert('Ошибка при регистрации. Повторите попытку.');
            });
    } else {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log('User signed in:', userCredential.user);
                alert('Вход выполнен успешно!');
                
                // Передаем email пользователя в showWelcomeModal
                showWelcomeModal(userCredential.user.email);
                showPanel(role);
            })
            .catch((error) => {
                console.error('Error signing in:', error);
                alert('Ошибка при входе. Повторите попытку.');
            });
    }
}


// Показать панель в зависимости от роли пользователя
function showPanel(role) {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('admin-dashboard-container').style.display = role === 'admin' ? 'block' : 'none';
    document.getElementById('user-dashboard-container').style.display = role === 'user' ? 'block' : 'none';
}

// Переключение формы между Входом и Регистрацией
function toggleForm() {
    const title = document.getElementById('form-title');
    const confirmPassword = document.getElementById('confirm-password');
    const requirements = document.getElementById('password-requirements');
    const submitBtn = document.getElementById('submit-btn');
    const isLogin = title.textContent === 'Вход';
    const toggleLink = document.getElementById('toggle-link');

    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirm-password').value = '';

    const checkMarks = document.querySelectorAll('.check');
    checkMarks.forEach(check => check.style.display = 'none');

    title.textContent = isLogin ? 'Регистрация' : 'Вход';
    toggleLink.textContent = isLogin ? 'Есть аккаунт? Авторизация' : 'Нет аккаунта? Регистрация';
    confirmPassword.style.display = isLogin ? 'block' : 'none';
    requirements.style.display = isLogin ? 'block' : 'none';
    submitBtn.textContent = isLogin ? 'Зарегистрироваться' : 'Войти';
    validateForm();
}

// Выход из аккаунта
function logout() {
    signOut(auth)
        .then(() => {
            console.log('User signed out');
            alert('Выход выполнен успешно!');
            document.getElementById('auth-container').style.display = 'block';
            document.getElementById('admin-dashboard-container').style.display = 'none';
            document.getElementById('user-dashboard-container').style.display = 'none';
        })
        .catch((error) => {
            console.error('Error signing out:', error);
            alert('Ошибка при выходе.');
        });
}

// Переключение формы восстановления пароля
function toggleForgotPasswordForm() {
    const authContainer = document.getElementById('auth-container');
    const forgotPasswordContainer = document.getElementById('forgot-password-container');

    authContainer.style.display = authContainer.style.display === 'none' ? 'block' : 'none';
    forgotPasswordContainer.style.display = forgotPasswordContainer.style.display === 'none' ? 'block' : 'none';

    document.getElementById('forgot-email').value = '';
    validateForgotPasswordForm();
}

// Валидация формы восстановления пароля
function validateForgotPasswordForm() {
    const email = document.getElementById('forgot-email').value;
    const isEmailValid = email !== '';

    const forgotSubmitBtn = document.getElementById('forgot-submit-btn');
    forgotSubmitBtn.disabled = !isEmailValid;
    forgotSubmitBtn.classList.toggle('active', isEmailValid);
}

// Обработка отправки формы восстановления пароля
function handleForgotPassword(event) {
    event.preventDefault();
    const email = event.target['forgot-email'].value;

    fetchSignInMethodsForEmail(auth, email)
        .then((signInMethods) => {
            if (signInMethods.length === 0) {
                alert('Пользователь с таким email не найден.');
            } else {
                return sendPasswordResetEmail(auth, email)
                    .then(() => {
                        console.log('Password reset email sent');
                        alert('Ссылка для сброса пароля отправлена.');
                    })
                    .catch((error) => {
                        console.error('Error sending password reset email:', error);
                        alert('Ошибка при отправке ссылки для сброса пароля.');
                    });
            }
        })
        .catch((error) => {
            console.error('Error checking email:', error);
            alert('Ошибка при проверке email.');
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
