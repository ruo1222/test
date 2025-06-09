<template>
  <div class="mt-8 shadow-md border-0 overflow-hidden rounded-lg">
    <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b">
      <h3 class="font-medium text-lg flex items-center">
        <History class="h-5 w-5 mr-2 text-indigo-500" />
        历史数据
      </h3>
      <p class="text-sm text-gray-600">惠州历史空气质量图表</p>
    </div>
    <div class="p-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div v-if="currentValue !== null && currentLevel" class="flex items-center">
            <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: getBarColor(currentValue) }"></div>
            <span class="text-2xl font-bold" :style="{ color: getBarColor(currentValue) }">
              {{ currentValue }} {{ selectedIndicatorInfo.unit }}
            </span>
            <span
              class="ml-2 px-2 py-1 rounded-full text-sm text-white"
              :style="{ backgroundColor: getBarColor(currentValue) }"
            >
              {{ currentLevel }}
            </span>
          </div>
          <div v-if="currentDate" class="text-sm text-gray-500 mt-1 flex items-center">
            <Calendar class="h-4 w-4 mr-1" />
            {{ formatDate(new Date(currentDate)) }}
          </div>
        </div>
        <div class="flex items-center mt-4 md:mt-0 space-x-4">
          <div class="bg-white rounded-lg shadow-sm">
            <div class="flex">
              <button 
                @click="timeframe = 'hourly'" 
                :class="[
                  'px-4 py-2 text-sm rounded-l-lg',
                  timeframe === 'hourly' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'
                ]"
              >
                每小时
              </button>
              <button 
                @click="timeframe = 'daily'" 
                :class="[
                  'px-4 py-2 text-sm rounded-r-lg',
                  timeframe === 'daily' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'
                ]"
              >
                每天
              </button>
            </div>
          </div>
          <select 
            v-model="selectedIndicator" 
            class="w-[120px] bg-white shadow-sm border border-gray-300 rounded-md px-3 py-2"
          >
            <option v-for="indicator in indicators" :key="indicator.id" :value="indicator.id">
              {{ indicator.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="relative h-[400px] bg-white p-4 rounded-lg">
        <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <p class="text-gray-500">加载中...</p>
        </div>
        <div ref="chartContainer" class="w-full h-full"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { History, Calendar } from 'lucide-vue-next';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { fetchHistoricalData, fetchAQITrend } from '../lib/api';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
  BarChart,
  LineChart,
  CanvasRenderer,
]);

const selectedIndicator = ref('pm25');
const timeframe = ref('daily');
const data = ref([]);
const isLoading = ref(true);
const currentValue = ref(null);
const currentDate = ref(null);
const currentLevel = ref(null);
const chartContainer = ref(null);
const chart = ref(null);

const indicators = [
  {
    id: "aqi",
    name: "AQI",
    unit: "",
    color: "#10b981",
    thresholds: {
      excellent: 50,
      good: 100,
      moderate: 150,
      unhealthy: 200,
      veryUnhealthy: 300,
    },
  },
  {
    id: "pm25",
    name: "PM2.5",
    unit: "μg/m³",
    color: "#f59e0b",
    thresholds: {
      excellent: 35,
      good: 75,
      moderate: 115,
      unhealthy: 150,
      veryUnhealthy: 250,
    },
  },
  {
    id: "pm10",
    name: "PM10",
    unit: "μg/m³",
    color: "#f97316",
    thresholds: {
      excellent: 50,
      good: 150,
      moderate: 250,
      unhealthy: 350,
      veryUnhealthy: 420,
    },
  },
  {
    id: "so2",
    name: "SO₂",
    unit: "μg/m³",
    color: "#10b981",
    thresholds: {
      excellent: 50,
      good: 150,
      moderate: 475,
      unhealthy: 800,
      veryUnhealthy: 1600,
    },
  },
  {
    id: "no2",
    name: "NO₂",
    unit: "μg/m³",
    color: "#10b981",
    thresholds: {
      excellent: 40,
      good: 80,
      moderate: 180,
      unhealthy: 280,
      veryUnhealthy: 565,
    },
  },
  {
    id: "o3",
    name: "O₃",
    unit: "μg/m³",
    color: "#f59e0b",
    thresholds: {
      excellent: 100,
      good: 160,
      moderate: 215,
      unhealthy: 265,
      veryUnhealthy: 800,
    },
  },
  {
    id: "co",
    name: "CO",
    unit: "mg/m³",
    color: "#10b981",
    thresholds: {
      excellent: 2,
      good: 4,
      moderate: 14,
      unhealthy: 24,
      veryUnhealthy: 36,
    },
  },
  {
    id: "hpa",
    name: "气压",
    unit: "hPa",
    color: "#0ea5e9",
    thresholds: {
      excellent: 1000,
      good: 1010,
      moderate: 1020,
      unhealthy: 1030,
      veryUnhealthy: 1040,
    },
  },
];

const selectedIndicatorInfo = computed(() => {
  return indicators.find(i => i.id === selectedIndicator.value) || indicators[0];
});

onMounted(async () => {
  try {
    await loadData();
    if (chartContainer.value && !chart.value) {
      chart.value = echarts.init(chartContainer.value);
      updateChart();
      
      const handleResize = () => {
        if (chart.value) {
          chart.value.resize();
        }
      };
      window.addEventListener('resize', handleResize);
    }
  } catch (error) {
    console.error('Failed to initialize chart:', error);
  }
});

watch([selectedIndicator, timeframe], async () => {
  await loadData();
  nextTick(() => {
    updateChart();
  });
});

const loadData = async () => {
  isLoading.value = true;
  try {
    const historicalData = await fetchHistoricalData(selectedIndicator.value, timeframe.value);
    console.log('Historical data loaded:', historicalData);
    
    if (historicalData && historicalData.length > 0) {
      data.value = historicalData.map(item => {
        const timeStr = formatXAxis(item.date);
        return {
          ...item,
          timeStr,
          value: item[selectedIndicator.value]
        };
      });
      
      const mostRecent = data.value[data.value.length - 1];
      currentValue.value = mostRecent.value;
      currentDate.value = mostRecent.date;
      currentLevel.value = getAirQualityLevel(currentValue.value, selectedIndicatorInfo.value);
      
      await nextTick();
      if (!chart.value && chartContainer.value) {
        chart.value = echarts.init(chartContainer.value);
      }
      updateChart();
    }
  } catch (error) {
    console.error("Failed to load historical data:", error);
    data.value = [];
  } finally {
    isLoading.value = false;
  }
};

const getAirQualityLevel = (value, indicator) => {
  const { thresholds } = indicator;

  // 特殊处理气压
  if (indicator.id === "hpa") {
    if (value >= 1000 && value <= 1025) return "正常";
    if (value < 1000) return "低压";
    return "高压";
  }

  if (value <= thresholds.excellent) return "优秀";
  if (value <= thresholds.good) return "良";
  if (value <= thresholds.moderate) return "轻度污染";
  if (value <= thresholds.unhealthy) return "中度污染";
  if (value <= thresholds.veryUnhealthy) return "重度污染";
  return "严重污染";
};

const getBarColor = (value) => {
  const { thresholds } = selectedIndicatorInfo.value;

  // 特殊处理气压
  if (selectedIndicator.value === "hpa") {
    if (value >= 1000 && value <= 1025) return "#0ea5e9"; // 正常气压 - 蓝色
    if (value < 1000) return "#f59e0b"; // 低气压 - 黄色
    return "#8b5cf6"; // 高气压 - 紫色
  }

  if (value <= thresholds.excellent) return "#10b981"; // green
  if (value <= thresholds.good) return "#f59e0b"; // amber
  if (value <= thresholds.moderate) return "#f97316"; // orange
  if (value <= thresholds.unhealthy) return "#ef4444"; // red
  if (value <= thresholds.veryUnhealthy) return "#8b5cf6"; // purple
  return "#7c3aed"; // dark purple
};

const formatDate = (date) => {
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

const formatXAxis = (value) => {
  try {
    const date = new Date(value);
    if (timeframe.value === "hourly") {
      return date.toLocaleTimeString([], { 
        hour: "2-digit",
        minute: "2-digit",
        hour12: false 
      });
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekDay = date.toLocaleDateString('zh-CN', { weekday: 'short' });
      return `${month}/${day} ${weekDay}`;
    }
  } catch (e) {
    return value;
  }
};

const updateChart = () => {
  if (!chart.value || !data.value || data.value.length === 0) {
    console.log('Cannot update chart: chart instance or data not ready');
    return;
  }
  
  const option = {
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        snap: true,
        lineStyle: {
          color: '#666',
          type: 'dashed'
        }
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#eee',
      borderWidth: 1,
      padding: [10, 15],
      textStyle: {
        color: '#666',
        fontSize: 13
      },
      position: function (pos, params, el, elRect, size) {
        const obj = { top: 10 };
        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
        return obj;
      },
      extraCssText: 'box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);',
      formatter: function(params) {
        const param = params[0];
        if (!param) return '';
        
        const item = data.value[param.dataIndex];
        if (!item) return '';

        const date = new Date(item.date);
        const formattedDate = timeframe.value === 'hourly' 
          ? date.toLocaleString('zh-CN', { 
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })
          : date.toLocaleDateString('zh-CN', { 
              month: 'numeric',
              day: 'numeric',
              weekday: 'long'
            });
        
        const value = item[selectedIndicator.value];
        const level = getAirQualityLevel(value, selectedIndicatorInfo.value);
        const color = getBarColor(value);
        
        return `
          <div style="font-weight: bold; margin-bottom: 5px; font-size: 14px;">
            ${formattedDate}
          </div>
          <div style="color: ${color}; margin: 3px 0;">
            <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; border-radius: 50%; margin-right: 5px;"></span>
            ${selectedIndicatorInfo.value.name}: ${value} ${selectedIndicatorInfo.value.unit}
          </div>
          <div style="margin-top: 3px;">
            空气质量: ${level}
          </div>
        `;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.value.map(item => item.timeStr),
      axisLabel: {
        fontSize: 12,
        interval: 0,
        rotate: 45,
        color: '#666',
        margin: 16
      },
      axisLine: { 
        lineStyle: { 
          color: '#999',
          width: 1
        } 
      }
    },
    yAxis: {
      type: 'value',
      name: selectedIndicatorInfo.value.name + (selectedIndicatorInfo.value.unit ? ` (${selectedIndicatorInfo.value.unit})` : ''),
      nameTextStyle: {
        color: '#666',
        fontSize: 12,
        padding: [0, 0, 0, 30]
      },
      axisLine: { 
        show: true,
        lineStyle: { 
          color: '#999',
          width: 1
        } 
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#eee'
        }
      }
    },
    series: [
      {
        name: selectedIndicatorInfo.value.name,
        type: 'bar',
        barWidth: '60%',
        data: data.value.map(item => ({
          value: item[selectedIndicator.value],
          itemStyle: {
            color: getBarColor(item[selectedIndicator.value])
          }
        })),
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          focus: 'series',
          scale: true,
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        }
      }
    ]
  };

  try {
    chart.value.setOption(option, true);
    chart.value.resize();
    
    // 移除之前的事件监听器
    chart.value.off('mouseover');
    chart.value.off('mousemove');
    chart.value.off('globalout');
    
    // 添加新的事件监听器
    chart.value.on('mousemove', 'series', function(params) {
      chart.value.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex: params.dataIndex
      });
    });
    
    chart.value.on('globalout', function() {
      chart.value.dispatchAction({
        type: 'hideTip'
      });
    });
    
    console.log('Chart updated successfully');
  } catch (error) {
    console.error('Failed to update chart:', error);
  }
};

// 监听数据变化
watch(() => data.value, () => {
  nextTick(() => {
    if (chart.value) {
      updateChart();
    }
  });
}, { deep: true });

onUnmounted(() => {
  if (chart.value) {
    chart.value.dispose();
    chart.value = null;
  }
  window.removeEventListener('resize', handleResize);
});
</script>