<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{ '▎ ' +  showTitle }}</span>
      <span class="iconfont title-icon" :style="comStyle"  @click="showChoice = !showChoice">&#xe6eb;</span>
      <div class="select-con" v-show="showChoice" :style="marginStyle">
        <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'

// 引入 ECharts 核心库
import * as echarts from 'echarts/core'
// 引入折线图图表
import { LineChart } from 'echarts/charts'
// 引入标题、提示框、图例、网格组件
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'

// 引入主题
import '../../public/static/theme/chalk.js'
import '../../public/static/theme//vintage.js'
// 注册所需的图表和组件
echarts.use([LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

export default {
  data () {
    return {
      chartInstance: null,
      allData: null, // 从服务器中获取的所有数据
      showChoice: false, // 是否显示可选项
      choiceType: 'map', // 显示的数据类型
      titleFontSize: 0 // 指明标题的字体大小
    }
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
    this.$socket.registerCallBack('trendData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    // 发送数据给服务器，通知服务器需要这个数据
    // console.log('s')
    const data = {
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend',
      value: ''
    }
    // const jsonString = JSON.stringify(data);
    this.$socket.send(
      // 'you are a pig.'
      // "{action: 'getData',socketType: 'trendData', chartName: 'trend',value: '' }"
      data
      )
    // console.log('e')
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    // 在组件销毁的时候，进行回调函数的取消
    this.$socket.unRegisterCallBack('trendData')
  },
  computed: {
    comStyle(){
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
    marginStyle(){
      return {
        marginLeft: this.titleFontSize + 'px',
        backgroundColor: getThemeValue(this.theme).backgroundColor,
        color: getThemeValue(this.theme).titleColor
      }
    },
    ...mapState(['theme']),
    selectTypes () {
      if (!this.allData) {
        return []
      } else {
        return this.allData.type.filter(item => {
          return item.key !== this.choiceType
        })
      }
    },
    showTitle () {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.choiceType].title
      }
    }
  },
  methods: {
    initChart () {
      // this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme)
      this.chartInstance = echarts.init(this.$refs.trend_ref, this.theme)
      const initOption = {
        grid: {
          left: '3%',
          top: '35%',
          right: '4%',
          bottom: '1%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          left: 20,
          top: '15%',
          icon: 'circle',
          textStyle: {
            color: getThemeValue(this.theme).legendColor
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        }
      }
      this.chartInstance.setOption(initOption)
    },
    // ret是服务端发送给客户端的图表数据
    getData (ret) {
      // await this.$http.get()
      // 对allData进行赋值
      // const { data: ret } = await this.$http.get('trend')

      // JSON.parse将json字符串解析为JAVASCRIPT对象
      // JSON.stringify将JavaScript对象转换成JSON字符串
      // console.log(ret)
      // string
      // console.log(typeof ret)
      this.allData = JSON.parse(ret)
      // object
      // console.log(this.allData)
      // console.log(typeof this.allData)
      this.updateChart()
    },
    updateChart () {
      // 半透明的颜色值
      const colorArr1 = [
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
      ]
      // 全透明的颜色值
      const colorArr2 = [
        'rgba(11, 168, 44, 0)',
        'rgba(44, 110, 255, 0)',
        'rgba(22, 242, 217, 0)',
        'rgba(254, 33, 30, 0)',
        'rgba(250, 105, 0, 0)'
      ]
      // 处理数据
      // 类目轴的数据
      const timeArr = this.allData.common.month
      // y轴的数据 series下的数据
      const valueArr = this.allData[this.choiceType].data
      const seriesArr = valueArr.map((item, index) => {
        return {
          name: item.name,
          type: 'line',
          data: item.data,
          stack: this.choiceType,
          areaStyle: {
            // color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colorArr1[index]
              }, // %0的颜色值
              {
                offset: 1,
                color: colorArr2[index]
              } // 100%的颜色值
            ])
          }
        }
      })
      // 图例的数据
      const legendArr = valueArr.map(item => {
        return item.name
      })
      const dataOption = {
        xAxis: {
          data: timeArr
        },
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter () {
      this.titleFontSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize * 1.2,
          itemHeight: this.titleFontSize * 1.2,
          itemGap: this.titleFontSize * 1.2,
          textStyle: {
            fontSize: this.titleFontSize / 1.2
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    handleSelect (currentType) {
      this.choiceType = currentType
      this.updateChart()
      this.showChoice = false
    }
  }
}
</script>

<style lang="less" scoped>
.title {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 10;
  /* color: white; */
  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }
  .select-con {
    background-color: #222733;
    cursor: pointer;
  }
}
</style>
