<template>
    <div class="screen-container" :style="containerStyle" ref="screen_ref">
        <header class="screen-header">
            <div>
                <img src="/static/img/header_border_dark.png" alt="" class="head-img">
            </div>
            <span class="title">电商平台实时监控系统</span>
            <div class="title-right">
                <img src="/static/img/theme_dark.png" class="theme-change" @click="changeTheme">
                <span class="datetime">{{ currentTime }}</span>
            </div>
        </header>
        <div class="screen-body">
            <section class="screen-left">
                <div id="left-top" :class="[fullScreenStatus.trend ? 'fullscreen' : '']">
                    <!-- 销量趋势图表 -->
                    <Trend ref="trend"></Trend>
                    <!-- 点击全屏展示，放缩图标 -->
                    <div class="resize">
                        <span :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('trend')"></span>
                    </div>
                </div>
                <!-- 动态绑定类名 -->
                <div id="left-bottom" :class="[fullScreenStatus.seller ? 'fullscreen' : '']">
                    <!-- 商家销售金额图表 -->
                    <Seller ref="seller"></Seller>
                    <div class="resize">
                        <span :class="['iconfont', fullScreenStatus.seller ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('seller')"></span>
                    </div>
                </div>
            </section>
            <section class="screen-middle">
                <div id="middle-top" :class="[fullScreenStatus.map ? 'fullscreen' : '']">
                    <!-- 商家分布图表 -->
                    <Map ref="map"></Map>
                    <div class="resize">
                        <span :class="['iconfont', fullScreenStatus.map ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('map')"></span>
                    </div>
                </div>
                <div id="middle-bottom" :class="[fullScreenStatus.rank ? 'fullscreen' : '']">
                    <!-- 地区销量排行图表 -->
                    <Rank ref="rank"></Rank>
                    <div class="resize">
                        <span :class="['iconfont', fullScreenStatus.rank ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('rank')"></span>
                    </div>
                </div>
            </section>
            <section class="screen-right">
                <div id="right-top" :class="[fullScreenStatus.hot ? 'fullscreen' : '']">
                    <!-- 热销商品占比图表 -->
                    <Hot ref="hot"></Hot>
                    <div class="resize">
                        <span :class="['iconfont', fullScreenStatus.hot ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('hot')"></span>
                    </div>
                </div>
                <div id="right-bottom" :class="[fullScreenStatus.stock ? 'fullscreen' : '']">
                    <!-- 库存销量分析图表 -->
                    <Stock ref="stock"></Stock>
                    <div class="resize">
                        <span :class="['iconfont', fullScreenStatus.stock ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('stock')"></span>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
import Seller from '@/components/Seller'
import Trend from '@/components/Trend'
import Map from '@/components/Map'
import Rank from '@/components/Rank'
import Hot from '@/components/Hot'
import Stock from '@/components/Stock'

import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'
import { throttle } from 'lodash'

export default{
    data(){
        return {
            currentTime: this.getCurrentTime(),  // 初始化当前时间
            timer: null,  // 用于存储定时器ID
            // 全屏状态数据
            fullScreenStatus: {
                trend: false,
                seller: false,
                map: false,
                rank: false,
                hot: false,
                stock: false
            },
            // 缓存handleResize中获取的DOM元素，避免重复查询
            title: null,
            datetime: null,
            headerImage: null,
            themeChangeImage: null
        }
    },
    components:{
        Seller,
        Trend,
        Map,
        Rank,
        Hot,
        Stock
    },
    computed: {
        // 将state.theme（this.$store.state.theme）映射为组件的计算属性this.theme
        ...mapState(['theme']),
        borderSrc(){
            return '/static/img' + getThemeValue(this.theme).headerBorderSrc
        },
        themeSrc(){
            return '/static/img' + getThemeValue(this.theme).themeSrc
        },
        containerStyle(){
            return {
                backgroundColor: getThemeValue(this.theme).backgroundColor,
                color: getThemeValue(this.theme).titleColor
            }
        }
    },
    created(){
        this.$socket.registerCallBack('fullScreen', this.receiveData)
        this.$socket.registerCallBack('themeChange', this.recvThemeChange)
    },
    destroyed(){
        this.$socket. unregisterCallBack('fullScreen')
        this.$socket.unRegisterCallBack('themeChange')
    },
    mounted() {
        // 开启定时器，每秒更新一次
        this.timer = setInterval(() => {
            this.currentTime = this.getCurrentTime()
        }, 1000)

        // 每次窗口大小改变都会触发handleResize方法，避免频繁改变，设置节流或防抖
        this.handleResize = throttle(this.handleResize, 200) // 每200ms最多执行一次
        window.addEventListener('resize', this.handleResize)
        // 缓存DOM元素
        this.title = document.querySelector('.title')
        this.datetime = document.querySelector('.datetime')
        this.headerImage = document.querySelector('.head-img')
        this.themeChangeImage = document.querySelector('.theme-change')

        this.$nextTick(() => {
            this.handleResize()
        })
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize)
        // 清除定时器
        clearInterval(this.timer)
    },
    methods: {
        getCurrentTime() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        },
        handleResize(){
            // const title = document.querySelector('.title')
            // const datetime = document.querySelector('.datetime')
            // const headerImage = document.querySelector('.head-img')
            // const themeChangeImage = document.querySelector('.theme-change')

            // 根据窗口宽度计算字体大小缩放比例
            const scale = window.innerWidth / 1280

            // 设置字体大小
            this.title.style.fontSize = 25 * scale + 'px'
            this.datetime.style.fontSize = 15 * scale + 'px'

            // 设置图片宽度（保持宽高比，高度自动调整）
            this.headerImage.style.height = 47 * scale + 'px'

            // 设置主题切换图片的宽度和高度
            this.themeChangeImage.style.width = (28 * scale) + 'px'
            // themeChangeImage.style.height = (21 * scale) + 'px'
        },
        changeSize(chartName){
            // // 先得到目标状态，为实际状态的反方向
            // const targetStatus = !this.fullScreenStatus[chartName]
            // // 将所有的图表设置为非全屏
            // // Object.keys(this.fullScreenStatus) 会返回对象的所有键组成的数组
            // Object.keys(this.fullScreenStatus).forEach(item => {
            //     this.fullScreenStatus[item] = false
            // })
            // // 将目标图表设置为目标状态
            // this.fullScreenStatus[chartName] = targetStatus
            // // 在下次DOM更新循环结束之后执行延迟回调
            // this.$nextTick(() => {
            //     this.$refs[chartName].screenAdapter()
            // })

            // 发送数据
            const targetStatus = !this.fullScreenStatus[chartName]
            this.$socket.send({
                action: 'fullScreen',
                socketType: 'fullScreen',
                chartName: chartName,
                value: targetStatus
            })
        },
        receiveData(data){
            // console.log('data的类型：', typeof data)
            // console.log('data内容：', data)
            // 将所有的图表设置为非全屏
            Object.keys(this.fullScreenStatus).forEach(item => {
                this.fullScreenStatus[item] = false
            })
            // 将目标图表设置为目标状态
            this.fullScreenStatus[data.chartName] = data.value
            // 更新所有图表，确保DOM更新后再调用screenAdapter方法
            // 对每个图表都调用$nextTick不如将所有的screenAdapter调用放在一个$nextTick中
            // Object.keys(this.fullScreenStatus).forEach(item => {
            //     this.$nextTick(() => {
            //         this.$refs[item].screenAdapter()
            //     })
            // })
            // this.$nextTick(() => {
            //     Object.keys(this.fullScreenStatus).forEach(item => {
            //         this.$refs[item].screenAdapter()
            //     })
            // })
            // 合并更新（下一帧统一处理）
            requestAnimationFrame(() => {
                Object.keys(this.fullScreenStatus).forEach(item => {
                    this.$refs[item]?.screenAdapter()
                })
            })

            // const chartName = data.chartName
            // const targetValue = data.value
            // this.fullScreenStatus[chartName] = targetValue
            // this.$nextTick(() => {
            //     this.$refs[chartName].screenAdapter()
            // })
        },
        changeTheme(){
            // 修改VueX中的数据
            // this.$store.commit('changeTheme')
            const data = {
                action: 'themeChange',
                socketType: 'themeChange',
                chartName: '',
                value: ''
            }
            this.$socket.send(data)
        },
        recvThemeChange(){
            // 触发mutation
            this.$store.commit('changeTheme')
        }
    }
}
</script>

<style lang="less">
/* css预处理器less的写法 */
.screen-container {
    width: 100%;
    height: 100%;
    padding: 0 20px;
    background-color: #161522;
    color: #fff;
    box-sizing: border-box;
}
.screen-header {
    width: 100%;
    height: 64px;
    font-size: 20px;
    position: relative;
    > div {
        img {
            width: 100%;
        }
    }
    .title {
        position: absolute;
        left: 40%;
        top: 8%;
        /* top: 50%; */
        font-size: 28px;
        /* transform: translate(-50%, -50%); */
    }
    .title-right {
        display: flex;
        align-items: center;
        position: absolute;
        right: 0;
        top: 8%;
        /* transform: translateY(-80%); */
    }
    .theme-change {
        width: 28px;
        /* h:21px */
        height: auto;
        cursor: pointer;
    }
    .datetime {
        font-size: 15px;
        margin-left: 10px;
    }
    .logo {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-80%);
        img {
            height: 35px;
            width: 128px;
        }
    }
}
.screen-body {
    width: 100%;
    height: 100%;
    display: flex;
    margin-top: 10px;
    .screen-left {
        height: 100%;
        width: 27.6%;
        #left-top {
            height: 53%;
            position: relative;
        }
        #left-bottom {
            height: 31%;
            margin-top: 25px;
            position: relative;
        }
    }
    .screen-middle {
        height: 100%;
        width: 41.5%;
        margin-left: 1.6%;
        margin-right: 1.6%;
        #middle-top {
            width: 100%;
            height: 56%;
            position: relative;
        }
        #middle-bottom {
            width: 100%;
            height: 28%;
            margin-top: 25px;
            position: relative;
        }
    }
    .screen-right {
        height: 100%;
        width: 27.6%;
        #right-top {
            height: 46%;
            position: relative;
        }
        #right-bottom {
            height: 38%;
            margin-top: 25px;
            position: relative;
        }
    }
}
.resize {
    position: absolute;
    top: 20px;
    right: 20px;
    cursor: pointer;
}
/* 全屏状态样式 */
.fullscreen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    z-index: 100;
}
</style>