# How to Use This Project From Any Location

## Method 1: Clone from GitHub

1. Open terminal/command prompt anywhere
2. Navigate to where you want the project:
   ```bash
   cd C:\Projects
   # or
   cd D:\MyProjects
   # or anywhere you want
   ```

3. Clone the repository:
   ```bash
   git clone https://github.com/merdan033/Asynchronous-Task-Runner.git
   ```

4. Go into the folder:
   ```bash
   cd Asynchronous-Task-Runner
   ```

5. Run it:
   ```bash
   node asyncTasks.js
   # or
   node server.js
   ```

## Method 2: Move Current Project

1. Copy the entire `Asignment9` folder anywhere you want
2. The code will work because it uses relative paths (__dirname)

## Method 3: Download ZIP from GitHub

1. Go to: https://github.com/merdan033/Asynchronous-Task-Runner
2. Click "Code" → "Download ZIP"
3. Extract anywhere
4. Run the same commands

## The Project Works Anywhere Because:
- Uses `__dirname` (relative to script location)
- No hardcoded paths
- All files are in the same folder
- Just need Node.js installed

