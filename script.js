document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    // Efficiently cache DOM elements to avoid repeated lookups.
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const taskFilters = document.getElementById('taskFilters');

    // --- Application State Variables ---
    // Load tasks from local storage; if none exist, initialize an empty array.
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    // Default filter state ensures 'All' tasks are shown on load.
    let currentFilter = 'all';

    // --- Core Functions ---

    /**
     * Renders tasks to the DOM based on the `currentFilter`.
     * This function clears the existing list and re-builds it, ensuring the UI
     * always reflects the most current application state and filter.
     */
    function renderTasks() {
        taskList.innerHTML = ''; // Clear existing task list to prevent duplicates

        // Apply filtering logic to the 'tasks' array.
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'completed') {
                return task.completed;
            } else if (currentFilter === 'pending') {
                return !task.completed;
            }
            return true; // 'all' filter includes all tasks regardless of status.
        });

        // Edge case handling: If a filter is active but yields no tasks,
        // revert to 'all' tasks to avoid an empty display when tasks exist.
        if (filteredTasks.length === 0 && tasks.length > 0 && currentFilter !== 'all') {
            currentFilter = 'all'; // Reset filter to 'all'
            updateFilterButtons(); // Update UI for filter buttons
            renderTasks(); // Re-render with the 'all' filter
            return; // Exit to prevent further processing in this call
        }

        // Iterate through the filtered tasks and create DOM elements for each.
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.setAttribute('data-id', task.id); // Store unique task ID on the list item for easy reference

            if (task.completed) {
                li.classList.add('completed'); // Apply CSS class for completed tasks
            }

            // Populate the list item's inner HTML with task details and controls.
            li.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <span class="task-date">${task.timestamp}</span>
                <button class="delete-btn">Delete</button>
            `;

            // Attach event listeners to dynamically created elements using anonymous functions
            // to capture the `task.id` and `li` reference.
            li.querySelector('input[type="checkbox"]').addEventListener('change', () => toggleTaskCompleted(task.id));
            li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id, li));

            taskList.appendChild(li); // Append the new task item to the list
        });
    }

    /**
     * Adds a new task to the `tasks` array.
     * Includes validation for empty input and generates a unique ID and timestamp.
     */
    function addTask() {
        const taskText = taskInput.value.trim(); // Get and trim the input value
        if (taskText === '') {
            alert('Task description cannot be empty. Please enter a valid task.');
            return; // Prevent adding empty tasks
        }

        const newTask = {
            id: Date.now(), // Unique ID generated from the current timestamp (simple and effective)
            text: taskText,
            completed: false, // New tasks are always incomplete by default
            timestamp: new Date().toLocaleString() // Bonus: Store formatted creation date and time
        };

        tasks.push(newTask); // Add the new task to the array
        saveTasks(); // Persist the updated tasks array to local storage
        renderTasks(); // Re-render the task list to display the new task
        taskInput.value = ''; // Clear the input field for the next task
    }

    /**
     * Toggles the completion status of a specific task by its ID.
     * Iterates through the `tasks` array to find and update the relevant task.
     *
     * @param {number} id - The unique ID of the task whose completion status is to be toggled.
     */
    function toggleTaskCompleted(id) {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks(); // Persist changes
        renderTasks(); // Re-render to apply new styling (strikethrough/color)
    }

    /**
     * Deletes a task from the `tasks` array by its ID.
     * Includes a visual fade-out animation for the deleted item.
     *
     * @param {number} id - The unique ID of the task to be deleted.
     * @param {HTMLElement} element - The actual DOM `<li>` element corresponding to the task,
     * used for applying the animation.
     */
    function deleteTask(id, element) {
        // Bonus: Apply CSS for fade-out animation before removal
        element.style.opacity = '0';
        element.style.transform = 'translateX(20px)';
        element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

        // Wait for the animation to complete, then remove from array and DOM.
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== id); // Create a new array without the deleted task
            saveTasks(); // Persist changes
            renderTasks(); // Re-render the list to reflect the deletion
        }, 300); // Matches the CSS transition duration
    }

    /**
     * Saves the current `tasks` array to the browser's local storage.
     * This ensures data persistence across browser sessions.
     */
    function saveTasks() {
        // Local storage can only store strings, so JSON.stringify is used.
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    /**
     * Updates the visual `active` class on filter buttons based on `currentFilter`.
     * This provides visual feedback to the user about the currently selected filter.
     */
    function updateFilterButtons() {
        document.querySelectorAll('.filters button').forEach(button => {
            if (button.dataset.filter === currentFilter) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // --- Event Listener Registration ---

    // 1. Add Task Button Click Listener
    addTaskBtn.addEventListener('click', addTask);

    // 2. Add Task on 'Enter' Key Press in Input Field
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // 3. Filter Buttons Click Listener (using Event Delegation)
    // Attaching one listener to the parent (`taskFilters`) is more efficient
    // than attaching individual listeners to each button, especially if filters
    // were dynamically added/removed.
    taskFilters.addEventListener('click', (event) => {
        // Check if the clicked element is a button (and not the parent div itself)
        if (event.target.tagName === 'BUTTON') {
            currentFilter = event.target.dataset.filter; // Get filter type from data attribute
            updateFilterButtons(); // Update button active states
            renderTasks(); // Re-render tasks with the new filter
        }
    });

    // --- Initial Application Setup ---
    // These functions are called once when the DOM is fully loaded to
    // initialize the application state and display tasks.
    renderTasks();
    updateFilterButtons();
});