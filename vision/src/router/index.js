import Vue from 'vue'
import VueRouter from 'vue-router'
// 从 @/views/SellerPage 路径导入 SellerPage 组件。@ 指向 src 目录
// import SellerPage from '@/views/SellerPage'
// import TrendPage from '@/views/TrendPage'
// import MapPage from '@/views/MapPage'
// import RankPage from '@/views/RankPage'
// import HotPage from '@/views/HotPage'
// import StockPage from '@/views/StockPage'
import ScreenPage from '@/views/ScreenPage'

// 将 Vue Router 的功能集成到 Vue 实例中，使得后续可以在 Vue 应用中使用路由功能。
Vue.use(VueRouter)

// 存储路由配置信息
const routes = [
  {
    path: '/',
    redirect: '/screen'
  },
  {
    path: '/screen',
    component: ScreenPage
  },
  // {
  //   path: '/sellerpage',
  //   component: SellerPage
  // },
  // {
  //   path: '/trendpage',
  //   component: TrendPage
  // }
  // {
  //   path: '/mappage',
  //   component: MapPage
  // },
  // {
  //   path: '/rankpage',
  //   component: RankPage
  // },
  // {
  //   path: '/hotpage',
  //   component: HotPage
  // },
  // {
  //   path: '/stockpage',
  //   component: StockPage
  // }
]

const router = new VueRouter({
  routes
})

export default router
