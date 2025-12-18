const fs = require('fs').promises;
const path = require('path');

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

/**
 * Custom error class for task processing errors
 */
class TaskProcessingError extends Error {
  constructor(message, taskId, taskName) {
    super(message);
    this.name = 'TaskProcessingError';
    this.taskId = taskId;
    this.taskName = taskName;
  }
}

/**
 * Custom error class for validation errors
 */
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

/**
 * Simulates asynchronous delay using setTimeout wrapped in a Promise
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Validates a task object
 * @param {Object} task - Task object to validate
 * @throws {TaskValidationError} If task is invalid
 */
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

/**
 * Simulates processing a single task
 * @param {Object} task - Task to process
 * @param {number} duration - Processing duration in milliseconds
 * @returns {Promise<string>} Success message
 */
const processSingleTask = async (task, duration) => {
  await delay(duration);
  return `Task "${task.name}" (ID: ${task.id}) completed successfully in ${duration}ms`;
};

// ============================================================================
// CALLBACK-BASED IMPLEMENTATION (Error-First Pattern)
// ============================================================================

/**
 * Processes a single task using error-first callback pattern
 * @param {Object} task - Task to process
 * @param {Function} callback - Error-first callback: (error, result) => void
 */
const processTaskCallback = (task, callback) => {
  // Simulate async operation with setTimeout
  setTimeout(() => {
    try {
      validateTask(task);
      const duration = task.duration || 300;
      
      // Simulate processing delay
      setTimeout(() => {
        const result = `Task "${task.name}" (ID: ${task.id}) completed successfully in ${duration}ms`;
        callback(null, result);
      }, duration);
    } catch (error) {
      callback(error, null);
    }
  }, 0);
};

/**
 * Processes all tasks sequentially using callbacks
 * @param {Array<Object>} tasks - Array of tasks to process
 * @param {Function} callback - Error-first callback: (error, results) => void
 */
const processTasksCallbacks = (tasks, callback) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return callback(new Error('Tasks must be a non-empty array'), null);
  }

  const results = [];
  let index = 0;

  const processNext = () => {
    if (index >= tasks.length) {
      return callback(null, results);
    }

    const task = tasks[index];
    processTaskCallback(task, (error, result) => {
      if (error) {
        return callback(error, results);
      }
      
      results.push(result);
      index++;
      processNext();
    });
  };

  processNext();
};

// ============================================================================
// PROMISE-BASED IMPLEMENTATION
// ============================================================================

/**
 * Processes a single task using Promises
 * @param {Object} task - Task to process
 * @returns {Promise<string>} Resolves with success message
 */
const processTaskPromise = (task) => {
  return new Promise((resolve, reject) => {
    try {
      validateTask(task);
      const duration = task.duration || 300;
      
      setTimeout(() => {
        const result = `Task "${task.name}" (ID: ${task.id}) completed successfully in ${duration}ms`;
        resolve(result);
      }, duration);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Processes all tasks sequentially using Promises
 * @param {Array<Object>} tasks - Array of tasks to process
 * @returns {Promise<Array<string>>} Resolves with array of results
 */
const processTasksPromises = async (tasks) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('Tasks must be a non-empty array');
  }

  const results = [];
  
  for (const task of tasks) {
    try {
      const result = await processTaskPromise(task);
      results.push(result);
    } catch (error) {
      throw error;
    }
  }
  
  return results;
};

/**
 * Processes tasks in parallel using Promise.all()
 * @param {Array<Object>} tasks - Array of tasks to process
 * @returns {Promise<Array<string>>} Resolves with array of results
 */
const processTasksParallel = async (tasks) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('Tasks must be a non-empty array');
  }

  const taskPromises = tasks.map((task) => processTaskPromise(task));
  
  try {
    return await Promise.all(taskPromises);
  } catch (error) {
    throw error;
  }
};

/**
 * Processes tasks using Promise.race() - completes when first task finishes
 * @param {Array<Object>} tasks - Array of tasks to process
 * @returns {Promise<string>} Resolves with the first completed task result
 */
const processTasksRace = async (tasks) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('Tasks must be a non-empty array');
  }

  const taskPromises = tasks.map((task) => processTaskPromise(task));
  
  try {
    return await Promise.race(taskPromises);
  } catch (error) {
    throw error;
  }
};

// ============================================================================
// ASYNC/AWAIT IMPLEMENTATION (Improved Readability)
// ============================================================================

/**
 * Processes a single task using async/await
 * @param {Object} task - Task to process
 * @returns {Promise<string>} Resolves with success message
 */
const processTaskAsync = async (task) => {
  // Validate task
  validateTask(task);
  
  // Get processing duration
  const duration = task.duration || 300;
  
  // Simulate async processing with delay
  await delay(duration);
  
  // Return result
  return `Task "${task.name}" (ID: ${task.id}) completed successfully in ${duration}ms`;
};

/**
 * Processes all tasks sequentially using async/await (clean and readable)
 * @param {Array<Object>} tasks - Array of tasks to process
 * @returns {Promise<Array<string>>} Resolves with array of results
 */
const processTasksAsyncAwait = async (tasks) => {
  // Validate input
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('Tasks must be a non-empty array');
  }

  const results = [];
  
  // Process each task sequentially with improved error handling
  for (const task of tasks) {
    try {
      const result = await processTaskAsync(task);
      results.push(result);
      console.log(`✓ ${result}`);
    } catch (error) {
      // Enhanced error handling with context
      if (error instanceof TaskProcessingError) {
        console.error(`✗ Error processing task ${error.taskId} (${error.taskName}): ${error.message}`);
        throw error; // Re-throw to stop processing
      } else if (error instanceof TaskValidationError) {
        console.error(`✗ Validation error: ${error.message}`);
        throw error;
      } else {
        console.error(`✗ Unexpected error: ${error.message}`);
        throw error;
      }
    }
  }
  
  return results;
};

/**
 * Processes tasks in parallel using async/await with Promise.all()
 * @param {Array<Object>} tasks - Array of tasks to process
 * @returns {Promise<Array<string>>} Resolves with array of results
 */
const processTasksParallelAsync = async (tasks) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('Tasks must be a non-empty array');
  }

  try {
    // Create array of promises
    const taskPromises = tasks.map((task) => processTaskAsync(task));
    
    // Wait for all tasks to complete
    const results = await Promise.all(taskPromises);
    
    return results;
  } catch (error) {
    // Enhanced error handling
    if (error instanceof TaskProcessingError) {
      console.error(`Parallel processing failed for task ${error.taskId}: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Processes tasks with Promise.race() using async/await
 * @param {Array<Object>} tasks - Array of tasks to process
 * @returns {Promise<string>} Resolves with the first completed task result
 */
const processTasksRaceAsync = async (tasks) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('Tasks must be a non-empty array');
  }

  try {
    const taskPromises = tasks.map((task) => processTaskAsync(task));
    const winner = await Promise.race(taskPromises);
    return winner;
  } catch (error) {
    console.error(`Race failed: ${error.message}`);
    throw error;
  }
};

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main function to demonstrate all three asynchronous patterns
 */
async function main() {
  try {
    // Load tasks from JSON file
    const tasksFilePath = path.join(__dirname, 'tasks.json');
    const tasksData = await fs.readFile(tasksFilePath, 'utf8');
    const allTasks = JSON.parse(tasksData);
    
    // Filter out the error task for sequential processing examples
    const validTasks = allTasks.filter(task => task.type !== 'error');
    const tasksWithError = allTasks; // Include error task for error handling demo

    console.log('='.repeat(70));
    console.log('ASYNCHRONOUS TASK RUNNER - DEMONSTRATION');
    console.log('='.repeat(70));
    console.log(`\nLoaded ${allTasks.length} tasks from tasks.json\n`);

    // ========================================================================
    // 1. CALLBACK-BASED IMPLEMENTATION
    // ========================================================================
    console.log('\n' + '-'.repeat(70));
    console.log('1. CALLBACK-BASED IMPLEMENTATION (Error-First Pattern)');
    console.log('-'.repeat(70));
    
    processTasksCallbacks(validTasks.slice(0, 3), (error, results) => {
      if (error) {
        console.error('Callback Error:', error.message);
      } else {
        console.log('\nCallback Results:');
        results.forEach((result, index) => {
          console.log(`  ${index + 1}. ${result}`);
        });
      }
    });

    // Wait a bit for callback to complete
    await delay(2000);

    // ========================================================================
    // 2. PROMISE-BASED IMPLEMENTATION
    // ========================================================================
    console.log('\n' + '-'.repeat(70));
    console.log('2. PROMISE-BASED IMPLEMENTATION');
    console.log('-'.repeat(70));
    
    try {
      const promiseResults = await processTasksPromises(validTasks.slice(0, 3));
      console.log('\nPromise Results (Sequential):');
      promiseResults.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result}`);
      });
    } catch (error) {
      console.error('Promise Error:', error.message);
    }

    // ========================================================================
    // 3. ASYNC/AWAIT IMPLEMENTATION (Improved Readability)
    // ========================================================================
    console.log('\n' + '-'.repeat(70));
    console.log('3. ASYNC/AWAIT IMPLEMENTATION (Sequential Processing)');
    console.log('-'.repeat(70));
    
    try {
      const asyncResults = await processTasksAsyncAwait(validTasks.slice(0, 3));
      console.log(`\n✓ All ${asyncResults.length} tasks completed successfully!`);
    } catch (error) {
      console.error(`\n✗ Processing stopped due to error: ${error.message}`);
    }

    // ========================================================================
    // 4. PROMISE.ALL() DEMONSTRATION (Parallel Processing)
    // ========================================================================
    console.log('\n' + '-'.repeat(70));
    console.log('4. PROMISE.ALL() - PARALLEL PROCESSING');
    console.log('-'.repeat(70));
    
    try {
      console.log('Processing tasks in parallel...');
      const startTime = Date.now();
      const parallelResults = await processTasksParallelAsync(validTasks.slice(0, 4));
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('\nParallel Results:');
      parallelResults.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result}`);
      });
      console.log(`\n✓ All tasks completed in parallel in ${duration}ms`);
    } catch (error) {
      console.error(`\n✗ Parallel processing error: ${error.message}`);
    }

    // ========================================================================
    // 5. PROMISE.RACE() DEMONSTRATION
    // ========================================================================
    console.log('\n' + '-'.repeat(70));
    console.log('5. PROMISE.RACE() - FIRST TO COMPLETE');
    console.log('-'.repeat(70));
    
    try {
      console.log('Racing tasks... (first to complete wins)');
      const raceResult = await processTasksRaceAsync(validTasks.slice(0, 5));
      console.log(`\n🏆 Winner: ${raceResult}`);
    } catch (error) {
      console.error(`\n✗ Race error: ${error.message}`);
    }

    // ========================================================================
    // 6. CUSTOM ERROR HANDLING DEMONSTRATION
    // ========================================================================
    console.log('\n' + '-'.repeat(70));
    console.log('6. CUSTOM ERROR HANDLING DEMONSTRATION');
    console.log('-'.repeat(70));
    
    try {
      // This will trigger the error task (include first 3 valid tasks + error task)
      const errorDemoTasks = [...validTasks.slice(0, 3), tasksWithError.find(t => t.type === 'error')];
      await processTasksAsyncAwait(errorDemoTasks);
    } catch (error) {
      if (error instanceof TaskProcessingError) {
        console.log(`\n✓ Custom error caught successfully:`);
        console.log(`  Error Type: ${error.name}`);
        console.log(`  Task ID: ${error.taskId}`);
        console.log(`  Task Name: ${error.taskName}`);
        console.log(`  Message: ${error.message}`);
      } else {
        console.error(`\n✗ Unexpected error type: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('DEMONSTRATION COMPLETE');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

// Export functions for use in other modules
module.exports = {
  // Callback-based
  processTaskCallback,
  processTasksCallbacks,
  
  // Promise-based
  processTaskPromise,
  processTasksPromises,
  processTasksParallel,
  processTasksRace,
  
  // Async/await
  processTaskAsync,
  processTasksAsyncAwait,
  processTasksParallelAsync,
  processTasksRaceAsync,
  
  // Utilities
  delay,
  validateTask,
  
  // Error classes
  TaskProcessingError,
  TaskValidationError
};

