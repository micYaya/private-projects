import ajax from './ajax';
// 发送短信验证码
const reqSendCode = (phone, type = 'normal') =>
  ajax('/api/sendcode', { phone, type });
// 登录请求
const reqSmsLogin = (phone, code) =>
  ajax('/api/login_sms', { phone, code }, 'POST');
// 密码重置请求
const resetPassword = (phone, code, password) =>
  ajax('api/reset_password', { phone, code, password }, 'POST');
// 新用户注册请求
const register = (phone, code, password) =>
  ajax('api/register', { phone, code, password }, 'POST');
// 检查系统用户是否存在
const checkUser = (username, password = '') =>
  ajax('/api/check_user', { username, password });
export { reqSendCode, reqSmsLogin, resetPassword, register, checkUser };
