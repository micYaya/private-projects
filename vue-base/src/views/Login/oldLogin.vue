<template>
  <div class="login-container">
    <div class="login-box">
      <!-- <SwitchDark class="switch-dark" /> -->

      <div class="wrapper">
        <el-alert v-if="isAlertVisible" :title="alertMessage" type="warning" show-icon @close="isAlertVisible = false"/>
        <h1>互感器二次压降检测仪检定系统</h1>
        
        <el-tabs v-model="currentLoginType" type="card" style="position: relative; width:100%;">
          <el-tab-pane label="密码登录" name="password">
            <el-form @submit.prevent="handlePasswordLogin">
              <el-form-item label="用户名:" >
                <el-input v-model="username" placeholder="请输入用户名"/>
              </el-form-item>
              <el-form-item label="密码:">
                <el-input v-model="password" type="password" show-password placeholder="请输入密码"/>
              </el-form-item>
              <el-checkbox v-model="checked1" label="七天免登录" size="large" />
              <br>
              <a href="/register" style="text-decoration: none; color: #19e;">注册账号</a>
              <a href="/forget-password" style="text-decoration: none; color: #19e; position:absolute; right: 0;">忘记密码</a>
              <br><br>
              <el-button type="primary" @click="handlePasswordLogin" class="loginBtn">登录</el-button>
            </el-form>
          </el-tab-pane>
    
          <el-tab-pane label="短信登录" name="verifyCode">
            <el-form @submit.prevent="handleVerifyCodeLogin">
              <el-form-item label="手机号:">
                <el-input v-model="phone" placeholder="请输入手机号"/>
              </el-form-item>
              <el-form-item label="验证码:">
                <el-input v-model="verifyCode" placeholder="请输入验证码" style="flex:1;"/>
                <el-button :disabled="!isPhoneValid" @click="getCode" type="primary" style="width: 30%;">
                  {{ computeTime < 60 ? `${computeTime}秒后重试` : '获取验证码' }}
                </el-button>
              </el-form-item>
              <p><b>如获取不到验证码</b><br>
                1.请检查短信是否被安全软件拦截。<br>
                2.网络原因，短信可能延迟到达。</p>
              <el-button type="primary" @click="handleVerifyCodeLogin" class="loginBtn">登录</el-button>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        <el-alert v-if="errorMessage" :title="errorMessage" type="error" show-icon/>
      </div>

    </div>
  </div>

</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginStore } from '@/store/index'
import { reqSendCode, reqSmsLogin, checkUser } from '@/api/reqSendCode.js'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loginStore = useLoginStore()

const currentLoginType = ref('password')
const username = ref('')
const password = ref('')
const phone = ref('')
const verifyCode = ref('')
const errorMessage = ref('')
const computeTime = ref(60)
let intervalId;

// 验证手机号有效性
const isPhoneValid = computed(() => /^1\d{10}$/.test(phone.value))

// 提示框
const isAlertVisible = ref(false)
const alertMessage = ref('')
const showAlert = (msg) => {
  // alertMessage.value = msg
  // isAlertVisible.value = true
  // // 自动关闭（3秒后）
  // setTimeout(() => {
  //   isAlertVisible.value = false
  // }, 3000)
  ElMessage.warning(msg)
}

// 异步获取短信验证码
const getCode = async () => {
  console.log('开始计时')
  // 如果当前没有计时
  if(computeTime.value === 60) {
    // 启动倒计时
    console.log("启动倒计时")
    computeTime.value = 60
    intervalId = setInterval(() => {
      computeTime.value--
      console.log('time: ', computeTime.value)
      if(computeTime.value <= 0) {
        // 停止计时
        clearInterval(intervalId)
        computeTime.value = 60
        intervalId = null
      }
    }, 1000)

    console.log("开始问后端要验证码")
    // 发送ajax请求(向指定手机号发送验证码短信)
    const result = await reqSendCode(phone.value)
    console.log(result)
    if(result.code === 1) {
      // 显示提示
      showAlert(result.msg)
      // 停止计时
      if(computeTime.value) {
        computeTime.value = 60
        clearInterval(intervalId)
        intervalId = null
      }
    }
  }
}

// // 密码登录处理
// const handlePasswordLogin = async () => {
//   if (!username.value || !password.value) {
//     // errorMessage.value = '用户名和密码不能为空'
//     showAlert('用户名和密码不能为空')
//     return
//   }
//   // 模拟校验，实际应用中可调用后端接口
//   const validUsername = 'admin'
//   const validPassword = '123456'
//   if (username.value === validUsername && password.value === validPassword) {
//     const userinfo = { user: username.value }
//     loginStore.setUserInfo(userinfo)
//     localStorage.setItem('user', JSON.stringify(userinfo))
//     router.push('/home')
//   } else if(username.value != validUsername) {
//       showAlert('不存在该用户名')
//   } else if(username.value === validUsername && password.value != validPassword){
//     showAlert('密码错误')
//   }
// }

// 密码登录处理
const handlePasswordLogin = async () => {
  if (!username.value || !password.value) {
    showAlert('用户名和密码不能为空')
    return
  }
  console.log(username.value, password.value)
  // 校验系统是否存在该用户名和密码
  const result = await checkUser(username.value, password.value)
  if (result.code === 0) {
    const userinfo = { user: username.value }
    loginStore.setUserInfo(userinfo)
    localStorage.setItem('user', JSON.stringify(userinfo))
    router.push('/home')
  } else {
    showAlert(result.msg)
  }
}

// 验证码登录处理
const handleVerifyCodeLogin = async () => {
  if (!isPhoneValid.value) {
    // 手机号不正确
    showAlert('手机号不正确')
    return
  } else if (!/^\d{4}$/.test(verifyCode.value)) {
    // 验证必须是4位数字
    showAlert('验证码必须是4位数字')
    return
  }
  // 发送ajax请求短信登陆
  const result = await reqSmsLogin(phone.value, verifyCode.value)
  console.log(result)
  // 停止计时
  if (computeTime.value) {
    computeTime.value = 60
    clearInterval(intervalId)
    intervalId = null
  }

  // 根据结果数据处理
  if (result.code === 0) {
    const user = result.data
    console.log('user: ',user)
    console.log('user.nickname: ', user.nickname)
    // 修改为存储包含 user 属性的对象
    const userinfo = { user: user.nickname }
    loginStore.setUserInfo(userinfo)
    loginStore.setPhoneNumber(phone.value) // 将电话号码保存到 Pinia 的 state 中
    localStorage.setItem('user', JSON.stringify(userinfo))
    // loginStore.setUserInfo(user.nickname)
    // loginStore.setPhoneNumber(phone.value) // 将电话号码保存到 Pinia 的 state 中
    // localStorage.setItem('user', JSON.stringify(user.nickname))
    router.push('/home') // 跳转到个人中心界面
  } else {
    // 显示警告提示
    const msg = result.msg
    showAlert(msg)
  }
}
</script>

<style lang="less" scoped>
.login-container {
  width: 100%;
  height: 100%;
  background: #eeeeee;
  background-image: url('@/assets/images/login_bg.svg');
  background-size: 100% 100%;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-box {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 96%;
    height: 94%;
    padding: 0 50px;
    background-color: rgb(255 255 255 / 75%);
    border-radius: 10px;

    .wrapper {
      width: 100%;
      max-width: 480px;
      margin: 200px auto;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 5px;
      box-shadow: 0 2px 10px 2px rgba(0, 0, 0, 0.1);
      display: grid;
      justify-content: center;

      .loginBtn {
        width: 100%;
      }
    }
    /* 覆盖element-plus的样式 */
    :deep(.el-tabs__nav) {
      width: 100%;
    }
    :deep(.el-tabs__item) {
      width: 50%;
    }
    
  }
}

@media screen and (width <= 600px) {
  .wrapper {
    width: 97% !important;
  }
}
</style>
  