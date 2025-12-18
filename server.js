const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // Get file path
    const filePath = path.join(__dirname, pathname);

    try {
        // Read file
        const data = await fs.readFile(filePath);
        
        // Get file extension for MIME type
        const ext = path.extname(pathname).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Set headers
        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        });

        // Send file
        res.end(data);
    } catch (error) {
        // File not found
        if (error.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - File Not Found</h1>');
        } else {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('<h1>500 - Internal Server Error</h1>');
        }
    }
});

server.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 Server is running!');
    console.log('='.repeat(60));
    console.log(`📍 Local:   http://localhost:${PORT}`);
    console.log(`📍 Network: http://127.0.0.1:${PORT}`);
    console.log('='.repeat(60));
    console.log('\nPress Ctrl+C to stop the server\n');
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use!`);
        console.log('\nTry one of these solutions:');
        console.log('1. Close the other application using port 3000');
        console.log('2. Use a different port by setting PORT environment variable:');
        console.log('   set PORT=3001 && node server.js');
        console.log('3. Or kill the process on port 3000:\n');
        console.log('   netstat -ano | findstr :3000');
        console.log('   taskkill /PID <PID_NUMBER> /F\n');
    } else {
        console.error('❌ Server error:', err.message);
    }
    process.exit(1);
});

