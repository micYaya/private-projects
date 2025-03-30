<!-- 商家分布图表 -->
<template>
  <div class='com-container' @dblclick="revertMap">
    <div class='com-chart' ref='map_ref'></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 导入axios库，用于发送http请求
import axios from 'axios'
// 导入自定义函数
import { getProvinceMapInfo } from '@/utils/map_utils'

// 按需引入ECharts核心模块
import * as echarts from 'echarts/core'
// 引入地图相关组件和图表
import { MapChart } from 'echarts/charts'
import { GeoComponent } from 'echarts/components'

// 引入主题
import '../../public/static/theme/chalk.js'
import '../../public/static/theme//vintage.js'

// 注册组件和图表
echarts.use([GeoComponent, MapChart])

export default {
  data () {
    return {
      chartInstance: null,
      // 存储从服务器获取的数据
      allData: null,
      mapData: {} // 所获取的省份的地图矢量数据
    }
  },
  computed: {
    // 将state.theme映射为组件的计算属性
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
    this.$socket.registerCallBack('mapData', this.getData)
  },
  async mounted () {
    // 新添
    // 懒加载地图数据
    const [chinaMap] = await Promise.all([
      axios.get('http://localhost:8999/static/map/china.json')
    ])
    echarts.registerMap('china', chinaMap.data)
    // 新添

    this.initChart()
    // this.getData()
    const data = {
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map',
      value: ''
    }
    this.$socket.send(data)
    window.addEventListener('resize', this.screenAdapter)
    // 确保初始显示时图表自适应窗口大小
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallBack('mapData')
    this.chartInstance.dispose()  // 释放Echarts实例
    this.mapData = {}  // 清空缓存
  },
  methods: {
    async initChart () {
      // this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme)
      this.chartInstance = echarts.init(this.$refs.map_ref, this.theme)
      // 获取中国地图的矢量数据
      // http://localhost:8999/static/map/china.json
      // 由于获取的地图矢量数据并不是位于KOA2的后台, 所以不能使用this.$http

      // 修改：前面添加了懒加载，这里就注释了
      // const ret = await axios.get('http://localhost:8999/static/map/china.json')
      // // 注册地图数据
      // this.$echarts.registerMap('china', ret.data)
      // 修改

      const initOption = {
        title: {
          text: '▎ 商家分布',
          left: 20,
          top: 20
        },
        geo: {
          type: 'map',
          // 使用地图数据
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2E7290',
            borderColor: '#333'
          }

        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical'
        }
      }
      this.chartInstance.setOption(initOption)
      // 为图表绑定事件监听器
      this.chartInstance.on('click', async arg => {
        // arg.name 得到所点击的省份, 为中文
        const provinceInfo = getProvinceMapInfo(arg.name)
        // console.log(provinceInfo)
        // 需要获取这个省份的地图矢量数据
        // 判断当前所点击的这个省份的地图矢量数据在mapData（缓存，避免每次都转换）中是否存在
        if (!this.mapData[provinceInfo.key]) {
          const ret = await axios.get('http://localhost:8999' + provinceInfo.path)
          this.mapData[provinceInfo.key] = ret.data
          // this.$echarts.registerMap(provinceInfo.key, ret.data)
          echarts.registerMap(provinceInfo.key, ret.data)
        }
        const changeOption = {
          geo: {
            map: provinceInfo.key
          }
        }
        this.chartInstance.setOption(changeOption)
      })
    },
    // async getData () {
    //   // 获取服务器koaserver的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
    //   const { data: ret } = await this.$http.get('map')
    //   this.allData = ret
    //   console.log(this.allData)
    //   this.updateChart()
    // },
    getData (ret) {
      this.allData = JSON.parse(ret)
      this.updateChart()
    },
    updateChart () {
      // 处理图表需要的数据
      // 图例的数据
      const legendArr = this.allData.map(item => {
        return item.name
      })
      const seriesArr = this.allData.map(item => {
        // return的这个对象就代表的是一个类别下的所有散点数据
        // 如果想在地图中显示散点的数据, 我们需要给散点的图表增加一个配置, coordinateSystem:geo
        return {
          type: 'effectScatter',
          // 散点的涟漪波纹效果
          rippleEffect: {
            scale: 5,
            brushType: 'stroke'
          },
          name: item.name,
          data: item.children,
          // 指定使用地理坐标系
          coordinateSystem: 'geo'
        }
      })
      const dataOption = {
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter () {
      const titleFontSize = this.$refs.map_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    // 回到中国地图
    revertMap () {
      const revertOption = {
        geo: {
          map: 'china'
        }
      }
      this.chartInstance.setOption(revertOption)
    }
  }
}
</script>

<style lang='less' scoped>
</style>
