const pathes = document.querySelectorAll('path');

for (let i = 0; i < pathes.length; i++) {
    console.log(`Length ${i} is ${Math.ceil(pathes[i].getTotalLength())}`);
}