// Async Task Processing Demo
// Shows callbacks, promises, and async/await

// Sample tasks
const tasks = [
    { id: 1, name: "Process payment", duration: 500, shouldFail: false },
    { id: 2, name: "Send email notification", duration: 300, shouldFail: false },
    { id: 3, name: "Generate report", duration: 800, shouldFail: false },
    { id: 4, name: "Update user profile", duration: 400, shouldFail: false },
    { id: 5, name: "Validate input data", duration: 200, shouldFail: true },
    { id: 6, name: "Cache refresh", duration: 600, shouldFail: false }
];

// Callback version - error first pattern
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

// Promise version
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

// Async/await version
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

// Promise.all() - runs all in parallel
async function demonstratePromiseAll(tasks) {
    let start = Date.now();
    let promises = tasks.map(task => processTaskPromise(task));
    let results = await Promise.all(promises);
    return { results, duration: Date.now() - start };
}

// Promise.race() - first one to finish wins
async function demonstratePromiseRace(tasks) {
    let start = Date.now();
    let promises = tasks.map(task => processTaskPromise(task));
    let winner = await Promise.race(promises);
    return { winner, duration: Date.now() - start };
}

// Custom error class
class TaskProcessingError extends Error {
    constructor(message, taskId, taskName) {
        super(message);
        this.name = "TaskProcessingError";
        this.taskId = taskId;
        this.taskName = taskName;
    }
}

function processTaskWithCustomError(task, callback) {
    setTimeout(() => {
        if (task.shouldFail) {
            let error = new TaskProcessingError(`Failed: "${task.name}"`, task.id, task.name);
            callback(error, null);
        } else {
            callback(null, { taskId: task.id, taskName: task.name, status: "completed", duration: task.duration });
        }
    }, task.duration);
}

// Run everything
async function main() {
    console.log("========================================");
    console.log("Async Task Processing Demo");
    console.log("========================================\n");

    let validTasks = tasks.filter(t => !t.shouldFail).slice(0, 3);

    // Callbacks
    console.log("--- Callbacks ---");
    processTasksCallbacks(validTasks, (error, results) => {
        if (error) {
            console.error("Error:", error.message);
        } else {
            console.log("Results:", results);
        }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Promises
    console.log("\n--- Promises ---");
    try {
        let results = await processTasksPromises(validTasks);
        console.log("Results:", results);
    } catch (error) {
        console.error("Error:", error.message);
    }

    // Async/Await
    console.log("\n--- Async/Await ---");
    try {
        let results = await processTasksAsyncAwait(validTasks);
        console.log("Results:", results);
    } catch (error) {
        console.error("Error:", error.message);
    }

    // Promise.all
    console.log("\n--- Promise.all() ---");
    let allResult = await demonstratePromiseAll(validTasks);
    console.log(`Completed ${allResult.results.length} tasks in ${allResult.duration}ms`);

    // Promise.race
    console.log("\n--- Promise.race() ---");
    let raceResult = await demonstratePromiseRace(tasks.filter(t => !t.shouldFail).slice(0, 4));
    console.log("Winner:", raceResult.winner.taskName, `(${raceResult.duration}ms)`);

    // Error handling
    console.log("\n--- Error Handling ---");
    let errorTask = tasks.find(t => t.shouldFail);
    processTaskWithCustomError(errorTask, (error, result) => {
        if (error) {
            console.error("Custom Error:", error.name, "-", error.message);
            console.error("Task ID:", error.taskId);
        }
    });

    await new Promise(resolve => setTimeout(resolve, 500));
}

if (require.main === module) {
    main();
}

module.exports = {
    tasks,
    processTaskCallback,
    processTasksCallbacks,
    processTaskPromise,
    processTasksPromises,
    processTaskAsync,
    processTasksAsyncAwait,
    demonstratePromiseAll,
    demonstratePromiseRace,
    processTaskWithCustomError,
    TaskProcessingError
};
