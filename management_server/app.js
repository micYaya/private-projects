const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const { callDoubaoAPI } = require('./process.js');

const session = require('express-session');
const indexRouter = require('./index.js');
const userRouter = require('./user.js');

const app = express();
const port = 3000;

// 配置中间件
app.use(cors());
// app.use(cors({ 
//   origin: 'http://localhost:5173',
//   credentials: true 
// })); 
app.use(bodyParser.json());

// 配置 Session 中间件
app.use(session({
  secret: 'yayamic', // 自定义密钥
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000 // 会话有效期，可根据需求调整 
  }
}));

// 先加载开放接口
app.use(indexRouter);
app.use(userRouter);
// const auth = require('./middleware/auth');
// // 下面的接口都需要登录才能访问
// app.use(auth); // 全局挂载中间件后，下面所有 /api/* 路径均要求有效 token
// // 受保护的数据接口

// 创建数据库连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'device_management'
});

// 获取所有设备信息
app.get('/api/devices', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM devices');
        res.json(rows);
    } catch (error) {
        console.error('获取设备信息失败', error);
        res.status(500).json({ error: '获取设备信息失败' });
    }
});

// 根据deviceId获取单个设备的信息
app.get('/api/devices/:deviceId', async (req, res) => {
  const deviceId = req.params.deviceId;  // 路径参数
  try {
    // 使用数据库连接池pool执行一条SQL查询语句
    const [rows] = await pool.execute('SELECT * FROM devices WHERE deviceId = ?', [deviceId]);
    if (rows.length === 0) {
      console.log('该设备编号不存在');
      return res.json({ exist: 0, error: '该设备编号不存在' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('获取此Id对应的设备信息失败', error);
    // 500状态码表示服务器内部错误
    res.json({ error: '获取此Id对应的设备信息失败' });
  }
});

// 添加设备信息
app.post('/api/devices', async (req, res) => {
  const { deviceId, deviceName, deviceModel, manufactureDate, inspectionDate, manufacturer, productionPlace, deviceStatus } = req.body;
  try {
    // 先打印接收到的前端数据，确认数据是否正常
    console.log('后端接收到的添加设备数据：', { deviceId, deviceName, deviceModel, manufactureDate, inspectionDate, manufacturer, productionPlace, deviceStatus }); 
    const [result] = await pool.execute(
      'INSERT INTO devices (deviceId, deviceName, deviceModel, manufactureDate, inspectionDate, manufacturer, productionPlace, deviceStatus) VALUES (?,?,?,?,?,?,?,?)',
      [deviceId, deviceName, deviceModel, manufactureDate, inspectionDate, manufacturer, productionPlace, deviceStatus]
    );
    res.status(201).json({ id: result.insertId, deviceId, deviceName, deviceModel, manufactureDate, inspectionDate, manufacturer, productionPlace, deviceStatus });
  } catch (error) {
    // 打印完整的数据库错误信息
    console.error('数据库插入错误详情：', error); 
    res.status(500).json({ error: '添加设备信息失败' });
  }
});

// 更新设备信息
app.put('/api/devices/:id', async (req, res) => {
    const id = req.params.id;
    const { deviceId, deviceName, deviceModel, manufactureDate, inspectionDate, manufacturer, productionPlace, deviceStatus } = req.body;
    try {
        await pool.execute(
            'UPDATE devices SET deviceId = ?, deviceName = ?, deviceModel = ?, manufactureDate = ?, inspectionDate = ?, manufacturer = ?, productionPlace = ?, deviceStatus = ? WHERE id = ?',
            [deviceId, deviceName, deviceModel, manufactureDate, inspectionDate, manufacturer, productionPlace, deviceStatus, id]
        );
        res.json({ id, deviceId, deviceName, deviceModel, manufactureDate, inspectionDate, manufacturer, productionPlace, deviceStatus });
    } catch (error) {
        console.error('更新设备信息失败', error);
        res.status(500).json({ error: '更新设备信息失败' });
    }
});

// 更新设备检测状态
app.put('/api/devices/:id/status', async (req, res) => {
  const id = req.params.id;
  const { deviceStatus } = req.body;

  try {
      await pool.execute(
          'UPDATE devices SET deviceStatus = ? WHERE deviceId = ?',
          [deviceStatus, id]
      );
      res.json({ id, deviceStatus });
  } catch (error) {
      console.error('更新设备检测状态失败', error);
      res.status(500).json({ error: '更新设备检测状态失败' });
  }
});

// 删除设备信息
app.delete('/api/devices/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await pool.execute('DELETE FROM devices WHERE id = ?', [id]);
        res.json({ message: '设备信息删除成功' });
    } catch (error) {
        console.error('删除设备信息失败', error);
        res.status(500).json({ error: '删除设备信息失败' });
    }
});

// 获取所有检测项目信息
app.get('/api/inspection_items', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM inspection_items');
        res.json(rows);
    } catch (error) {
        console.error('获取检测项目信息失败', error);
        res.status(500).json({ error: '获取检测项目信息失败' });
    }
});

// 添加检测项目信息
app.post('/api/inspection_items', async (req, res) => {
    const { project, gear, percentage, data_lower_limit, data_upper_limit, measured_data, task_id } = req.body;
    try {
        console.log('后端接收到的添加检测项目数据：', { project, gear, percentage, data_lower_limit, data_upper_limit, measured_data, task_id });
        const [result] = await pool.execute(
            'INSERT INTO inspection_items (project, gear, percentage, data_lower_limit, data_upper_limit, measured_data, task_id) VALUES (?,?,?,?,?,?,?)',
            [project, gear, percentage, data_lower_limit, data_upper_limit, measured_data, task_id]
        );
        res.status(201).json({ id: result.insertId, project, gear, percentage, data_lower_limit, data_upper_limit, measured_data, task_id });
    } catch (error) {
        console.error('数据库插入检测项目错误详情：', error);
        res.status(500).json({ error: '添加检测项目信息失败' });
    }
});

// 更新检测项目信息
app.put('/api/inspection_items/:id', async (req, res) => {
    const id = req.params.id;
    const { project, gear, percentage, data_lower_limit, data_upper_limit, measured_data, task_id } = req.body;
    try {
        await pool.execute(
            'UPDATE inspection_items SET project = ?, gear = ?, percentage = ?, data_lower_limit = ?, data_upper_limit = ?, measured_data = ?, task_id = ? WHERE item_id = ?',
            [project, gear, percentage, data_lower_limit, data_upper_limit, measured_data, task_id, id]
        );
        res.json({ id, project, gear, percentage, data_lower_limit, data_upper_limit, measured_data, task_id });
    } catch (error) {
        console.error('更新检测项目信息失败', error);
        res.status(500).json({ error: '更新检测项目信息失败' });
    }
});

// 删除检测项目信息
app.delete('/api/inspection_items/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await pool.execute('DELETE FROM inspection_items WHERE item_id = ?', [id]);
        res.json({ message: '检测项目信息删除成功' });
    } catch (error) {
        console.error('删除检测项目信息失败', error);
        res.status(500).json({ error: '删除检测项目信息失败' });
    }
});


// ================== 任务相关接口 ==================
// 获取任务信息（支持设备编号过滤）
app.get('/api/tasks', async (req, res) => {
  try {
    const deviceId = req.query.deviceId;
    let sql = 'SELECT * FROM tasks';
    const params = [];
    if (deviceId) {
      sql += ' WHERE deviceId = ?';
      params.push(deviceId);
    }
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('获取任务信息失败', error);
    res.status(500).json({ error: '获取任务信息失败' });
  }
});

// 创建任务接口
app.post('/api/tasks', async (req, res) => {
  try {
    console.log(req.body);
    const { deviceId, startTime, endTime, status } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO tasks (deviceId, startTime, endTime, status) VALUES (?, ?, ?, ?)',
      [deviceId, startTime || null, endTime || null, status]
    );
    const taskId = result.insertId;
    console.log('taskId:', taskId);
    res.json({ id: taskId, deviceId, startTime, endTime, status });
  } catch (error) {
    console.error('创建任务失败', error);
    res.status(500).json({ error: '创建任务失败' });
  }
});

// 更新任务接口
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    console.log(req.body);
    const { deviceId, startTime, endTime, status } = req.body;
    
    await pool.execute(
      'UPDATE tasks SET deviceId = ?, startTime = ?, endTime = ?, status = ? WHERE id = ?',
      [deviceId, startTime || null, endTime || null, status, taskId]
    );
    res.json({ message: '任务更新成功' });
  } catch (error) {
    console.error('更新任务失败', error);
    res.status(500).json({ error: '更新任务失败' });
  }
});

// 删除任务信息
app.delete('/api/tasks/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({ message: '任务信息删除成功' });
    } catch (error) {
        console.error('删除任务信息失败', error);
        res.status(500).json({ error: '删除任务信息失败' });
    }
});

// 获取任务里的实验项目数量
app.get('/api/tasks/with-item-count', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        tasks.id, 
        tasks.deviceId, 
        tasks.startTime,
        tasks.endTime, 
        tasks.status,
        COUNT(inspection_items.item_id) as item_count
      FROM tasks
      LEFT JOIN inspection_items ON tasks.id = inspection_items.task_id
      GROUP BY tasks.id, tasks.deviceId, tasks.startTime, tasks.endTime, tasks.status
    `);
    res.json(rows);
  } catch (error) {
    console.error('获取任务及实验项目数量失败', error);
    res.status(500).json({ error: '获取任务及实验项目数量失败' });
  }
});

// 获取所有结果信息
app.get('/api/results', async (req, res) => {
  try {
    const deviceId = req.query.deviceId;
    let sql = 'SELECT * FROM results';
    const params = [];
    if (deviceId) {
      sql += ' WHERE deviceId = ?';
      params.push(deviceId);
    }
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('获取结果列表失败', error);
    res.status(500).json({ error: '获取结果列表失败' });
  }
});

// 添加结果信息
app.post('/api/results', async (req, res) => {
  const { 
    deviceId, twoP, tanValue, measuredId, 
    temperature, humidity, testDate, rate,
    fa, fb, fc, da, db, dc,
    dUa, dUb, dUc, Upta, Uptb, Uptc,
    Uyba, Uybb, Uybc, res1, res2, res3, res4 
  } = req.body;
  // 转换日期格式（如果前端未处理）
  if (testDate) {
    req.body.testDate = new Date(testDate).toISOString().split('T')[0];
  }
  // 将undefined转换为null
  const params = [
    deviceId, twoP, tanValue, measuredId, 
    temperature, humidity, testDate, rate,
    fa, fb, fc, da, db, dc,
    dUa, dUb, dUc, Upta, Uptb, Uptc,
    Uyba, Uybb, Uybc, res1, res2, res3, res4
  ].map(param => param === undefined ? null : param);

  try {
    const [result] = await pool.execute(
      `INSERT INTO results 
        (deviceId, twoP, tanValue, measuredId, 
         temperature, humidity, testDate, rate,
         fa, fb, fc, da, db, dc,
         dUa, dUb, dUc, Upta, Uptb, Uptc,
         Uyba, Uybb, Uybc, res1, res2, res3, res4) 
      VALUES 
        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      params
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('数据库插入错误详情：', error);
    res.status(500).json({ error: '添加结果失败' });
  }
});

// 更新结果信息
app.put('/api/results/:id', async (req, res) => {
  const id = req.params.id;
  const { 
    deviceId, twoP, tanValue, measuredId, 
    temperature, humidity, testDate, rate,
    fa, fb, fc, da, db, dc,
    dUa, dUb, dUc, Upta, Uptb, Uptc,
    Uyba, Uybb, Uybc, res1, res2, res3, res4 
  } = req.body;
  console.log(req.body);
  console.log('twoP 类型:', typeof twoP); // 应显示 "number"
  try {
    await pool.execute(
      `UPDATE results 
       SET 
         deviceId = ?, twoP = ?, tanValue = ?, measuredId = ?, 
         temperature = ?, humidity = ?, testDate = ?, rate = ?,
         fa = ?, fb = ?, fc = ?, da = ?, db = ?, dc = ?,
         dUa = ?, dUb = ?, dUc = ?, Upta = ?, Uptb = ?, Uptc = ?,
         Uyba = ?, Uybb = ?, Uybc = ?, res1 = ?, res2 = ?, res3 = ?, res4 = ?
       WHERE resultId = ?`,
      [deviceId, twoP, tanValue, measuredId, 
       temperature, humidity, testDate, rate,
       fa, fb, fc, da, db, dc,
       dUa, dUb, dUc, Upta, Uptb, Uptc,
       Uyba, Uybb, Uybc, res1, res2, res3, res4, id]
    );
    res.json({ id, ...req.body });
  } catch (error) {
    console.error('更新结果失败', error);
    res.status(500).json({ error: '更新结果失败' });
  }
});

// 删除结果信息
app.delete('/api/results/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.execute('DELETE FROM results WHERE resultId = ?', [id]);
    res.json({ message: '结果删除成功' });
  } catch (error) {
    console.error('删除结果失败', error);
    res.status(500).json({ error: '删除结果失败' });
  }
});

app.get('/api/results/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.execute('SELECT * FROM results WHERE resultId = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '结果不存在' });
    }
    const result = rows[0];
    // 输出字段类型，确认是否为数字
    console.log('twoP 类型:', typeof result.twoP); 
    console.log('tanValue 类型:', typeof result.tanValue); 
    res.json(result);
  } catch (error) {
    console.error('获取结果详情失败', error);
    res.status(500).json({ error: '获取结果详情失败' });
  }
});

// OCR 处理接口
app.post('/api/perform-ocr', async (req, res) => {
  console.log('perform');
  try {
    const deviceId = parseInt(req.body.deviceId); // 初始化时完成转换，不后续赋值
    console.log('2');
    // const { matchedData, imageUrl } = await callDoubaoAPI();

    // const matchedData = await callDoubaoAPI();
    let imageUrl = '';
    // console.log('imageUrl:', imageUrl);
    // console.log('matchedData', matchedData);
    // console.log(JSON.parse(matchedData));
    const testData = {
      'twoP': '78.6',
      'tanValue': '-1.2866',
      measuredId: 55894688,
      temperature: '20.3',
      humidity: '80.3',
      testDate: "2023-11-19",
      fa: '0.6775',
      fb: '0.8060',
      fc: '0.6180',
      da: '-0.601',
      db: '-0.401',
      dc: '-0.207',
      dUa: '0.6961',
      dUb: '0.3159',
      dUc: '0.0470',
      Upta: '69.555',
      Uptb: '71.317',
      Uptc: '40.714',
      Uyba: '12.283',
      Uybb: '55.243',
      Uybc: '1.792',
      rate: '0.510',
      res1: '1.792',
      res2: '1.792',
      res3: '0.510',
      res4: '0.510'
    };
    // 将数据保存到 results 表
    const { 
      twoP, tanValue, measuredId, 
      temperature, humidity, testDate, rate,
      fa, fb, fc, da, db, dc,
      dUa, dUb, dUc, Upta, Uptb, Uptc,
      Uyba, Uybb, Uybc, res1, res2, res3, res4 
    // } = JSON.parse(matchedData);
    } = testData;

    const params = [
      deviceId, twoP, tanValue, measuredId, 
      temperature, humidity, testDate, rate,
      fa, fb, fc, da, db, dc,
      dUa, dUb, dUc, Upta, Uptb, Uptc,
      Uyba, Uybb, Uybc, res1, res2, res3, res4,
      imageUrl
    ].map(param => param === undefined ? null : param);

    console.log('插入参数数量:', params.length, '参数:', params);
    const [result] = await pool.execute(
      `INSERT INTO results 
        (deviceId, twoP, tanValue, measuredId, 
         temperature, humidity, testDate, rate,
         fa, fb, fc, da, db, dc,
         dUa, dUb, dUc, Upta, Uptb, Uptc,
         Uyba, Uybb, Uybc, res1, res2, res3, res4, imageUrl) 
      VALUES 
        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      params
    );
    
    // res.status(201).json({ id: result.insertId, ...matchedData, imageUrl });
    res.status(201).json({ id: result.insertId, ...testData, imageUrl });
  } catch (error) {
    console.error('OCR 处理及数据保存失败:', error);
    res.status(500).json({ error: 'OCR 处理及数据保存失败' });
  }
});

// 获取设备报表信息（包含关联数据）
app.get('/api/reports/:deviceId', async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    
    // 1. 获取设备信息
    const [deviceRows] = await pool.execute(
      'SELECT * FROM devices WHERE deviceId = ?',
      [deviceId]
    );
    if (deviceRows.length === 0) {
      return res.status(404).json({ error: '设备不存在' });
    }
    const deviceInfo = deviceRows[0];

    // 2. 获取任务信息（假设每个设备对应一个任务）
    const [taskRows] = await pool.execute(
      'SELECT * FROM tasks WHERE deviceId = ?',
      [deviceId]
    );
    const taskInfo = taskRows[0];

    // 3. 获取实验项目信息
    const [itemRows] = await pool.execute(
      'SELECT * FROM inspection_items WHERE task_id = ?',
      [taskInfo.id]
    );
    const itemList = itemRows;

    // 4. 获取每个实验项目的结果信息，根据设备编号查询
    const [resultRows] = await pool.execute(
      'SELECT * FROM results WHERE deviceId = ?',
      [deviceId]
    );
    const resultList = resultRows;

    // 组合数据
    const reportData = {
      deviceInfo,
      taskInfo,
      itemList,
      resultList
    };

    res.json(reportData);
  } catch (error) {
    console.error('获取报表数据失败:', error);
    res.status(500).json({ error: '获取报表数据失败' });
  }
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在端口 ${port}`);
});