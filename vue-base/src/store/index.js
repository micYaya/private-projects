// stores/index.js
import { defineStore } from 'pinia';

export const useLoginStore = defineStore('login', {
  state: () => ({
    userInfo: null,  // 用户名
    phoneNumber: null // 电话号码
  }),
  actions: {
    setUserInfo(userinfo) {
      this.userInfo = userinfo;
    },
    setPhoneNumber(phone) {
      this.phoneNumber = phone; // 设置电话号码
    },
    logout() {
      this.userInfo = null;
      localStorage.removeItem('user');
      this.phoneNumber = null;
      // localStorage.removeItem('token'); // 清除本地 token
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('rememberMe')
      // sessionStorage.removeItem('token'); // 如果用了 session 也一起清除
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
    },
    // 页面刷新时在本地存储中找用户信息
    initUserInfo() {
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        this.userInfo = JSON.parse(userInfo);
      }
    },
    setLogin(userinfo = null) {
      if (userinfo) {
        this.userInfo = userinfo;
        localStorage.setItem('user', JSON.stringify(userinfo));
      }
    }    
  },
  getters: {
    getUserInfo: (state) => state.userInfo,
    isLoggedIn: (state) => !!state.userInfo,
    getPhoneNumber: (state) => state.phoneNumber
  }
});