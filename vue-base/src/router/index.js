import { createRouter, createWebHistory } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { useLoginStore } from '@/store/index';
import api from '@/api/api'
import { jwtDecode } from 'jwt-decode';// 引入 jwt-decode 库来解析 JWT 令牌
// 从 @/views/XXX 路径导入XXX组件。@指向src目录
import Login from '@/views/Login/Login.vue';
import Home from '@/views/Home/Index.vue';
// import origin from '@/views/Home/origin.vue';
// import DeviceList from '@/views/Device/DeviceList.vue';
// import TaskList from '@/views/Task/TaskList.vue';
// import ItemList from '@/views/Task/Items/ItemList.vue';
// import ResultList from '@/views/Result/ResultList.vue';
import ReportList from '@/views/Report/ReportList.vue';
// import Statistic from '@/views/Statistic/Statistic.vue';

// 存储路由配置信息
const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/forget-password',
        component: () => import('@/views/Login/ForgetPassword.vue')
    },
    {
        path: '/register',
        component: () => import('@/views/Login/Register.vue')
    },
    {
        path: '/home',
        component: Home,
        meta: { requiresAuth: true },
        children:[
            {
                path: '',
                // component: origin
                component: () => import('@/views/Home/origin.vue')
            },
            {
                path: 'device-info',
                // component: DeviceList
                component: () => import('@/views/Device/DeviceList.vue')
            },
            {
                path: 'task-info',
                // component: TaskList
                component: () => import('@/views/Task/TaskList.vue')
            },
            {
                path: 'item-info/:taskId',
                name: 'item-info',
                // component: ItemList
                component: () => import('@/views/Task/Items/ItemList.vue')
            },
            {
                path: 'result-info',
                // component: ResultList
                component: () => import('@/views/Result/ResultList.vue')
            },
            {
                path: 'report-info',
                component: ReportList
                // component: () => import('@/views/Report/ReportList.vue')
            },
            {
                path: 'statistic-info',
                // component: Statistic
                component: () => import('@/views/Statistic/Statistic.vue')
            }
            ]
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// // 添加路由守卫，限制未登录的用户访问系统
// router.beforeEach((to, from, next) => {
//     const token = localStorage.getItem('token') || sessionStorage.getItem('token')
//     const loginStore = useLoginStore();

//     // 即使token存在，但当退出登录时，也不能够再直接访问系统主页面了
//     if (to.meta.requiresAuth && (!token || !loginStore.isLoggedIn)) {
//         // 没有登录，弹窗提示并跳转登录页
//         ElMessageBox.alert('您没有权限访问该页面，请先登录！', '权限提示', {
//             confirmButtonText: '确定',
//             callback: () => {
//             next({ path: '/login' });  // 跳转到登录页
//             }
//         });
//     } else {
//     // 已登录或正在访问登录页
//     next()
//   }
// })


// 检查令牌是否过期
function isTokenExpired(token) {
    if(!token) return true;
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
}

function showLoginAlert(loginStore) {
    ElMessageBox.alert('您没有权限访问该页面，请先登录！', '权限提示', {
        confirmButtonText: '确定',
        callback: () => {
            loginStore.logout();
            window.location.href = '/login';
        }
    });
}
// 添加路由守卫，限制未登录的用户访问系统
router.beforeEach(async (to, from, next) => {
    try{
        const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
        const rememberMe = localStorage.getItem('rememberMe') === 'true'
        const loginStore = useLoginStore()
        const userInfo = loginStore.getUserInfo;
        // 如果需要登录的页面
        if (to.meta.requiresAuth) {
            console.log(rememberMe);
            console.log('loginStore.isLoggedIn:',loginStore.isLoggedIn);
            if (!isTokenExpired(accessToken) && loginStore.isLoggedIn) {
            // if (accessToken && loginStore.isLoggedIn) {
                // 有 accessToken没过期 且已登录，直接放行
                next()
            // } else if (accessToken && !rememberMe && refreshToken) {
            } else if (isTokenExpired(accessToken) && !isTokenExpired(refreshToken)) {
                // 不管勾选“七天免登录”与否，refreshToken存在且未过期，尝试刷新 accessToken（无感刷新）
                try {
                    const res = await api.post('/api/refresh_token', {}, {
                        headers: { Authorization: `Bearer ${refreshToken}` }
                    })  // 使用 refreshToken 作为 Authorization
                    console.log('res.token: ', res.data)
                    const newAccessToken = res.data.data.accessToken
                    if(rememberMe) {localStorage.setItem('accessToken', newAccessToken)}
                    else {sessionStorage.setItem('accessToken', newAccessToken)}
                    loginStore.setLogin(true) // 标记为已登录
                    loginStore.setUserInfo(userInfo) // 标记为已登录
                    next()
                } catch (err) {
                    console.error('刷新 token 失败', err)
                    // 刷新失败，跳转登录页
                    showLoginAlert(loginStore)
                    return
                }
            } else {
                // 其他情况都视为未登录
                // 比如：未勾选“七天免登录”，开启新会话时无accessToken也无refreshToken
                showLoginAlert(loginStore)
                next(false)
                return
            }
        } else {
            // 不需要登录的页面，直接放行
            next()
        }
    } catch (err) {
        console.error('路由守卫发生错误：', err);
        next('/login');  // 出现错误时直接跳转到登录页
    }
});

export default router;
