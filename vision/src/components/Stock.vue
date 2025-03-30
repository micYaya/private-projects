<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

// 引入 ECharts 核心库
import * as echarts from 'echarts/core'
// 引入饼图图表
import { PieChart } from 'echarts/charts'
// 引入标题、提示框、图例组件
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'

// 引入主题
import '../../public/static/theme/chalk.js'
import '../../public/static/theme//vintage.js'
// 注册所需的图表和组件
echarts.use([PieChart, TitleComponent, TooltipComponent, LegendComponent])

export default {
  data () {
    return {
      chartInstance: null,
      allData: null,
      currentIndex: 0,
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
    this.$socket.registerCallBack('stockData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    const data = {
    action: 'getData',
    socketType: 'stockData',
    chartName: 'stock',
    value: ''
  }
  this.$socket.send(data)
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timeId)
    this.$socket.unRegisterCallBack('stockData')
  },
  methods: {
    initChart () {
      // this.chartInstance = this.$echarts.init(this.$refs.stock_ref, this.theme)
      this.chartInstance = echarts.init(this.$refs.stock_ref, this.theme)
      const initOption = {
        title: {
          text: '▎ 库存排行',
          left: 20,
          top: 20
        },
        series: [
          {
            type: 'pie'
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timeId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // async getData () {
    //   // 获取服务器的数据，对this.allData进行赋值之后，调用updateChart方法更新图表
    //   const { data: ret } = await this.$http.get('stock')
    //   this.allData = ret
    //   console.log(this.allData)
    //   this.updateChart()
    //   this.startInterval()
    // },
    getData (ret) {
      this.allData = JSON.parse(ret)
      this.updateChart()
      this.startInterval()
    },
    updateChart () {
      const centerArr = [
        ['16%', '38%'],
        ['52%', '38%'],
        ['86%', '38%'],
        ['34%', '73%'],
        ['69%', '73%']
      ]
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF'],
      ]
      let endIndex = 0
      if (this.allData.length - this.currentIndex < 5) {
        endIndex = this.allData.length - 1
      } else {
        endIndex = this.currentIndex + 5
      }
      const dataArr = this.allData.slice(this.currentIndex, endIndex).map((item, index) => {
        return {
          type: 'pie',
          center: centerArr[index],
          // 去除鼠标动画效果
          hoverAnimation: false,
          labelLine: {
            // 隐藏指示线
            show: false
          },
          label: {
            position: 'center',
            show: true,
            color: colorArr[index][0]
          },
          data: [
            {
              name: item.name + '\n\n' + item.sales,
              value: item.sales,
              itemStyle: {
                // color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArr[index][0]
                  },
                  {
                    offset: 1,
                    color: colorArr[index][1]
                  }
                ])
              }
            },
            {
              name: item.name + '\n\n' + item.sales,
              value: item.stock,
              itemStyle: {
                color: '#333843'
              }
            }
          ]
        }
      })
      // console.log(dataArr)
      const dataOption = {
        series: dataArr
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter () {
      const titleFontSize = this.$refs.stock_ref.offsetWidth / 100 * 3.6
      const innerRadius = titleFontSize * 2.6
      const outterRadius = innerRadius * 1.2
      const seriesStyle = {
        type: 'pie',
        label: {
          fontSize: titleFontSize / 1.3,
          show: true
        },
        radius: [outterRadius, innerRadius]
      }
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          seriesStyle,
          seriesStyle,
          seriesStyle,
          seriesStyle,
          seriesStyle
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    startInterval(){
      if(this.timeId){
        clearInterval(this.timeId)
      }
      this.timeId = setInterval(() => {
        this.currentIndex += 5
        if(this.currentIndex > this.allData.length - 1){
          this.currentIndex = 0
        }
        this.updateChart()
      },3000)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
