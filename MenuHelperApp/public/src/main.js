// Функция для инициализации функциональности перетаскивания иконок
function initializeDragAndDrop() {
    console.log("Initializing drag and drop");

    const iconContainers = document.querySelectorAll('.icon-container');
    let draggingIcon = null;
    let offsetX = 0;
    let offsetY = 0;

    iconContainers.forEach(icon => {
        icon.addEventListener('mousedown', (e) => {
            e.preventDefault();
            draggingIcon = icon;
            offsetX = e.clientX - draggingIcon.getBoundingClientRect().left;
            offsetY = e.clientY - draggingIcon.getBoundingClientRect().top;

            draggingIcon.style.zIndex = '1000';
            draggingIcon.classList.add('dragging');
        });
    });

    document.addEventListener('mousemove', (e) => {
        if (draggingIcon) {
            e.preventDefault();
            const container = document.getElementById('admin-dashboard-content');
            const containerRect = container.getBoundingClientRect();

            let newLeft = e.clientX - offsetX - containerRect.left;
            let newTop = e.clientY - offsetY - containerRect.top;

            // Ограничение перемещения внутри контейнера
            newLeft = Math.max(0, Math.min(containerRect.width - draggingIcon.clientWidth, newLeft));
            newTop = Math.max(0, Math.min(containerRect.height - draggingIcon.clientHeight, newTop));

            draggingIcon.style.left = `${newLeft}px`;
            draggingIcon.style.top = `${newTop}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (draggingIcon) {
            draggingIcon.classList.remove('dragging');
            draggingIcon = null;
        }
    });
}

export { initializeDragAndDrop };