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
app.post('/api/image/submit-task', (req, res) => {
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
                   result_url: url,
                   task_id: taskImageId
               };
           })
       }, 5000);

       res.status(200).json({
           task_id: taskId,
           message: "Task submitted successfully"
       });
   } catch (error) {
       res.status(500).json({
           task_id: "",
           message: "Failed to submit task"
       });
   }
});

// 2. 查询任务结果
app.post('/api/image/query-result', (req, res) => {
    const taskId = req.body.task_id;
    const task = tasksDB[taskId];

    if (!task) {
        return res.status(404).json({
            message: "Task not found",
            status: "failed"
        });
    }

    const responseData = {
        status: task.status,
        message: task.status === 'failed' ? 'Processing error' : ''
    };

    if (task.status === 'completed') {
        responseData.result_url = imagesDB[task.image_id].result_url;
        responseData.task_id = imagesDB[task.image_id].task_id;
    }

    res.status(200).json(responseData);
});

// 启动服务器
const PORT = 23333;
app.listen(PORT, () => {
    console.log(`PS Task Mock Server running on http://localhost:${PORT}`);
});
