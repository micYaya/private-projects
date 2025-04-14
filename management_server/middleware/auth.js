// auth.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const secretKey = config.config.jwtSecretKey;  // 也可以从环境变量中读取

module.exports = function (req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ code: 401, msg: '未登录' });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ code: 401, msg: '登录已失效，请重新登录' });
  }
}