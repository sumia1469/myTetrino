const http = require('http');
const fs = require('fs');
const path = require('path');
const {exec} = require('child_process');
const PORT = 4001;
const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? 'index.html' : req.url;
    filePath = path.join(__dirname, filePath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("File not found");
        } else {
            let ext = path.extname(filePath);
            let contentType = 'text/html';
            if (ext === '.js') contentType = 'text/javascript';
            if (ext === '.css') contentType = 'text/css';

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중...`);
    exec(`start http://localhost:${PORT}`);
});