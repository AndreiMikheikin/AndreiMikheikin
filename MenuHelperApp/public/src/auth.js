import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAjJIU3lCSJivMJ9UbihXD1dqu8ivf-8OU ",
    authDomain: "menuhelperapp.firebaseapp.com",
    projectId: "menuhelperapp",
    storageBucket: "menuhelperapp.appspot.com",
    messagingSenderId: "118002716868",
    appId: "1:118002716868:web:2623db6910ab0771c87991"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Выбор роли
window.selectRole = function(role) {
    document.getElementById('role').value = role;

    const roleButtons = document.querySelectorAll('.role-selection button');
    roleButtons.forEach(button => {
        button.classList.remove('selected');
    });

    const selectedButton = document.querySelector(`.role-selection button.${role}`);
    selectedButton.classList.add('selected');

    validateForm();
}

// Проверка валидности формы
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

// Вспомогательная функция для переключения видимости галочек
function toggleCheckMark(id, condition) {
    const checkMark = document.getElementById(id).querySelector('.check');
    checkMark.style.display = condition ? 'inline-block' : 'none';
}

// Обработчик отправки формы входа/регистрации
window.handleSubmit = function(event) {
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
                // Дополнительные действия после регистрации
            })
            .catch((error) => {
                console.error('Error registering:', error);
                if (error.code === 'auth/email-already-in-use') {
                    alert('Этот email уже используется.');
                } else {
                    alert('Ошибка при регистрации.');
                }
            });
    } else {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('User signed in:', user);
                // Дополнительные действия после входа
            })
            .catch((error) => {
                console.error('Error signing in:', error);
                if (error.code === 'auth/user-not-found') {
                    alert('Пользователь с таким email не найден.');
                } else if (error.code === 'auth/wrong-password') {
                    alert('Неверный пароль.');
                } else {
                    alert('Ошибка при входе.');
                }
            });
    }
}

// Переключение между формами входа и регистрации
window.toggleForm = function() {
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

// Переключение между формами входа и восстановления пароля
window.toggleForgotPasswordForm = function() {
    const authContainer = document.getElementById('auth-container');
    const forgotPasswordContainer = document.getElementById('forgot-password-container');

    authContainer.style.display = authContainer.style.display === 'none' ? 'block' : 'none';
    forgotPasswordContainer.style.display = forgotPasswordContainer.style.display === 'none' ? 'block' : 'none';

    document.getElementById('forgot-email').value = '';
    validateForgotPasswordForm();
}

// Проверка валидности формы восстановления пароля
window.validateForgotPasswordForm = function() {
    const email = document.getElementById('forgot-email').value;
    const isEmailValid = email !== '';

    const forgotSubmitBtn = document.getElementById('forgot-submit-btn');
    forgotSubmitBtn.disabled = !isEmailValid;
    forgotSubmitBtn.classList.toggle('active', isEmailValid);
}

// Обработчик отправки формы восстановления пароля
window.handleForgotPassword = function(event) {
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
