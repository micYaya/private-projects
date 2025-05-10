const express = require('express');
const router = express.Router();
const sms_util = require('../utils/sms_util');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
// const cookie = require('cookie');

// 内存存储验证码（临时数据，无需持久化）
const users = {}

const fs = require('fs/promises')
const path = require('path')

// 配置
const USER_FILE = path.join(__dirname, '../db/users.json'); // 用户数据文件
const DEFAULT_USERS = []; // 初始数据
// 工具函数
const readUsers = async () => {
  try {
    const data = await fs.readFile(USER_FILE, 'utf8');
    return JSON.parse(data) || DEFAULT_USERS;
  } catch (error) {
    console.error('读取用户文件失败，使用默认数据:', error.message);
    return DEFAULT_USERS;
  }
};

const writeUsers = async (users) => {
  const data = JSON.stringify(users, null, 2);
  await fs.writeFile(USER_FILE, data, 'utf8');
};

/*
发送验证码短信
*/
router.get('/api/sendcode', async (req, res) => {
  //1. 获取请求参数数据
  var phone = req.query.phone;
  var type =req.query.type;
  // 先检查系统中是否注册过这个手机号
  // 读取用户文件，查找用户
  let usersInfo = await readUsers();
  const userIndex = usersInfo.findIndex(u => u.phone === phone);
  if(userIndex === -1 && type === 'normal') {
    res.send({'code': 1, msg: '系统未注册过该手机号码，请检查'})
    return
  }
  if(userIndex != -1 && type === 'r') {
    res.send({'code': 1, msg: '系统已存在该手机号码，不可重复注册'})
    return
  }
  //2. 处理数据
  //生成验证码(4位随机数)
  var code = sms_util.randomCode(4);
  //发送给指定的手机号
  console.log(`向${phone}发送验证码短信: ${code}`);
  sms_util.sendCode(phone, code, function (success) {//success表示是否成功
    if (success) {
      users[phone] = code
      // console.log(users[phone])
      // console.log('保存验证码: ', phone, code)
      res.send({"code": 0})
    } else {
      //3. 返回响应数据
      res.send({"code": 1, msg: '短信验证码发送失败'})
    }
  })
})

/*
短信登陆
*/
router.post('/api/login_sms', async (req, res) => {
  var phone = req.body.phone;
  var code = req.body.code;
  // console.log('/login_sms', phone, code);
  if (users[phone] != code) {
    res.send({code: 1, msg: '验证码不正确'});
    return;
  }
  //删除保存的code
  delete users[phone];

  // 读取用户文件
  let usersInfo = await readUsers();
  
  // 查找用户
  const userIndex = usersInfo.findIndex(u => u.phone === phone);
  let targetUser;  // 目标用户
  if (userIndex !== -1) {
    // 已有用户，更新登录时间
    usersInfo[userIndex].lastLogin = Date.now();
    targetUser = usersInfo[userIndex];

    // 短期accessToken，长期refresToken
    const accessToken = jwt.sign(
      { id: targetUser.id, nickname: targetUser.nickname },
      config.config.jwtSecretKey,
      { expiresIn: '1h' } // accessToken 有效期短
    );
    const refreshToken = jwt.sign(
      { id: targetUser.id },
      config.config.jwtSecretKey,
      { expiresIn: '1d' } // refreshToken 更长
    );
    // 设置 session
    req.session.user = {
      id: targetUser.id,
      phone: targetUser.phone,
      password: targetUser.password,
      creatTime: targetUser.creatTime,
      lastLogin: targetUser.lastLogin,
      nickname: targetUser.nickname,
      role: targetUser.role,
      accessToken,
      refreshToken
    };

    // 写入文件
    try {
      await writeUsers(usersInfo);

      // console.log('短信登录：开始发送accessToken和refreshToken');
      res.send({ code: 0, data: req.session.user });
      // console.log('短信登录：refreshToken发送成功');
      // console.log(accessToken);
      // console.log(refreshToken);
    } catch (error) {
      console.error('保存用户文件失败:', error.message);
      res.status(500).send({ code: 1, msg: '服务器内部错误' });
    }
  } else {
    res.send({ code: 1, msg: '系统未注册过该手机号码，请检查' });
  }
})

/*
重置密码
*/
router.post('/api/reset_password', async (req, res) => {
  var phone = req.body.phone;
  var code = req.body.code;
  var password = req.body.password
  // console.log('/reset_password', phone, code, password);
  if (users[phone] != code) {
    res.send({code: 1, msg: '验证码不正确'});
    return;
  }
  //删除保存的code
  delete users[phone];

  // 读取用户文件
  let usersInfo = await readUsers();
  // 更新用户的密码
  const userIndex = usersInfo.findIndex(u => u.phone === phone);
  if (userIndex !== -1) {
    // 已有用户，更新密码
    let targetUser = usersInfo[userIndex];
    const hashedPassword = bcrypt.hashSync(password, 10);
    targetUser.password = hashedPassword;
    // 设置 session
    req.session.user = {
      id: targetUser.id,
      phone: targetUser.phone,
      password: targetUser.password,
      creatTime: targetUser.creatTime,
      lastLogin: targetUser.lastLogin,
      nickname: targetUser.nickname,
      role: targetUser.role,
    };
    try {
      await writeUsers(usersInfo);
      res.send({ code: 0, data: req.session.user });
    } catch (error) {
      console.error('保存用户文件失败:', error.message);
      res.status(500).send({ code: 1, msg: '服务器内部错误' });
    }
  } else {
    res.send({ code: 1, msg: '系统未注册该手机号码' });
  }
})
/*
注册新用户信息
*/
router.post('/api/register', async (req, res) => {
  var phone = req.body.phone;
  var code = req.body.code;
  var password = req.body.password
  // console.log('/register', phone, code, password);
  if (users[phone] != code) {
    res.send({code: 1, msg: '验证码不正确'});
    return;
  }
  //删除保存的code
  delete users[phone];

  // 读取用户文件
  let usersInfo = await readUsers();
  // 新用户，添加基础信息
  // 先加密密码
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: Date.now().toString(), // 生成唯一ID（时间戳）
    phone,
    password: hashedPassword,
    createTime: Date.now(),
    lastLogin: Date.now(),
    nickname: `admin${phone.slice(-4)}`,
    role: 'user',
  };
  usersInfo.push(newUser);
  // 设置 session
  req.session.user = {
    phone: newUser.phone,
    creatTime: newUser.createTime,
    nickname: newUser.nickname,
    role: newUser.role,
  };
  try {
    await writeUsers(usersInfo);
    res.send({ code: 0, data: req.session.user });
  } catch (error) {
    console.error('保存用户文件失败:', error.message);
    res.status(500).send({ code: 1, msg: '服务器内部错误' });
  }
})

/*
密码登录：先检查系统用户是否存在，再检验密码
*/
router.get('/api/check_user', async (req, res) => {
  var username = req.query.username;
  var password = req.query.password;
  const rememberMe = req.query.remember === 'true';  // 七天免登录
  // console.log('/check_user', username, password);
  // 读取用户文件
  let usersInfo = await readUsers();
  const userIndex = usersInfo.findIndex(u => u.nickname === username);
  if (userIndex !== -1) {
    // 已有用户
    let targetUser = usersInfo[userIndex];
    // 分散出来的一个逻辑，没给密码参数就是简单的检测用户在否
    if (password === '') {
      return res.send({ code: 0 });
    }
    // 验证密码
    const compareResult = bcrypt.compareSync(password, targetUser.password);

    if (compareResult) {
      // 短期accessToken，长期refresToken
      const accessToken = jwt.sign(
        { id: targetUser.id, nickname: targetUser.nickname },
        config.config.jwtSecretKey,
        { expiresIn: '1h' } // accessToken 有效期短
      );
      
      const refreshToken = jwt.sign(
        { id: targetUser.id },
        config.config.jwtSecretKey,
        { expiresIn: rememberMe ? '7d' : '1d' } // refreshToken 更长
      );

      // console.log('开始发送refreshToken');
      // 可将 refreshToken 存在 httpOnly cookie 里，也可以存在 localStorage（不太安全）
      // // 设置 HttpOnly Cookie
      // res.setHeader('Set-Cookie', cookie.serialize('refreshToken', refreshToken, {
      //   httpOnly: true, // 设置为 HttpOnly，防止前端 JavaScript 访问
      //   secure: false, // 如果是生产环境，建议改为 true，仅在 HTTPS 下有效
      //   maxAge: rememberMe? 7 * 24 * 60 * 60 : 24 * 60 * 60, // 根据 rememberMe 设置有效期
      //   path: '/' // Cookie 生效路径
      // }));
      // 打印设置的 cookie
      // console.log('设置的 cookie:', res.getHeader('Set-Cookie'));

      res.send({
        code: 0,
        data: {
          phone: targetUser.phone,
          nickname: targetUser.nickname,
          lastLogin: targetUser.lastLogin,
          role: targetUser.role,
          accessToken,
          refreshToken
          // rememberMe
        }
      });
      // console.log('refreshToken发送成功');
      // console.log(accessToken);
      // console.log(refreshToken);
      
    } 
    else {
      res.send({code: 1, msg: '密码错误'});
    }
  } else {
    res.send({ code: 1, msg: '系统未注册过该账户' });
  }
})

// 刷新token（根据旧 token 的 id 再签一个新的）
router.post('/api/refresh_token', (req, res) => {
  // console.log('更换accessToken接口开始');
  // console.log('请求头信息:', req.headers);
  // console.log('原始的 Cookie 字符串:', req.headers.cookie);
  // const cookies = cookie.parse(req.headers.cookie || '');
  // console.log(cookies);
  // const refreshToken = cookies.refreshToken;
  // if (!refreshToken) return res.status(401).send({ code: 1, msg: '缺少 refreshToken' });

  const refreshToken = req.headers.authorization?.split(' ')[1]; // 格式: Bearer xxx
  if (!refreshToken) return res.status(401).send({ code: 1, msg: '缺少 refreshToken' });

  try {
    const decoded = jwt.verify(refreshToken, config.config.jwtSecretKey);
    // console.log('重新签发一个新 accessToken');

    // 重新签发一个新 accessToken
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      config.config.jwtSecretKey,
      { expiresIn: '10s' }
    );

    res.send({ code: 0, data: { accessToken: newAccessToken } });
    // console.log('发送新的accessToken')
  } catch (err) {
    res.status(401).send({ code: 1, msg: 'refreshToken 无效，无法刷新' });
  }
});

module.exports = router; // 导出router实例