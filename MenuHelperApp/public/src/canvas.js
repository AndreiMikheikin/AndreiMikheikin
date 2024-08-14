// Функция для плавного перехода между двумя цветами
function lerpColor(startColor, endColor, amount) {
    const startRGB = hexToRgb(startColor).split(',').map(Number);
    const endRGB = hexToRgb(endColor).split(',').map(Number);
    const r = Math.round(startRGB[0] + (endRGB[0] - startRGB[0]) * amount);
    const g = Math.round(startRGB[1] + (endRGB[1] - startRGB[1]) * amount);
    const b = Math.round(startRGB[2] + (endRGB[2] - startRGB[2]) * amount);
    return `rgb(${r},${g},${b})`;
}

// Функция для преобразования HEX-кода цвета в RGB
function hexToRgb(hex) {
    let bigint = parseInt(hex.slice(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return `${r},${g},${b}`;
}

class Carrot {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = '#FFFFFF'; // Изначально белый цвет
        this.hoverColor = '#FFA500'; // Цвет при наведении мыши
        this.opacity = 0;
        this.targetOpacity = 0;
        this.tailColor = '#FFFFFF';
        this.hoverTailColor = '#32CD32'; // Цвет хвостика при наведении мыши
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Рисуем хвостик морковки
        ctx.beginPath();
        ctx.moveTo(-this.size / 6, 1.5 * this.size);
        ctx.lineTo(0, this.size);
        ctx.lineTo(this.size / 6, 1.4 * this.size);
        ctx.closePath();
        ctx.fillStyle = `rgba(${hexToRgb(this.tailColor)}, ${this.opacity})`;
        ctx.fill();

        // Рисуем саму морковку
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-this.size / 2.5, this.size);
        ctx.lineTo(this.size / 2.5, this.size);
        ctx.closePath();
        ctx.fillStyle = `rgba(${hexToRgb(this.color)}, ${this.opacity})`;
        ctx.fill();

        ctx.restore();
    }

    update(mouseX, mouseY) {
        let dx = this.x - mouseX;
        let dy = this.y - mouseY;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 50) {
            this.targetOpacity = 1;
            this.color = this.hoverColor;        // Используем цвет при наведении
            this.tailColor = this.hoverTailColor; // Используем цвет хвостика при наведении
        } else {
            this.targetOpacity = 0;
            this.color = '#FFFFFF'; // Возвращаем белый цвет
            this.tailColor = '#FFFFFF'; // Возвращаем белый цвет хвостика
        }

        // Обновляем только если есть изменения
        if (this.opacity !== this.targetOpacity) {
            this.opacity += (this.targetOpacity - this.opacity) * 0.05;
            if (this.opacity < 0.01) this.opacity = 0;
        }
    }
}

class ParsleyBranch {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = '#FFFFFF';
        this.hoverColor = '#32CD32'; // Цвет при наведении мыши
        this.opacity = 0;
        this.targetOpacity = 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.strokeStyle = `rgba(${hexToRgb(this.color)}, ${this.opacity})`;
        ctx.lineWidth = 2;

        // Главный стебель
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -this.size);
        ctx.stroke();

        // Листья
        for (let i = 0; i < 5; i++) {
            let angle = (Math.random() * 20 - 10) * Math.PI / 180;
            let branchLength = this.size * (Math.random() * 0.5 + 0.5);

            ctx.save();
            ctx.translate(0, -this.size / 2);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -branchLength);
            ctx.stroke();

            for (let j = 0; j < 3; j++) {
                ctx.save();
                ctx.translate(0, -branchLength / 3 * (j + 1));
                ctx.scale(1, 0.6);
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${hexToRgb(this.color)}, ${this.opacity})`;
                ctx.fill();
                ctx.restore();
            }
            ctx.restore();
        }
        ctx.restore();
    }

    update(mouseX, mouseY) {
        let dx = this.x - mouseX;
        let dy = this.y - mouseY;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 50) {
            this.targetOpacity = 1;
            this.color = this.hoverColor; // Используем цвет при наведении
        } else {
            this.targetOpacity = 0;
            this.color = '#FFFFFF'; // Возвращаем белый цвет
        }

        if (this.opacity !== this.targetOpacity) {
            this.opacity += (this.targetOpacity - this.opacity) * 0.05;
            if (this.opacity < 0.01) this.opacity = 0;
        }
    }
}

const canvas = document.getElementById('triangleCanvas');
const ctx = canvas.getContext('2d');

let branches = [];
let carrots = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function init() {
    branches = [];
    carrots = [];
    for (let i = 0; i < 300; i++) {
        let size = Math.random() * 10 + 10;
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;

        branches.push(new ParsleyBranch(x, y, size));
    }

    for (let i = 0; i < 50; i++) {
        let size = Math.random() * 20 + 20;
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;

        carrots.push(new Carrot(x, y, size));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const container = document.getElementById('admin-dashboard-container');
    const containerRect = container.getBoundingClientRect();

    for (let i = 0; i < branches.length; i++) {
        branches[i].update(mouse.x, mouse.y);
        branches[i].draw(ctx, containerRect);
    }

    for (let i = 0; i < carrots.length; i++) {
        carrots[i].update(mouse.x, mouse.y);
        carrots[i].draw(ctx, containerRect);
    }

    requestAnimationFrame(animate);
}

let mouse = {
    x: undefined,
    y: undefined
};

canvas.addEventListener('mousemove', function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

canvas.addEventListener('mouseout', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

init();
animate();
