<!-- 商家销量统计的横向柱状图 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'

// 按需引入ECharts核心模块
import * as echarts from 'echarts/core'
// 引入柱状图相关组件和图表
// import { BarChart, TitleComponent, TooltipComponent, XAxisComponent, YAxisComponent, GridComponent } from 'echarts/components'
// BarChart 属于 charts 模块（部分版本）
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'

// 引入主题
import '../../public/static/theme/chalk.js'
import '../../public/static/theme//vintage.js'
// 注册组件和图表
echarts.use([BarChart, TitleComponent, TooltipComponent,  GridComponent])

export default {
  data () {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据
      currentPage: 1, // 当前显示的页数
      totalPage: 0, // 一共有多少页
      timerId: null // 定时器的标识
    }
  },
  computed: {
    // 将 Vuex store 中的 state 映射到组件的计算属性中
    ...mapState(['theme'])
  },
  watch: {
    // 监听theme的变化
    theme() {
      // 先销毁图表
      this.chartInstance.dispose()
      this.initChart()
      this.screenAdapter()
      this.updateChart()
    }
  },
  created () {
    // 在组件创建完成之后，进行回调函数的注册
    this.$socket.registerCallBack('sellerData', this.getData)
  },
  // 组件挂载完成后执行的钩子函数
  mounted () {
    // 初始化图表
    this.initChart()
    // 获取服务器数据
    // this.getData()
    const data = {
      action: 'getData',
      socketType: 'sellerData',
      chartName: 'seller',
      value: ''
    }
    this.$socket.send(data)
    window.addEventListener('resize', this.screenAdapter)
    // 在页面加载完成的时候, 主动进行屏幕的适配
    this.screenAdapter()
  },
  // 组件销毁前执行的钩子函数
  destroyed () {
    clearInterval(this.timerId)
    // 在组件销毁的时候, 需要将监听器取消掉，避免销毁后仍触发事件
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallBack('sellerData')
  },
  methods: {
    // 初始化echartInstance对象
    initChart () {
      // 绑定到 seller_ref 对应的DOM元素上，并使用'chalk'主题
      // this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme)
      this.chartInstance = echarts.init(this.$refs.seller_ref, this.theme)
      // 对图表初始化配置的控制
      const initOption = {
        title: {
          text: '▎商家销售统计',
          left: 20,
          top: 20
        },
        grid: {
          top: '20%',
          left: '3%',
          right: '6%',
          bottom: '3%',
          containLabel: true // 距离是包含坐标轴上的文字
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
        },
        // 图表提示框配置
        tooltip: {
          // 触发类型为坐标轴触发
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              color: '#2D3443'
            }
          }
        },
        series: [
          {
            // 柱状图
            type: 'bar',
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: getThemeValue(this.theme).legendColor
              }
            },
            itemStyle: {
              // 指明颜色渐变的方向
              // 指明不同百分比之下颜色的值
              // color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                // 百分之0状态之下的颜色值
                {
                  offset: 0,
                  color: '#5052EE'
                },
                // 百分之100状态之下的颜色值
                {
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      // 对图表对象进行鼠标事件的监听
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 获取服务器的数据
    // async getData () {
    //   // http://127.0.0.1:8888/api/seller
    //   const { data: ret } = await this.$http.get('seller')
    //   this.allData = ret
    //   // 对数据排序
    //   this.allData.sort((a, b) => {
    //     return a.value - b.value // 从小到大的排序
    //   })
    //   // 每5个元素显示一页
    //   this.totalPage = this.allData.length % 5 === 0 ? this.allData.length / 5 : this.allData.length / 5 + 1
    //   this.updateChart()
    //   // 启动定时器
    //   this.startInterval()
    // },
    getData (ret) {
      this.allData = JSON.parse(ret)
      // 对数据排序
      this.allData.sort((a, b) => {
        return a.value - b.value // 从小到大的排序
      })
      // 每5个元素显示一页
      this.totalPage = this.allData.length % 5 === 0 ? this.allData.length / 5 : this.allData.length / 5 + 1
      this.updateChart()
      // 启动定时器
      this.startInterval()
    },
    // 更新图表
    updateChart () {
      const start = (this.currentPage - 1) * 5
      const end = this.currentPage * 5
      // 截取当前页要显示的数据
      const showData = this.allData.slice(start, end)
      const sellerNames = showData.map((item) => {
        return item.name
      })
      // 提取商家销量值数组
      const sellerValues = showData.map((item) => {
        return item.value
      })
      // 定义更新图表的配置
      const dataOption = {
        yAxis: {
          data: sellerNames
        },
        series: [
          {
            data: sellerValues
          }
        ]
      }
      // 应用到图表实例中
      this.chartInstance.setOption(dataOption)
    },
    startInterval () {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.currentPage++
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1
        }
        this.updateChart()
      }, 3000)
    },
    // 当浏览器的大小发生变化的时候, 会调用的方法, 来完成屏幕的适配
    screenAdapter () {
      // console.log(this.$refs.seller_ref.offsetWidth)
      const titleFontSize = this.$refs.seller_ref.offsetWidth / 100 * 3.6
      // 和分辨率大小相关的配置项
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize
            }
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      // 手动的调用图表对象的resize 才能产生效果
      this.chartInstance.resize()
    }
  }
}
</script>

<style lang="less" scoped>
</style>
