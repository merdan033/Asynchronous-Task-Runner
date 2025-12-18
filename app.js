// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

class TaskProcessingError extends Error {
    constructor(message, taskId, taskName) {
        super(message);
        this.name = 'TaskProcessingError';
        this.taskId = taskId;
        this.taskName = taskName;
    }
}

class TaskValidationError extends Error {
    constructor(message, task) {
        super(message);
        this.name = 'TaskValidationError';
        this.task = task;
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const validateTask = (task) => {
    if (!task || typeof task !== 'object') {
        throw new TaskValidationError('Task must be an object', task);
    }
    if (!task.id || !task.name) {
        throw new TaskValidationError('Task must have id and name properties', task);
    }
    if (task.type === 'error') {
        throw new TaskProcessingError(
            `Cannot process task "${task.name}" - simulated error for demonstration`,
            task.id,
            task.name
        );
    }
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let tasks = [];
let startTime = null;

// ============================================================================
// UI UPDATE FUNCTIONS
// ============================================================================

function updateTaskStatus(taskId, status, result = null) {
    const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!taskCard) {
        console.warn(`Task card not found for task ID: ${taskId}`);
        return;
    }

    taskCard.className = `task-card ${status}`;
    const statusElement = taskCard.querySelector('.task-status');
    if (statusElement) {
        if (status === 'processing') {
            statusElement.innerHTML = '<span class="loading-spinner"></span> Processing...';
        } else {
            statusElement.className = `task-status ${status}`;
            statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
    }
}

function addResult(result, type = 'info') {
    const container = document.getElementById('results-container');
    if (!container) {
        console.error('Results container not found');
        return;
    }
    
    // Remove empty state if present
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const resultItem = document.createElement('div');
    resultItem.className = `result-item ${type}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    // Handle both object and string inputs
    const resultObj = typeof result === 'string' ? { message: result } : result;
    
    resultItem.innerHTML = `
        <div class="result-header">
            <div class="result-title">${resultObj.title || 'Task Result'}</div>
            <div class="result-time">${timeString}</div>
        </div>
        <div class="result-message">${resultObj.message || result}</div>
        ${resultObj.stats ? `<div class="result-stats">${resultObj.stats}</div>` : ''}
    `;

    container.insertBefore(resultItem, container.firstChild);
    resultItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearResults() {
    const container = document.getElementById('results-container');
    container.innerHTML = '<div class="empty-state"><p>Click a button above to run tasks using different async patterns</p></div>';
}

function resetAllTasks() {
    tasks.forEach(task => {
        updateTaskStatus(task.id, 'pending');
    });
}

function disableButtons(disable = true) {
    const buttons = document.querySelectorAll('.btn:not(#btn-clear)');
    buttons.forEach(btn => {
        btn.disabled = disable;
    });
}

// ============================================================================
// CALLBACK-BASED IMPLEMENTATION (Error-First Pattern)
// ============================================================================

function processTaskCallback(task, callback) {
    updateTaskStatus(task.id, 'processing');
    
    setTimeout(() => {
        try {
            validateTask(task);
            const duration = task.duration || 300;
            
            setTimeout(() => {
                updateTaskStatus(task.id, 'completed');
                const result = `Task "${task.name}" (ID: ${task.id}) completed successfully in ${duration}ms`;
                callback(null, result);
            }, duration);
        } catch (error) {
            updateTaskStatus(task.id, 'error');
            callback(error, null);
        }
    }, 0);
}

async function runCallbacks() {
    resetAllTasks();
    clearResults();
    disableButtons(true);
    startTime = Date.now();

    const tasksToProcess = tasks.filter(t => t.type !== 'error').slice(0, 3);
    
    addResult({
        title: 'Callback-Based Implementation',
        message: 'Processing tasks using error-first callback pattern...',
        type: 'info'
    });

    // Wrap callback pattern in Promise for easier handling
    return new Promise((resolve) => {
        const results = [];
        let index = 0;

        const processNext = () => {
            if (index >= tasksToProcess.length) {
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                addResult({
                    title: 'Callback Results Complete',
                    message: `All ${results.length} tasks completed successfully!`,
                    stats: `<div class="stat-item">Total Time: <span class="stat-value">${duration}ms</span></div><div class="stat-item">Tasks: <span class="stat-value">${results.length}</span></div>`,
                    type: 'success'
                });
                
                disableButtons(false);
                resolve(results);
                return;
            }

            const task = tasksToProcess[index];
            processTaskCallback(task, (error, result) => {
                if (error) {
                    addResult({
                        title: 'Callback Error',
                        message: `Error: ${error.message}`,
                        type: 'error'
                    });
                    disableButtons(false);
                    resolve(results);
                } else {
                    addResult({
                        message: result,
                        type: 'success'
                    });
                    results.push(result);
                    index++;
                    processNext();
                }
            });
        };

        processNext();
    });
}

// ============================================================================
// PROMISE-BASED IMPLEMENTATION
// ============================================================================

function processTaskPromise(task) {
    updateTaskStatus(task.id, 'processing');
    
    return new Promise((resolve, reject) => {
        try {
            validateTask(task);
            const duration = task.duration || 300;
            
            setTimeout(() => {
                updateTaskStatus(task.id, 'completed');
                const result = `Task "${task.name}" (ID: ${task.id}) completed successfully in ${duration}ms`;
                resolve(result);
            }, duration);
        } catch (error) {
            updateTaskStatus(task.id, 'error');
            reject(error);
        }
    });
}

async function runPromises() {
    resetAllTasks();
    clearResults();
    disableButtons(true);
    startTime = Date.now();

    const tasksToProcess = tasks.filter(t => t.type !== 'error').slice(0, 3);
    
    addResult({
        title: 'Promise-Based Implementation',
        message: 'Processing tasks sequentially using Promises...',
        type: 'info'
    });

    try {
        const results = [];
        for (const task of tasksToProcess) {
            const result = await processTaskPromise(task);
            addResult({
                message: result,
                type: 'success'
            });
            results.push(result);
        }

        const endTime = Date.now();
        const duration = endTime - startTime;
        
        addResult({
            title: 'Promise Results Complete',
            message: `All ${results.length} tasks completed successfully!`,
            stats: `<div class="stat-item">Total Time: <span class="stat-value">${duration}ms</span></div><div class="stat-item">Tasks: <span class="stat-value">${results.length}</span></div>`,
            type: 'success'
        });
    } catch (error) {
        addResult({
            title: 'Promise Error',
            message: `Error: ${error.message}`,
            type: 'error'
        });
    } finally {
        disableButtons(false);
    }
}

// ============================================================================
// ASYNC/AWAIT IMPLEMENTATION (Improved Readability)
// ============================================================================

async function processTaskAsync(task) {
    validateTask(task);
    updateTaskStatus(task.id, 'processing');
    
    const duration = task.duration || 300;
    await delay(duration);
    
    updateTaskStatus(task.id, 'completed');
    return `Task "${task.name}" (ID: ${task.id}) completed successfully in ${duration}ms`;
}

async function runAsyncAwait() {
    resetAllTasks();
    clearResults();
    disableButtons(true);
    startTime = Date.now();

    const tasksToProcess = tasks.filter(t => t.type !== 'error').slice(0, 3);
    
    addResult({
        title: 'Async/Await Implementation',
        message: 'Processing tasks sequentially using async/await (clean and readable)...',
        type: 'info'
    });

    try {
        const results = [];
        for (const task of tasksToProcess) {
            const result = await processTaskAsync(task);
            addResult({
                message: result,
                type: 'success'
            });
            results.push(result);
        }

        const endTime = Date.now();
        const duration = endTime - startTime;
        
        addResult({
            title: 'Async/Await Results Complete',
            message: `All ${results.length} tasks completed successfully!`,
            stats: `<div class="stat-item">Total Time: <span class="stat-value">${duration}ms</span></div><div class="stat-item">Tasks: <span class="stat-value">${results.length}</span></div>`,
            type: 'success'
        });
    } catch (error) {
        if (error instanceof TaskProcessingError) {
            addResult({
                title: 'Task Processing Error',
                message: `Task ${error.taskId} (${error.taskName}): ${error.message}`,
                type: 'error'
            });
        } else {
            addResult({
                title: 'Error',
                message: `Unexpected error: ${error.message}`,
                type: 'error'
            });
        }
    } finally {
        disableButtons(false);
    }
}

// ============================================================================
// PROMISE.ALL() - PARALLEL PROCESSING
// ============================================================================

async function runPromiseAll() {
    resetAllTasks();
    clearResults();
    disableButtons(true);
    startTime = Date.now();

    const tasksToProcess = tasks.filter(t => t.type !== 'error').slice(0, 4);
    
    addResult({
        title: 'Promise.all() - Parallel Processing',
        message: `Processing ${tasksToProcess.length} tasks in parallel...`,
        type: 'info'
    });

    try {
        const taskPromises = tasksToProcess.map(task => {
            updateTaskStatus(task.id, 'processing');
            return processTaskAsync(task);
        });

        const results = await Promise.all(taskPromises);
        
        tasksToProcess.forEach(task => {
            updateTaskStatus(task.id, 'completed');
        });

        results.forEach(result => {
            addResult({
                message: result,
                type: 'success'
            });
        });

        const endTime = Date.now();
        const duration = endTime - startTime;
        const maxDuration = Math.max(...tasksToProcess.map(t => t.duration));
        
        addResult({
            title: 'Promise.all() Complete',
            message: `All ${results.length} tasks completed in parallel!`,
            stats: `<div class="stat-item">Total Time: <span class="stat-value">${duration}ms</span></div><div class="stat-item">Longest Task: <span class="stat-value">${maxDuration}ms</span></div><div class="stat-item">Efficiency: <span class="stat-value">${((maxDuration / duration) * 100).toFixed(0)}%</span></div>`,
            type: 'success'
        });
    } catch (error) {
        if (error instanceof TaskProcessingError) {
            addResult({
                title: 'Parallel Processing Error',
                message: `Task ${error.taskId}: ${error.message}`,
                type: 'error'
            });
        } else {
            addResult({
                title: 'Error',
                message: `Error: ${error.message}`,
                type: 'error'
            });
        }
    } finally {
        disableButtons(false);
    }
}

// ============================================================================
// PROMISE.RACE() - FIRST TO COMPLETE
// ============================================================================

async function runPromiseRace() {
    resetAllTasks();
    clearResults();
    disableButtons(true);
    startTime = Date.now();

    const tasksToProcess = tasks.filter(t => t.type !== 'error').slice(0, 5);
    
    addResult({
        title: 'Promise.race() - First to Complete',
        message: `Racing ${tasksToProcess.length} tasks (first to complete wins)...`,
        type: 'info'
    });

    try {
        const taskPromises = tasksToProcess.map(task => {
            updateTaskStatus(task.id, 'processing');
            return processTaskAsync(task).then(result => ({ task, result }));
        });

        const winner = await Promise.race(taskPromises);
        
        // Update winner status
        updateTaskStatus(winner.task.id, 'completed');
        
        // Update other tasks (they're still processing but we only care about winner)
        tasksToProcess.forEach(task => {
            if (task.id !== winner.task.id) {
                updateTaskStatus(task.id, 'pending');
            }
        });

        const endTime = Date.now();
        const duration = endTime - startTime;
        
        addResult({
            title: '🏆 Race Winner!',
            message: winner.result,
            stats: `<div class="stat-item">Winner Time: <span class="stat-value">${duration}ms</span></div><div class="stat-item">Task Duration: <span class="stat-value">${winner.task.duration}ms</span></div>`,
            type: 'warning'
        });
    } catch (error) {
        addResult({
            title: 'Race Error',
            message: `Error: ${error.message}`,
            type: 'error'
        });
    } finally {
        disableButtons(false);
    }
}

// ============================================================================
// ERROR HANDLING DEMONSTRATION
// ============================================================================

async function runErrorDemo() {
    resetAllTasks();
    clearResults();
    disableButtons(true);
    startTime = Date.now();

    // Include first 3 valid tasks + error task
    const validTasks = tasks.filter(t => t.type !== 'error').slice(0, 3);
    const errorTask = tasks.find(t => t.type === 'error');
    const tasksToProcess = [...validTasks, errorTask];
    
    addResult({
        title: 'Error Handling Demonstration',
        message: 'Processing tasks with error handling - an error will occur...',
        type: 'info'
    });

    try {
        for (const task of tasksToProcess) {
            try {
                const result = await processTaskAsync(task);
                addResult({
                    message: result,
                    type: 'success'
                });
            } catch (error) {
                if (error instanceof TaskProcessingError) {
                    updateTaskStatus(task.id, 'error');
                    addResult({
                        title: 'Custom Error Caught',
                        message: `Task ${error.taskId} (${error.taskName}): ${error.message}`,
                        stats: `<div class="stat-item">Error Type: <span class="stat-value">${error.name}</span></div><div class="stat-item">Task ID: <span class="stat-value">${error.taskId}</span></div>`,
                        type: 'error'
                    });
                    throw error; // Re-throw to stop processing
                } else {
                    throw error;
                }
            }
        }
    } catch (error) {
        if (error instanceof TaskProcessingError) {
            addResult({
                title: 'Error Handling Complete',
                message: 'Custom error was caught and handled gracefully. Processing stopped.',
                type: 'error'
            });
        }
    } finally {
        disableButtons(false);
    }
}

// ============================================================================
// TASK DISPLAY FUNCTIONS
// ============================================================================

function renderTasks() {
    const container = document.getElementById('tasks-list');
    if (!container) {
        console.error('Tasks list container not found');
        return;
    }
    
    if (!Array.isArray(tasks) || tasks.length === 0) {
        container.innerHTML = '<p>No tasks available</p>';
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="task-card pending" data-task-id="${task.id}">
            <div class="task-header">
                <div class="task-name">${task.name || 'Unnamed Task'}</div>
                <div class="task-id">#${task.id || 'N/A'}</div>
            </div>
            <div class="task-type">Type: ${task.type || 'unknown'}</div>
            <div class="task-duration">Duration: ${task.duration || 0}ms</div>
            <div class="task-duration">Priority: ${task.priority || 'unknown'}</div>
            <div class="task-status pending">Pending</div>
        </div>
    `).join('');
}

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init() {
    try {
        // Load tasks from JSON file
        const response = await fetch('tasks.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        tasks = await response.json();
        
        if (!Array.isArray(tasks) || tasks.length === 0) {
            throw new Error('Tasks data is not a valid array or is empty');
        }
        
        // Render tasks
        renderTasks();
        
        // Attach event listeners
        const btnCallbacks = document.getElementById('btn-callbacks');
        const btnPromises = document.getElementById('btn-promises');
        const btnAsyncAwait = document.getElementById('btn-async-await');
        const btnPromiseAll = document.getElementById('btn-promise-all');
        const btnPromiseRace = document.getElementById('btn-promise-race');
        const btnErrorDemo = document.getElementById('btn-error-demo');
        const btnClear = document.getElementById('btn-clear');
        
        if (btnCallbacks) btnCallbacks.addEventListener('click', runCallbacks);
        if (btnPromises) btnPromises.addEventListener('click', runPromises);
        if (btnAsyncAwait) btnAsyncAwait.addEventListener('click', runAsyncAwait);
        if (btnPromiseAll) btnPromiseAll.addEventListener('click', runPromiseAll);
        if (btnPromiseRace) btnPromiseRace.addEventListener('click', runPromiseRace);
        if (btnErrorDemo) btnErrorDemo.addEventListener('click', runErrorDemo);
        if (btnClear) btnClear.addEventListener('click', () => {
            clearResults();
            resetAllTasks();
        });
        
    } catch (error) {
        console.error('Error initializing app:', error);
        // Try to add result, but if DOM isn't ready, just log it
        try {
            addResult({
                title: 'Initialization Error',
                message: `Failed to load tasks: ${error.message}`,
                type: 'error'
            });
        } catch (e) {
            console.error('Could not display error in UI:', e);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

