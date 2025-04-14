const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// 图片存放目录
const IMAGE_FOLDER = 'images';

// 确保图片目录存在
if (!fs.existsSync(IMAGE_FOLDER)) {
    fs.mkdirSync(IMAGE_FOLDER);
}

// 处理随机图片请求
app.get('/', (req, res) => {
    // 获取指定目录中的所有文件
    fs.readdir(IMAGE_FOLDER, (err, allFiles) => {
        if (err) {
            return res.status(500).send('Error reading directory');
        }

        // 过滤出所有图片文件
        const imageFiles = allFiles.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png'].includes(ext);
        });

        // 异常处理
        if (imageFiles.length === 0) {
            return res.status(404).send('No images found!');
        }

        // 随机选择一张图片
        const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];

        // 发送图片文件
        const imagePath = path.join(__dirname, IMAGE_FOLDER, randomImage);
        res.sendFile(imagePath);
    });
});

// 处理模板图片请求
app.get('/template_image.jpg', (req, res) => {
    const imagePath = path.join(__dirname, 'template_image.jpg');
    fs.readFile(imagePath, (err, data) => {
        if (err) {
            res.status(404).send('Image not found');
        } else {
            res.setHeader('Content-Type', 'image/jpeg');
            res.send(data);
        }
    });
});

// 启动 Express 服务
const port = 5000;
const host = '127.0.0.1';
app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
});