<template>
  <div :id="id" :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '50vh'
    },
    trueCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      chart: null,
      xData: [], // 存储近七天日期
      yData: []  // 存储设备数量
    }
  },
  mounted() {
    this.initChart()
    this.fetchData()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  watch: {
    trueCount(newVal) {
      console.log('trueCount 发生变化，新值为:', newVal);
      this.fetchData();
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      this.setChartOption()
    },
    async fetchData() {
      try {
        console.log('接收到的 trueCount 值:', this.trueCount); // 添加调试信息
        // 生成近七天日期
        this.xData = this.getLastSevenDays()
        // 模拟获取近七天正在运行的机器数据
        // 实际使用时替换为真实的接口调用
        const mockData = [
          { date: this.xData[0], deviceCount: 1 },
          { date: this.xData[1], deviceCount: 3 },
          { date: this.xData[2], deviceCount: 2 },
          { date: this.xData[3], deviceCount: 1 },
          { date: this.xData[4], deviceCount: 2 },
          { date: this.xData[5], deviceCount: 3 },
          { date: this.xData[6], deviceCount: this.trueCount }
        ]
        this.yData = mockData.map(item => item.deviceCount)
        this.setChartOption()
      } catch (error) {
        console.error('获取设备运行数据失败:', error)
      }
    },
    getLastSevenDays() {
      const dates = []
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        dates.push(`${month}-${day}`)
      }
      return dates
    },
    setChartOption() {
      this.chart.clear(); // 清除旧的图表数据
      this.chart.setOption({
        backgroundColor: '#394056',
        title: {
          top: 20,
          text: '近七天正在运行的机器数量统计',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
            color: '#F1F1F3'
          },
          left: '1%'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: '#57617B'
            }
          }
        },
        legend: {
          show: false // 隐藏图例
        },
        grid: {
          top: 100,
          left: '2%',
          right: '2%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#57617B'
            }
          },
          axisLabel: {
            rotate: 45,
            interval: 'auto'
          },
          name: '日期',
          data: this.xData
        }],
        yAxis: [{
          type: 'value',
          name: '设备数量',
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#57617B'
            }
          },
          axisLabel: {
            margin: 10,
            textStyle: {
              fontSize: 14
            }
          },
          splitLine: {
            lineStyle: {
              color: '#57617B'
            }
          }
        }],
        series: [{
          name: '正在运行的机器',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          showSymbol: false,
          lineStyle: {
            normal: {
              width: 1
            }
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(137, 189, 27, 0.3)'
              }, {
                offset: 0.8,
                color: 'rgba(137, 189, 27, 0)'
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10
            }
          },
          itemStyle: {
            normal: {
              color: 'rgb(137,189,27)',
              borderColor: 'rgba(137,189,2,0.27)',
              borderWidth: 12
            }
          },
          data: this.yData
        }]
      })
    }
  }
}
</script>
