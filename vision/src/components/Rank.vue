<template>
    <div class="com-container">
        <!-- <p>地区销售排行图表</p> -->
        <div class="com-chart" ref="rank_ref"></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
// 按需引入echarts核心模块
import * as echarts from 'echarts/core'
// 引入柱状图图表
import { BarChart } from 'echarts/charts'
// 引入标题、提示框、坐标轴、数据缩放等组件
import { TitleComponent, TooltipComponent, GridComponent, DataZoomComponent } from 'echarts/components'

// 引入主题
import '../../public/static/theme/chalk.js'
import '../../public/static/theme//vintage.js'
// 注册需要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  BarChart
])

export default {
  data () {
    return {
      chartInstance: null,
      allData: null,
      // 区域滑动起点和终点值
      startValue: 0,
      endValue: 9,
      timeId: null
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    theme(){
      this.chartInstance.dispose()
      this.initChart()
      this.screenAdapter()
      this.updateChart()
    }
  },
  created () {
    // 在组件创建完成之后，进行回调函数的注册
    this.$socket.registerCallBack('rankData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    const data = {
      action: 'getData',
      socketType: 'rankData',
      chartName: 'rank',
      value: ''
    }
    this.$socket.send(data)
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallBack('rankData')
    clearInterval(this.timeId)
  },
  methods: {
    initChart () {
      // 这里修改了，不用全局挂载的echarts，用每个组件按需加载的echarts
      // this.chartInstance = this.$echarts.init(this.$refs.rank_ref, this.theme)
      this.chartInstance = echarts.init(this.$refs.rank_ref, this.theme)
      const initOption = {
        title: {
          text: '▎地区销售排行',
          top: 20,
          left: 20
        },
        grid: {
          top: '30%',
          left: '5%',
          bottom: '5%',
          right: '5%',
          containLabel: true
        },
        tooltip: {
          show: true
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          type: 'bar'
        }]
      }
      this.chartInstance.setOption(initOption)
      // ECharts实例并没有addEventListener方法，有自己的事件监听机制，使用的是on方法来绑定事件
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timeId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // async getData () {
    //   // 获取服务器的数据，对this.allData进行赋值之后，调用updateChart方法更新图表
    //   const { data: ret } = await this.$http.get('rank')
    //   this.allData = ret
    //   this.allData.sort((a, b) => {
    //     return b.value - a.value
    //   })
    //   console.log(this.allData)
    //   this.updateChart()
    //   this.startInterval()
    // },
    getData (ret) {
      this.allData = JSON.parse(ret)
      this.allData.sort((a, b) => {
        return b.value - a.value
      })
      this.updateChart()
      this.startInterval()
    },
    updateChart () {
      const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E4'],
        ['#5052EE', '#AB6EE5']
      ]
      // 处理图表需要的数据
      // 所有省份所形成的数组
      const provinceArr = this.allData.map(item => {
        return item.name
      })
      // 所有省份对应的销售数据
      const valueArr = this.allData.map(item => {
        return item.value
      })
      const dataOption = {
        xAxis: {
          data: provinceArr
        },
        // 平移滑动条
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        },
        series: [{
          data: valueArr,
          itemStyle: {
            color: item => {
              let targetColor = null
              if (item.value > 300) {
                targetColor = colorArr[0]
              } else if (item.value > 200) {
                targetColor = colorArr[1]
              } else {
                targetColor = colorArr[2]
              }
              // 换成按需加载后，这里也要修改，从原来全局挂载的echarts换成组件自己注册的echarts
              // return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: targetColor[0]
                },
                {
                  offset: 1,
                  color: targetColor[1]
                }
              ])
            }
          }
        }]
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter () {
      const titleFontSize = this.$refs.rank_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [{
          barWidth: titleFontSize,
          itemStyle: {
            barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
          }
        }]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    // 定时器控制滑动条的自动移动
    startInterval () {
      if (this.timeId) {
        clearInterval(this.timeId)
      }
      this.timeId = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 2000)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
