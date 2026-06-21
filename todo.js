// To-Do List Application with Local Storage

class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.storageKey = 'starylogic_todos';
        
        this.elements = {
            input: document.getElementById('todoInput'),
            addBtn: document.getElementById('addBtn'),
            todoList: document.getElementById('todoList'),
            emptyState: document.getElementById('emptyState'),
            clearCompleted: document.getElementById('clearCompleted'),
            clearAll: document.getElementById('clearAll'),
            completedCount: document.getElementById('completedCount'),
            totalCount: document.getElementById('totalCount'),
            filterBtns: document.querySelectorAll('.filter-btn'),
            statTotal: document.getElementById('statTotal'),
            statCompleted: document.getElementById('statCompleted'),
            statPending: document.getElementById('statPending'),
            progressFill: document.getElementById('progressFill')
        };

        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Add task
        this.elements.addBtn.addEventListener('click', () => this.addTodo());
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // Filter buttons
        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
        });

        // Clear buttons
        this.elements.clearCompleted.addEventListener('click', () => this.clearCompleted());
        this.elements.clearAll.addEventListener('click', () => this.clearAll());
    }

    addTodo() {
        const text = this.elements.input.value.trim();
        
        if (!text) {
            this.shake(this.elements.input);
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString()
        };

        this.todos.push(todo);
        this.saveToStorage();
        this.render();
        this.elements.input.value = '';
        this.elements.input.focus();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToStorage();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear!');
            return;
        }

        if (confirm(`Delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveToStorage();
            this.render();
        }
    }

    clearAll() {
        if (this.todos.length === 0) {
            alert('No tasks to delete!');
            return;
        }

        if (confirm('Delete ALL tasks? This cannot be undone!')) {
            this.todos = [];
            this.saveToStorage();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        this.elements.filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;

        this.elements.statTotal.textContent = total;
        this.elements.statCompleted.textContent = completed;
        this.elements.statPending.textContent = pending;
        this.elements.completedCount.textContent = completed;
        this.elements.totalCount.textContent = total;

        // Update progress bar
        const progress = total === 0 ? 0 : (completed / total) * 100;
        this.elements.progressFill.style.width = progress + '%';
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Clear list
        this.elements.todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            this.elements.emptyState.style.display = 'block';
            this.elements.todoList.style.display = 'none';
        } else {
            this.elements.emptyState.style.display = 'none';
            this.elements.todoList.style.display = 'block';

            filteredTodos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                
                li.innerHTML = `
                    <input 
                        type="checkbox" 
                        class="todo-checkbox" 
                        ${todo.completed ? 'checked' : ''}
                    >
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <span class="todo-time">${todo.createdAt}</span>
                    <button class="delete-btn">🗑️ Delete</button>
                `;

                // Checkbox listener
                const checkbox = li.querySelector('.todo-checkbox');
                checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

                // Delete button listener
                const deleteBtn = li.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

                this.elements.todoList.appendChild(li);
            });
        }

        this.updateStats();
    }

    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
    }

    loadFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        this.todos = stored ? JSON.parse(stored) : [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    shake(element) {
        element.style.animation = 'none';
        setTimeout(() => {
            element.style.animation = 'shake 0.5s';
        }, 10);
    }
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
    console.log('✨ Todo App initialized!');
});
