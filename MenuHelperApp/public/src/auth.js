import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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

// Валидация формы
window.validateForm = function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const role = document.getElementById('role').value;

    const isEmailValid = email !== '';
    const isPasswordValid = password !== '';
    const isRoleSelected = role !== '';

    const isRegistration = document.getElementById('form-title').textContent === 'Регистрация';

    let isLengthValid = password.length >= 8;
    let hasLowercase = /[a-z]/.test(password);
    let hasUppercase = /[A-Z]/.test(password);
    let hasNumber = /[0-9]/.test(password);
    let doPasswordsMatch = password === confirmPassword;

    let areRequirementsMet = isLengthValid && hasLowercase && hasUppercase && hasNumber && doPasswordsMatch;

    const submitBtn = document.getElementById('submit-btn');
    if (isRegistration) {
        submitBtn.disabled = !(isEmailValid && isPasswordValid && isRoleSelected && areRequirementsMet);
    } else {
        submitBtn.disabled = !(isEmailValid && isPasswordValid && isRoleSelected);
    }
    submitBtn.classList.toggle('active', !submitBtn.disabled);

    document.getElementById('password-requirements').style.display = isRegistration ? 'block' : 'none';

    toggleCheckMark('length-check', isLengthValid);
    toggleCheckMark('lowercase-check', hasLowercase);
    toggleCheckMark('uppercase-check', hasUppercase);
    toggleCheckMark('number-check', hasNumber);
    toggleCheckMark('match-check', doPasswordsMatch);
}
window.validateForm = validateForm; // Присваиваем функцию глобальному объекту

// Выбор роли пользователя
function selectRole(role) {
    document.getElementById('role').value = role;

    const roleButtons = document.querySelectorAll('.role-selection button');
    roleButtons.forEach(button => {
        button.classList.remove('selected');
    });

    const selectedButton = document.querySelector(`.role-selection button.${role}`);
    selectedButton.classList.add('selected');

    validateForm();
}
window.selectRole = selectRole; // Присваиваем функцию глобальному объекту

function toggleCheckMark(id, condition) {
    const checkMark = document.getElementById(id).querySelector('.check');
    checkMark.style.display = condition ? 'inline-block' : 'none';
}

// Обработка отправки формы
function handleSubmit(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    const role = event.target.role.value;

    const isRegistration = document.getElementById('form-title').textContent === 'Регистрация';

    if (isRegistration) {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('User registered:', user);
                alert('Регистрация успешна!');
                showPanel(role);
            })
            .catch((error) => {
                console.error('Error registering:', error);
                alert('Ошибка при регистрации. Повторите попытку.');
            });
    } else {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('User signed in:', user);
                alert('Вход выполнен успешно!');
                showPanel(role);
            })
            .catch((error) => {
                console.error('Error signing in:', error);
                alert('Ошибка при входе. Повторите попытку.');
            });
    }
}
window.handleSubmit = handleSubmit; // Присваиваем функцию глобальному объекту

// Показать панель по роли
function showPanel(role) {
    if (role === 'admin') {
        document.getElementById('admin-dashboard-container').style.display = 'block';
        document.getElementById('user-dashboard-container').style.display = 'none';
    } else if (role === 'user') {
        document.getElementById('admin-dashboard-container').style.display = 'none';
        document.getElementById('user-dashboard-container').style.display = 'block';
    }
    document.getElementById('auth-container').style.display = 'none';
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
    checkMarks.forEach(check => {
        check.style.display = 'none';
    });

    title.textContent = isLogin ? 'Регистрация' : 'Вход';
    toggleLink.textContent = !isLogin ? 'Нет аккаунта? Регистрация' : 'Есть аккаунт? Авторизация';
    confirmPassword.style.display = isLogin ? 'block' : 'none';
    requirements.style.display = isLogin ? 'block' : 'none';
    submitBtn.textContent = isLogin ? 'Зарегистрироваться' : 'Войти';
    validateForm();
}
window.toggleForm = toggleForm; // Присваиваем функцию глобальному объекту

// Функция выхода из аккаунта
function logout() {
    signOut(auth).then(() => {
        console.log('User signed out');
        alert('Выход выполнен успешно!');
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('admin-dashboard-container').style.display = 'none';
        document.getElementById('user-dashboard-container').style.display = 'none';
    }).catch((error) => {
        console.error('Error signing out:', error);
        alert('Ошибка при выходе.');
    });
}
window.logout = logout; // Присваиваем функцию глобальному объекту

// Переключение формы восстановления пароля
function toggleForgotPasswordForm() {
    const authContainer = document.getElementById('auth-container');
    const forgotPasswordContainer = document.getElementById('forgot-password-container');

    authContainer.style.display = authContainer.style.display === 'none' ? 'block' : 'none';
    forgotPasswordContainer.style.display = forgotPasswordContainer.style.display === 'none' ? 'block' : 'none';

    document.getElementById('forgot-email').value = '';
    validateForgotPasswordForm();
}
window.toggleForgotPasswordForm = toggleForgotPasswordForm; // Присваиваем функцию глобальному объекту

// Валидация формы восстановления пароля
function validateForgotPasswordForm() {
    const email = document.getElementById('forgot-email').value;
    const isEmailValid = email !== '';

    const forgotSubmitBtn = document.getElementById('forgot-submit-btn');
    forgotSubmitBtn.disabled = !isEmailValid;
    forgotSubmitBtn.classList.toggle('active', isEmailValid);
}
window.validateForgotPasswordForm = validateForgotPasswordForm; // Присваиваем функцию глобальному объекту

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
window.handleForgotPassword = handleForgotPassword; // Присваиваем функцию глобальному объекту