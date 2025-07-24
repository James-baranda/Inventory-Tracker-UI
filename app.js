// Inventory Tracker UI Logic

let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let sortKey = 'name';
let sortAsc = true;

const itemForm = document.getElementById('itemForm');
const itemIdInput = document.getElementById('itemId');
const itemNameInput = document.getElementById('itemName');
const itemQuantityInput = document.getElementById('itemQuantity');
const itemPriceInput = document.getElementById('itemPrice');
const addUpdateBtn = document.getElementById('addUpdateBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const inventoryTable = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
const searchInput = document.getElementById('searchInput');
const exportBtn = document.getElementById('exportBtn');
const fabAdd = document.getElementById('fabAdd');
const toast = document.getElementById('toast');
const confettiSVG = document.getElementById('confetti');

function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function renderInventory() {
    let filtered = inventory.filter(item =>
        item.name.toLowerCase().includes(searchInput.value.toLowerCase())
    );
    filtered.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
        if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
        return 0;
    });
    inventoryTable.innerHTML = '';
    filtered.forEach((item, idx) => {
        const row = inventoryTable.insertRow();
        row.innerHTML = `
            <td>${item.name}</td>
            <td>
                <button class="qty-btn" onclick="minusItem(${item.id})">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" onclick="plusItem(${item.id})">+</button>
            </td>
            <td>${item.price.toFixed(2)}</td>
            <td>
                <button class="actions-btn edit" onclick="editItem(${item.id})">Edit</button>
                <button class="actions-btn delete" onclick="deleteItem(${item.id})">Delete</button>
            </td>
        `;
    });
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2200);
}

function launchConfetti() {
    if (!confettiSVG) return;
    confettiSVG.innerHTML = '';
    const colors = ['#1976d2', '#388e3c', '#b71c1c', '#ffeb3b', '#ff9800', '#fff'];
    const confettiCount = 32;
    for (let i = 0; i < confettiCount; i++) {
        const x = Math.random() * 1440;
        const y = 60 + Math.random() * 80;
        const size = 10 + Math.random() * 16;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const rotate = Math.random() * 360;
        const duration = 1.2 + Math.random() * 1.2;
        const conf = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        conf.setAttribute('x', x);
        conf.setAttribute('y', y);
        conf.setAttribute('width', size);
        conf.setAttribute('height', size * 0.4);
        conf.setAttribute('fill', color);
        conf.setAttribute('rx', 2);
        conf.setAttribute('transform', `rotate(${rotate} ${x + size/2} ${y + size/2})`);
        confettiSVG.appendChild(conf);
        conf.animate([
            { transform: `translateY(0px) rotate(${rotate}deg)`, opacity: 1 },
            { transform: `translateY(${180 + Math.random()*120}px) rotate(${rotate + 180}deg)`, opacity: 0.2 }
        ], {
            duration: duration * 1000,
            easing: 'ease-out',
            fill: 'forwards',
            delay: Math.random() * 200
        });
    }
    setTimeout(() => { confettiSVG.innerHTML = ''; }, 2500);
}

window.editItem = function(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    itemIdInput.value = item.id;
    itemNameInput.value = item.name;
    itemQuantityInput.value = item.quantity;
    itemPriceInput.value = item.price;
    addUpdateBtn.textContent = 'Update Item';
    cancelEditBtn.style.display = 'inline-block';
    showToast('Editing item...');
}

window.deleteItem = function(id) {
    if (!confirm('Delete this item?')) return;
    inventory = inventory.filter(i => i.id !== id);
    saveInventory();
    renderInventory();
    showToast('Item deleted!');
}

window.plusItem = function(id) {
    const idx = inventory.findIndex(i => i.id === id);
    if (idx > -1) {
        inventory[idx].quantity++;
        saveInventory();
        renderInventory();
        showToast('Quantity increased!');
    }
}

window.minusItem = function(id) {
    const idx = inventory.findIndex(i => i.id === id);
    if (idx > -1 && inventory[idx].quantity > 0) {
        inventory[idx].quantity--;
        saveInventory();
        renderInventory();
        showToast('Quantity decreased!');
    } else if (idx > -1 && inventory[idx].quantity === 0) {
        showToast('Quantity cannot go below 0!');
    }
}

itemForm.onsubmit = function(e) {
    e.preventDefault();
    const id = itemIdInput.value ? Number(itemIdInput.value) : Date.now();
    const name = itemNameInput.value.trim();
    const quantity = Number(itemQuantityInput.value);
    const price = Number(itemPriceInput.value);
    if (!name) return;
    const existingIdx = inventory.findIndex(i => i.id === id);
    if (existingIdx > -1) {
        inventory[existingIdx] = { id, name, quantity, price };
        showToast('Item updated!');
    } else {
        inventory.push({ id, name, quantity, price });
        showToast('Item added!');
        launchConfetti();
    }
    saveInventory();
    renderInventory();
    itemForm.reset();
    addUpdateBtn.textContent = 'Add Item';
    cancelEditBtn.style.display = 'none';
}

cancelEditBtn.onclick = function() {
    itemForm.reset();
    addUpdateBtn.textContent = 'Add Item';
    cancelEditBtn.style.display = 'none';
}

searchInput.oninput = function() {
    renderInventory();
}

document.querySelectorAll('#inventoryTable th[data-sort]').forEach(th => {
    th.onclick = function() {
        const key = th.getAttribute('data-sort');
        if (sortKey === key) sortAsc = !sortAsc;
        else {
            sortKey = key;
            sortAsc = true;
        }
        renderInventory();
    };
});

exportBtn.onclick = function() {
    let csv = 'Name,Quantity,Price\n';
    inventory.forEach(item => {
        csv += `${item.name},${item.quantity},${item.price.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Inventory exported!');
};

fabAdd.onclick = function() {
    itemForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    itemNameInput.focus();
    itemForm.reset();
    addUpdateBtn.textContent = 'Add Item';
    cancelEditBtn.style.display = 'none';
    showToast('Ready to add a new item!');
};

// Initial render
renderInventory(); 