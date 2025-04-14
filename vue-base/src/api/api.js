// api.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useLoginStore } from '@/store/index';

const api = axios.create({
  baseURL: 'http://127.0.0.1:3000', // 后端服务器地址
  timeout: 5000,
  // withCredentials: true // 允许携带跨域请求的 Cookie
});

let isRefreshing = false;
let refreshSubscribers = [];

// const refreshAccessToken = async (rememberMe) => {
//   try {
//     console.log('开始请求更换accessToken');
//     // 不需要手动设置 refreshToken 到请求头，浏览器会自动携带 Cookie
//     const config = {
//       withCredentials: true // 允许携带跨域请求的 Cookie
//     };
//     const res = await axios.post('http://127.0.0.1:3000/api/refresh_token', {} , config);
//     console.log('刷新请求已发送');
//     const newAccessToken = res.data.data.accessToken;
//     console.log('更换accessToken');
//     if (rememberMe) {
//       localStorage.setItem('accessToken', newAccessToken);
//       console.log('已更新本地存储的accessToken');
//     } else {
//       sessionStorage.setItem('accessToken', newAccessToken);
//       console.log('已更新会话的accessToken');
//     }
//     return newAccessToken;
//   } catch (error) {
//     return null;
//   }
// };

// // 请求拦截器
// api.interceptors.request.use(async (config) => {
//   console.log('请求头信息:', config.headers);
//   console.log('拦截器进入了');
//   const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
//   const rememberMe = localStorage.getItem('rememberMe') === 'true';
//   const loginStore = useLoginStore();
//   console.log('rememberMe: ', rememberMe);
//   console.log('accessToken: ', accessToken);

//   if (accessToken) {
//     const decoded = jwtDecode(accessToken);
//     console.log('token 到期时间:', decoded.exp * 1000, '当前时间:', Date.now());
//     const now = Date.now() / 1000;
//     console.log(isRefreshing);
//     if (decoded.exp < now && !isRefreshing) {
//       console.log('accessToken 已过期，尝试刷新');
//       isRefreshing = true;
//       const newAccessToken = await refreshAccessToken(rememberMe);
//       if (newAccessToken) {
//         config.headers.Authorization = `Bearer ${newAccessToken}`;
//         // 执行队列里的请求
//         refreshSubscribers.forEach((callback) => callback(newAccessToken));
//         refreshSubscribers = [];
//         isRefreshing = false;
//         return config;
//       } else {
//         isRefreshing = false;
//         loginStore.logout();
//         console.error('Token 刷新失败，准备跳转登录页面');
//         // window.location.href = '/login';
//         return Promise.reject(new Error('刷新 Token 失败'));
//       }
//     } else if (decoded.exp < now && isRefreshing) {
//       // 如果正在刷新token，就将请求放入队列
//       return new Promise((resolve) => {
//         refreshSubscribers.push((newAccessToken) => {
//           config.headers.Authorization = `Bearer ${newAccessToken}`;
//           resolve(config);
//         });
//       });
//     }
//     config.headers.Authorization = `Bearer ${accessToken}`;
//   }
//   return config;
// });

// // 响应拦截器
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     const rememberMe = localStorage.getItem('rememberMe') === 'true';
//     const loginStore = useLoginStore();

//     if (error.response && error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       const newAccessToken = await refreshAccessToken(rememberMe);
//       if (newAccessToken) {
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return api(originalRequest);
//       } else {
//         if (rememberMe) {
//           localStorage.removeItem('accessToken');
//           localStorage.removeItem('user');
//         } else {
//           sessionStorage.removeItem('accessToken');
//           localStorage.removeItem('user');
//         }
//         loginStore.logout();
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

const refreshAccessToken = async (refreshToken, rememberMe) => {
  try {
    console.log('开始请求更换accessToken');
    const config = {
      headers: { 
        'Authorization': `Bearer ${refreshToken}`
      }
    };
    const res = await axios.post('http://127.0.0.1:3000/api/refresh_token', {}, config);
    console.log('刷新请求已发送');
    const newAccessToken = res.data.data.accessToken;
    console.log('更换accessToken');
    if (rememberMe) {
      localStorage.setItem('accessToken', newAccessToken);
      console.log('已更新本地存储的accessToken');
    } else {
      sessionStorage.setItem('accessToken', newAccessToken);
      console.log('已更新会话的accessToken');
    }
    return newAccessToken;
  } catch (error) {
    return null;
  }
};

// 请求拦截器
api.interceptors.request.use(async (config) => {
  console.log('拦截器进入了');
  // console.log('请求拦截器 - 配置:', config);
  const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
  const rememberMe = localStorage.getItem('rememberMe') === 'true';
  const loginStore = useLoginStore();
  const userInfo = loginStore.getUserinfo;
  console.log('rememberMe: ', rememberMe);
  console.log('accessToken: ', accessToken);
  console.log('refreshToken: ', refreshToken);
  if (accessToken) {
    const decoded = jwtDecode(accessToken);
    console.log('token 到期时间:', decoded.exp * 1000, '当前时间:', Date.now());
    const now = Date.now() / 1000;
    console.log(isRefreshing);
    if (decoded.exp < now && !isRefreshing) {
      console.log('accessToken 已过期，尝试刷新');
      isRefreshing = true;
      const newAccessToken = await refreshAccessToken(refreshToken, rememberMe);
      if (newAccessToken) {
        localStorage.setItem('user', userInfo);
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        // 执行队列里的请求
        refreshSubscribers.forEach((callback) => callback(newAccessToken));
        refreshSubscribers = [];
        isRefreshing = false;
        return config;
      } else {
        isRefreshing = false;
        console.error('Token 刷新失败，准备跳转登录页面');
        loginStore.logout();
        // window.location.href = '/login';
        return Promise.reject(new Error('刷新 Token 失败'));
      }
    } else if (decoded.exp < now && isRefreshing) {
      // 如果正在刷新token，就将请求放入队列
      return new Promise((resolve) => {
        refreshSubscribers.push((newAccessToken) => {
          config.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(config);
        });
      });
    }
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const loginStore = useLoginStore();

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      const newAccessToken = await refreshAccessToken(refreshToken, rememberMe);
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } else {
        if (rememberMe) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        } else {
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        loginStore.logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// // 请求拦截器，携带token
// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('token') || sessionStorage.getItem('token')
//   if (token) {
//     config.headers.Authorization = 'Bearer ' + token
//   }
//   return config
// }, error => {
//   return Promise.reject(error)
// })

// // 响应拦截器：处理 token 过期逻辑
// api.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config
//     const rememberMe = localStorage.getItem('rememberMe') === 'true'

//     if (error.response && error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true

//       if (rememberMe) {
//         // 自动登出（token 过期，不刷新）
//         localStorage.removeItem('token')
//         sessionStorage.removeItem('token')
//         localStorage.removeItem('user') // 清除其他登录状态
//         router.push('/login')
//       } else {
//         // 自动无感刷新
//         try {
//           const refreshRes = await api.post('/api/refresh_token')
//           const newToken = refreshRes.data.data.token
//           console.log('newToken: ', newToken)
//           sessionStorage.setItem('token', newToken)
//           // 更新原请求的 token 并重试
//           originalRequest.headers.Authorization = `Bearer ${newToken}`
//           return api(originalRequest)
//         } catch (refreshErr) {
//           sessionStorage.removeItem('token')
//           localStorage.removeItem('user')
//           router.push('/login')
//         }
//       }
//     }

//     return Promise.reject(error)
//   }
// )
export default api;