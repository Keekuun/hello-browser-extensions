const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// 模拟数据库
const tasksDB = {};
const imagesDB = {};

// 生成随机ID
function generateId() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

// 1. 提交任务
app.post('/ps_tasks/submit', (req, res) => {
   try {
       const { image_url, prompt, image_id, priority, editor } = req.body;

       if (!image_url || !prompt) {
           return res.status(400).json({
               code: 400,
               msg: "image_url and prompt are required",
               data: {}
           });
       }

       const taskId = generateId();
       const taskImageId = image_id || generateId();

       tasksDB[taskId] = {
           task_id: taskId,
           image_url,
           prompt,
           image_id: taskImageId,
           priority: priority || 10,
           editor: editor || 'anonymous',
           status: 'pending',
           created_at: new Date().toISOString()
       };

       // 模拟异步处理
       setTimeout(() => {
           tasksDB[taskId].status = 'ai_submitted';
       }, 1000);

       setTimeout(() => {
           tasksDB[taskId].status = 'processing';
       }, 2000);

       setTimeout(() => {
           // 从 https://lipsum.app/random/1600x900 获取 图片
           fetch('https://lipsum.app/random/954x954').then(res => {
               console.log('res', res.url)
               return res.url;
           }).then(url => {
               tasksDB[taskId].status = 'completed';
               imagesDB[taskImageId] = {
                   // random image url for mock
                   image_url: url,
                   image_rid: taskImageId
               };
           })
       }, 5000);

       res.status(200).json({
           code: 200,
           msg: "success",
           data: {
               task_id: taskId
           }
       });
   } catch (error) {
       res.status(500).json({
           code: 500,
           msg: "Internal Server Error",
           data: {}
       });
   }
});

// 2. 查询任务结果
app.get('/ps_tasks/result/:task_id', (req, res) => {
    const taskId = req.params.task_id;
    const task = tasksDB[taskId];

    if (!task) {
        return res.status(404).json({
            code: 404,
            msg: "Task not found",
            data: {}
        });
    }

    const responseData = {
        status: task.status,
        error_message: task.status === 'failed' ? 'Processing error' : ''
    };

    if (task.status === 'completed') {
        responseData.image_url = imagesDB[task.image_id].image_url;
        responseData.image_rid = imagesDB[task.image_id].image_rid;
    }

    res.status(200).json({
        code: 200,
        msg: "success",
        data: responseData
    });
});

// 启动服务器
const PORT = 23333;
app.listen(PORT, () => {
    console.log(`PS Task Mock Server running on http://localhost:${PORT}`);
});
