import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
// 主题会在多个组件中使用
// 创建Store实例
export default new Vuex.Store({
  // 状态对象 
  state: {
    theme: 'chalk'
  },
  // 唯一修改state的方法，必须是同步操作，通过commit触发
  // 同步操作：组件--commit-->mutation---->修改state----->组件更新
  mutations: {
    changeTheme(state){
      if(state.theme === 'chalk'){
        state.theme = 'vintage'
      } else{
        state.theme = 'chalk'
      }
      console.log('Theme changed to:', state.theme);
    }
  },
  // 异步操作，通过dispatch触发，触发后异步操作调用commit，再通过mutation修改state
  // 组件--dispatch-->action--API调用-->异步操作--commit-->mutation-->修改state-->组件更新
  actions: {
  },
  // 子模块
  modules: {
  }
})
