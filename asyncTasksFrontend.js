// tasks data
const tasks = [
    { id: 1, name: "Process payment", duration: 500, shouldFail: false },
    { id: 2, name: "Send email notification", duration: 300, shouldFail: false },
    { id: 3, name: "Generate report", duration: 800, shouldFail: false },
    { id: 4, name: "Update user profile", duration: 400, shouldFail: false },
    { id: 5, name: "Validate input data", duration: 200, shouldFail: true },
    { id: 6, name: "Cache refresh", duration: 600, shouldFail: false }
];

// Callbacks - error first pattern
function processTaskCallback(task, callback) {
    setTimeout(() => {
        if (task.shouldFail) {
            callback(new Error(`Task "${task.name}" failed`), null);
        } else {
            callback(null, { taskId: task.id, taskName: task.name, status: "completed", duration: task.duration });
        }
    }, task.duration);
}

function processTasksCallbacks(tasks, callback) {
    let results = [];
    let count = 0;
    tasks.forEach((task) => {
        processTaskCallback(task, (error, result) => {
            if (error) {
                return callback(error, null);
            }
            results.push(result);
            count++;
            if (count === tasks.length) {
                callback(null, results);
            }
        });
    });
}

// Promises
function processTaskPromise(task) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (task.shouldFail) {
                reject(new Error(`Task "${task.name}" failed`));
            } else {
                resolve({ taskId: task.id, taskName: task.name, status: "completed", duration: task.duration });
            }
        }, task.duration);
    });
}

function processTasksPromises(tasks) {
    let promises = tasks.map(task => processTaskPromise(task));
    return Promise.all(promises);
}

// Async/Await
async function processTaskAsync(task) {
    return await processTaskPromise(task);
}

async function processTasksAsyncAwait(tasks) {
    let results = [];
    for (let task of tasks) {
        let result = await processTaskAsync(task);
        results.push(result);
    }
    return results;
}

// Promise.all and Promise.race
async function demonstratePromiseAll(tasks) {
    let start = Date.now();
    let promises = tasks.map(task => processTaskPromise(task));
    let results = await Promise.all(promises);
    return { results: results, duration: Date.now() - start };
}

async function demonstratePromiseRace(tasks) {
    let start = Date.now();
    let promises = tasks.map(task => processTaskPromise(task));
    let winner = await Promise.race(promises);
    return { winner: winner, duration: Date.now() - start };
}

// UI stuff
function renderTasks() {
    let container = document.getElementById('tasks-grid');
    container.innerHTML = tasks.map(task => `
        <div class="task-card pending" data-task-id="${task.id}">
            <div class="task-name">${task.name}</div>
            <div class="task-info">ID: ${task.id} • ${task.duration}ms</div>
            <div class="task-status pending">Pending</div>
        </div>
    `).join('');
}

function updateTaskStatus(taskId, status) {
    let card = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!card) return;
    
    card.className = `task-card ${status}`;
    let statusEl = card.querySelector('.task-status');
    if (statusEl) {
        statusEl.className = `task-status ${status}`;
        if (status === 'processing') {
            statusEl.innerHTML = '<span class="spinner"></span> Processing';
        } else {
            statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
    }
}

function addResult(title, message, type = 'info') {
    let container = document.getElementById('results-container');
    let emptyState = container.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    let item = document.createElement('div');
    item.className = `result-item ${type}`;
    item.innerHTML = `
        <div class="result-title">${title}</div>
        <div class="result-message">${message}</div>
    `;
    container.insertBefore(item, container.firstChild);
}

function clearResults() {
    document.getElementById('results-container').innerHTML = '<div class="empty-state">Click a button to run tasks</div>';
    tasks.forEach(task => updateTaskStatus(task.id, 'pending'));
}

function disableButtons(disable = true) {
    document.querySelectorAll('.buttons button').forEach(btn => {
        btn.disabled = disable;
    });
}

// Demo functions
function runCallbacks() {
    clearResults();
    disableButtons(true);
    let validTasks = tasks.filter(t => !t.shouldFail).slice(0, 3);
    addResult('Callbacks', 'Running with callbacks...', 'info');

    processTasksCallbacks(validTasks, (error, results) => {
        if (error) {
            addResult('Error', error.message, 'error');
        } else {
            results.forEach(r => {
                updateTaskStatus(r.taskId, 'completed');
                addResult('Done', `Task ${r.taskId}: ${r.taskName}`, 'success');
            });
        }
        disableButtons(false);
    });
}

async function runPromises() {
    clearResults();
    disableButtons(true);
    let validTasks = tasks.filter(t => !t.shouldFail).slice(0, 3);
    addResult('Promises', 'Running with promises...', 'info');

    try {
        let results = await processTasksPromises(validTasks);
        results.forEach(r => {
            updateTaskStatus(r.taskId, 'completed');
            addResult('Done', `Task ${r.taskId}: ${r.taskName}`, 'success');
        });
    } catch (error) {
        addResult('Error', error.message, 'error');
    }
    disableButtons(false);
}

async function runAsyncAwait() {
    clearResults();
    disableButtons(true);
    let validTasks = tasks.filter(t => !t.shouldFail).slice(0, 3);
    addResult('Async/Await', 'Running with async/await...', 'info');

    try {
        let results = await processTasksAsyncAwait(validTasks);
        results.forEach(r => {
            updateTaskStatus(r.taskId, 'completed');
            addResult('Done', `Task ${r.taskId}: ${r.taskName}`, 'success');
        });
    } catch (error) {
        addResult('Error', error.message, 'error');
    }
    disableButtons(false);
}

async function runPromiseAll() {
    clearResults();
    disableButtons(true);
    let validTasks = tasks.filter(t => !t.shouldFail).slice(0, 4);
    validTasks.forEach(t => updateTaskStatus(t.id, 'processing'));
    addResult('Promise.all()', 'Running tasks in parallel...', 'info');

    try {
        let data = await demonstratePromiseAll(validTasks);
        validTasks.forEach(t => updateTaskStatus(t.id, 'completed'));
        data.results.forEach(r => {
            addResult('Done', `Task ${r.taskId}: ${r.taskName}`, 'success');
        });
        addResult('Complete', `All tasks done in ${data.duration}ms`, 'success');
    } catch (error) {
        addResult('Error', error.message, 'error');
    }
    disableButtons(false);
}

async function runPromiseRace() {
    clearResults();
    disableButtons(true);
    let validTasks = tasks.filter(t => !t.shouldFail).slice(0, 4);
    validTasks.forEach(t => updateTaskStatus(t.id, 'processing'));
    addResult('Promise.race()', 'Racing tasks...', 'info');

    try {
        let data = await demonstratePromiseRace(validTasks);
        updateTaskStatus(data.winner.taskId, 'completed');
        addResult('Winner', `Task ${data.winner.taskId}: ${data.winner.taskName} won in ${data.duration}ms`, 'warning');
    } catch (error) {
        addResult('Error', error.message, 'error');
    }
    disableButtons(false);
}

async function runErrorDemo() {
    clearResults();
    disableButtons(true);
    let tasksWithError = [...tasks.filter(t => !t.shouldFail).slice(0, 3), tasks.find(t => t.shouldFail)];
    addResult('Error Demo', 'Testing error handling...', 'info');

    tasksWithError.forEach(task => {
        updateTaskStatus(task.id, 'processing');
        processTaskCallback(task, (error, result) => {
            if (error) {
                updateTaskStatus(task.id, 'error');
                addResult('Failed', `Task ${task.id}: ${error.message}`, 'error');
            } else {
                updateTaskStatus(task.id, 'completed');
                addResult('Done', `Task ${result.taskId}: ${result.taskName}`, 'success');
            }
        });
    });

    setTimeout(() => disableButtons(false), 1500);
}

// init
renderTasks();
