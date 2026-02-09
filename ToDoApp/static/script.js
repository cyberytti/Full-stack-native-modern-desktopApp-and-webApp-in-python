// Base API URL
const API_BASE = "/api/tasks";
let tasks = [];

function loadTasks() {
    const listElement = document.getElementById("myList"); // FIXED: Removed trailing space in ID
    if (!listElement) return;
    
    listElement.innerHTML = tasks.map(item => {
        // Escape single quotes and backslashes for safe JS string embedding
        const safeItem = item.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `<li>
            <span>${item}</span>
            <button class="delete-btn" onclick="deleteItem('${safeItem}')">✕</button>
        </li>`;
    }).join('');
}

async function loadTasksFromAPI() {
    try {
        const response = await fetch(API_BASE);
        const data = await response.json();
        tasks = data.tasks || [];
        loadTasks();
    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}

async function deleteItem(item) {
    try {
        // CRITICAL: URL-encode task content for spaces/symbols
        const encodedItem = encodeURIComponent(item);
        const response = await fetch(`${API_BASE}/${encodedItem}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            loadTasksFromAPI();
        } else {
            console.error("Server rejected delete request:", response.status);
        }
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}

async function processInput() {
    const input = document.getElementById("userInput");
    const value = input.value.trim();
    const warning = document.getElementById("emptywarning");
    
    if (!value) {
        warning.innerText = "Please provide a task";
        return;
    }
    
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: value })
        });
        
        if (response.ok) {
            input.value = "";
            warning.innerText = "";
            loadTasksFromAPI();
        } else {
            warning.innerText = "Failed to add task";
        }
    } catch (error) {
        console.error("Error adding task:", error);
        warning.innerText = "Network error";
    }
}

// Load tasks on page load
document.addEventListener('DOMContentLoaded', loadTasksFromAPI);