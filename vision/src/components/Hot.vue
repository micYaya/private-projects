<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
    <span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
    <span class="cat-name" :style="comStyle">{{ catName }}</span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'

// 按需引入echarts核心模块
import * as echarts from 'echarts/core'
// 引入饼图图表
import { PieChart } from 'echarts/charts'
// 引入标题、提示框、图例等组件
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'

// 引入主题
import '../../public/static/theme/chalk.js'
import '../../public/static/theme//vintage.js'
// 注册需要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart
])

export default {
  data () {
    return {
      chartInstance: null,
      allData: null,
      currentIndex: 0,
      titleFontSize: 0
    }
  },
  computed: {
    catName(){
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.currentIndex].name
      }
    },
    // 控制span大小
    comStyle(){
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
    ...mapState(['theme'])
  },
  created () {
    // 在组件创建完成之后，进行回调函数的注册
    this.$socket.registerCallBack('hotproductData', this.getData)
  },
  watch: {
    theme(){
      this.chartInstance.dispose()
      this.initChart()
      this.screenAdapter()
      this.updateChart()
    }
  },
  mounted () {
    this.initChart()
    // this.getData()
    const data = {
      action: 'getData',
      socketType: 'hotproductData',
      chartName: 'hotproduct',
      value: ''
    }
    this.$socket.send(data)
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    // 在组件销毁的时候，进行回调函数的取消
    this.$socket.unRegisterCallBack('hotproductData')
  },
  methods: {
    initChart () {
      // 这里修改了，不用全局挂载的echarts，用每个组件按需加载的echarts
      // this.chartInstance = this.$echarts.init(this.$refs.hot_ref, this.theme)
      this.chartInstance = echarts.init(this.$refs.hot_ref, this.theme)
      const initOption = {
        title: {
          text: '▎ 热销商品的占比',
          left: 20,
          top: 20
        },
        legend: {
          top: '15%',
          icon: 'circle'
        },
        // 工具提示
        tooltip: {
          show: true,
          // 显示格式
          formatter: arg => {
            // console.log(arg)
            // 获取下一级分类
            const nextCategory = arg.data.children
            let sum = 0
            nextCategory.forEach(element => {
              sum += element.value
            })
            let showText = ''
            nextCategory.forEach(element => {
              showText += `${element.name}:  ${(element.value / sum * 100).toFixed(2)}%<br>`
            })
            return showText
          }
        },
        series: [
          {
            type: 'pie',
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16
              },
              labelLine: {
                show: false
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
    },
    // async getData () {
    //   // 获取服务器的数据，对this.allData进行赋值之后，调用updateChart方法更新图表
    //   const { data: ret } = await this.$http.get('hotproduct')
    //   this.allData = ret
    //   console.log(this.allData)
    //   this.updateChart()
    // },
    getData (ret) {
      this.allData = JSON.parse(ret)
      this.updateChart()
    },
    updateChart () {
      const legendData = this.allData[this.currentIndex].children.map( item => {
        return item.name
      })
      const seriesData = this.allData[this.currentIndex].children.map( item => {
        return {
          name: item.name,
          value: item.value,
          children: item.children
        }
      })
      const dataOption = {
        legend: {
          data: legendData
        },
        series: [
          {
            data: seriesData
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter () {
      this.titleFontSize = this.$refs.hot_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 1.2,
            color: '#fff'
          }
        },
        series: [
          {
            radius: this.titleFontSize * 4.5,
            center: ['50%', '60%']
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    toLeft() {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1
      }
      this.updateChart()
    },
    toRight() {
      this.currentIndex++
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0
      }
      this.updateChart()
    }
  }
}
</script>

<style lang="less" scoped>
.arr-left {
  position: absolute;
  /* z-index: 99; */
  left: 10%;
  top: 60%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.arr-right {
  position: absolute;
  right: 10%;
  top: 60%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.cat-name {
  position: absolute;
  left: 80%;
  bottom: 20px;;
  color: white;
}
</style>
