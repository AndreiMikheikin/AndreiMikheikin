const canvas = document.getElementById('triangleCanvas');
const ctx = canvas.getContext('2d');

let leaves = [];
let colors = ['#228B22', '#32CD32', '#006400']; // Оттенки зелёного для листьев

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Конструктор листа петрушки
function ParsleyLeaf(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = '#FFFFFF'; // Изначально цвет белый
    this.opacity = 0;       // Изначальная прозрачность 0

    // Метод отрисовки листа петрушки
    this.draw = function() {
        // Получаем размеры и положение контейнера admin-dashboard-container
        const container = document.getElementById('admin-dashboard-container');
        const containerRect = container.getBoundingClientRect();

        // Проверка, попадает ли лист в контейнер
        if (this.x + this.size > containerRect.left &&
            this.x - this.size < containerRect.right &&
            this.y + this.size > containerRect.top &&
            this.y - this.size < containerRect.bottom) {
            return; // Если попадает, не рисуем лист
        }

        // Отрисовка листа петрушки
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);

        // Формируем контуры листа петрушки
        for (let i = 0; i < 5; i++) {
            let angle = (i * 72 + 45) * Math.PI / 180;
            let leafX = this.x + this.size * Math.cos(angle);
            let leafY = this.y + this.size * Math.sin(angle);
            ctx.lineTo(leafX, leafY);
        }

        ctx.closePath();
        ctx.fillStyle = `rgba(${hexToRgb(this.color)}, ${this.opacity})`;
        ctx.fill();
    };

    // Метод обновления состояния листа
    this.update = function(mouseX, mouseY) {
        let dx = this.x - mouseX;
        let dy = this.y - mouseY;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 50) { // Уменьшенный радиус до 50 пикселей
            this.opacity = Math.max(0.2, 1 - dist / 300); // Плавное изменение прозрачности
            this.color = colors[Math.floor(Math.random() * colors.length)]; // Изменение цвета
        } else {
            // Возврат к изначальным значениям
            this.color = '#FFFFFF';
            this.opacity = 0;
        }

        this.draw();
    };
}

// Генерация листьев
function init() {
    leaves = [];
    for (let i = 0; i < 300; i++) { // Количество листьев
        let size = Math.random() * 10 + 10; // Размер листьев
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;

        leaves.push(new ParsleyLeaf(x, y, size));
    }
}

// Анимационный цикл
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < leaves.length; i++) {
        leaves[i].update(mouse.x, mouse.y);
    }

    requestAnimationFrame(animate);
}

let mouse = {
    x: undefined,
    y: undefined
};

// Обработчик события перемещения мыши
canvas.addEventListener('mousemove', function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

// Обработчик события выхода мыши из области
canvas.addEventListener('mouseout', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});

init();
animate();

// Вспомогательная функция для преобразования HEX в RGB
function hexToRgb(hex) {
    let bigint = parseInt(hex.slice(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return `${r},${g},${b}`;
}

// Обработчик события изменения размера окна
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});
