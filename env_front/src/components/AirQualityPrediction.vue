<template>
  <div class="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-xl shadow-sm">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 flex items-center">
          <Droplets class="h-6 w-6 mr-2 text-blue-500" />
          空气质量预测
        </h2>
        <p class="text-sm text-gray-600 mt-1">基于历史数据和气象条件的未来24小时预测</p>
      </div>
      <select 
        v-model="selectedIndicator" 
        class="mt-4 md:mt-0 w-[140px] bg-white border border-gray-300 rounded-md px-3 py-2"
      >
        <option v-for="indicator in indicators" :key="indicator.id" :value="indicator.id">
          {{ indicator.name }}
        </option>
      </select>
    </div>

    <div class="h-[300px] mb-8 bg-white p-4 rounded-lg border shadow-sm">
      <div ref="chartContainer" class="w-full h-full"></div>
    </div>

    <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
      <Clock class="h-5 w-5 mr-2 text-blue-500" />
      未来时段空气质量详情
    </h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      <div
        v-for="(item, index) in cardTimePoints"
        :key="index"
        class="transform transition-all duration-300"
        :style="{ 
          animationDelay: `${index * 100}ms`,
          opacity: 0,
          transform: 'translateY(20px)'
        }"
        :class="['animate-fade-in-up']"
      >
        <div
          class="overflow-hidden hover:shadow-md transition-shadow duration-300 rounded-lg border"
          :style="{ borderColor: getAirQualityLevel(item.AQI).color }"
        >
          <div
            class="p-3 text-center border-b-2"
            :style="{ 
              borderColor: getAirQualityLevel(item.AQI).color, 
              backgroundColor: getAirQualityLevel(item.AQI).bgColor 
            }"
          >
            <div class="flex justify-between items-center mb-1">
              <p class="text-sm font-medium">
                {{ new Date(item.timestamp).getMonth() + 1 }}月{{ new Date(item.timestamp).getDate() }}日
              </p>
              <component :is="getWeatherIcon(item.timestamp)" class="h-5 w-5" />
            </div>
            <p class="text-xs text-gray-600">
              {{ new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }}
            </p>
          </div>
          <div class="p-3">
            <div class="flex justify-center items-center mb-3">
              <div class="text-4xl font-bold" :style="{ color: getAirQualityLevel(item.AQI).color }">
                {{ Math.round(item.AQI) }}
              </div>
              <div
                class="text-sm font-medium px-2 py-1 rounded-full ml-2 text-white"
                :style="{ backgroundColor: getAirQualityLevel(item.AQI).color }"
              >
                {{ item.Quality }}
              </div>
            </div>

            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-700">
                  PM2.5:<span class="font-medium">{{ Math.round(item.PM2_5) }}</span>
                </span>
                <span class="text-gray-700">
                  PM10:<span class="font-medium">{{ Math.round(item.PM10) }}</span>
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-700">
                  SO₂:<span class="font-medium">{{ Math.round(item.SO2) }}</span>
                </span>
                <span class="text-gray-700">
                  NO₂:<span class="font-medium">{{ Math.round(item.NO2) }}</span>
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-700">
                  O₃:<span class="font-medium">{{ Math.round(item.O3) }}</span>
                </span>
                <span class="text-gray-700">
                  CO:<span class="font-medium">{{ item.CO.toFixed(2) }}</span>
                </span>
              </div>
              <div class="text-xs text-gray-600 mt-2 text-center">
                {{ item.measure }}
              </div>
              <div class="text-xs text-gray-500 mt-1 text-center italic">
                {{ item.unhealthful }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets, 
  CloudFog, 
  Clock 
} from 'lucide-vue-next';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  MarkLineComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LineChart,
  CanvasRenderer,
  MarkLineComponent,
]);

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
});

const chartContainer = ref(null);
const chart = ref(null);
const selectedIndicator = ref('AQI');

const indicators = [
  { id: "AQI", name: "AQI", color: "#10b981", unit: "", gradient: ["#10b981", "#a7f3d0"] },
  { id: "PM2_5", name: "PM2.5", color: "#f59e0b", unit: "μg/m³", gradient: ["#f59e0b", "#fcd34d"] },
  { id: "PM10", name: "PM10", color: "#f97316", unit: "μg/m³", gradient: ["#f97316", "#fed7aa"] },
  { id: "SO2", name: "SO₂", color: "#06b6d4", unit: "μg/m³", gradient: ["#06b6d4", "#a5f3fc"] },
  { id: "NO2", name: "NO₂", color: "#8b5cf6", unit: "μg/m³", gradient: ["#8b5cf6", "#ddd6fe"] },
  { id: "O3", name: "O₃", color: "#3b82f6", unit: "μg/m³", gradient: ["#3b82f6", "#bfdbfe"] },
  { id: "CO", name: "CO", color: "#ec4899", unit: "mg/m³", gradient: ["#ec4899", "#fbcfe8"] },
];

const selectedIndicatorInfo = computed(() => {
  return indicators.find(i => i.id === selectedIndicator.value) || indicators[0];
});

const chartData = computed(() => {
  if (!props.data || !Array.isArray(props.data)) {
    console.warn('Invalid prediction data format:', props.data);
    return [];
  }

  // 确保数据按时间顺序排序
  const sortedData = [...props.data].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return sortedData.map((item, index) => {
    const timestamp = new Date(Date.now() + index * 3600000);
    return {
      ...item,
      timestamp: timestamp.toISOString(),
      time: timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: timestamp.toLocaleDateString([], { month: "numeric", day: "numeric" }),
      formattedTime: `${timestamp.getMonth() + 1}月${timestamp.getDate()}日 ${timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    };
  });
});

// 选择6个均匀分布的时间点用于预测卡片展示
const cardTimePoints = computed(() => {
  if (!chartData.value || chartData.value.length === 0) {
    return [];
  }
  return chartData.value.filter((_, index) => index % 4 === 0).slice(0, 6);
});

const getAirQualityLevel = (aqi) => {
  if (!aqi || isNaN(aqi)) {
    return { level: "未知", color: "#9CA3AF", bgColor: "#F3F4F6" };
  }
  if (aqi <= 50) return { level: "优", color: "#10b981", bgColor: "#d1fae5" };
  if (aqi <= 100) return { level: "良", color: "#f59e0b", bgColor: "#fef3c7" };
  if (aqi <= 150) return { level: "轻度污染", color: "#f97316", bgColor: "#ffedd5" };
  if (aqi <= 200) return { level: "中度污染", color: "#ef4444", bgColor: "#fee2e2" };
  if (aqi <= 300) return { level: "重度污染", color: "#8b5cf6", bgColor: "#ede9fe" };
  return { level: "严重污染", color: "#7c3aed", bgColor: "#ddd6fe" };
};

// 根据时间获取天气图标（模拟）
const getWeatherIcon = (timestamp) => {
  const hour = new Date(timestamp).getHours();
  if (hour >= 6 && hour < 10) return Sun;
  if (hour >= 10 && hour < 16) return Cloud;
  if (hour >= 16 && hour < 19) return CloudRain;
  if (hour >= 19 && hour < 22) return Wind;
  return CloudFog;
};

const initChart = () => {
  if (chartContainer.value) {
    chart.value = echarts.init(chartContainer.value);
    updateChart();
  }
};

const updateChart = () => {
  if (!chart.value || !chartData.value || chartData.value.length === 0) return;

  const data = chartData.value;
  const currentMetric = selectedIndicatorInfo.value;
  
  const option = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: '#374151',
        fontSize: 12
      },
      formatter: function(params) {
        const value = params.value;
        const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
        return [
          `<div style="margin-bottom: 4px;">${params.name}</div>`,
          `<div style="display: flex; align-items: center;">`,
          `<span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${params.color}; margin-right: 6px;"></span>`,
          `<span>${currentMetric.name}: <span style="font-weight: 600;">${formattedValue}</span>${currentMetric.unit}</span>`,
          `</div>`
        ].join('');
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => item.formattedTime),
      axisLine: { 
        show: true,
        lineStyle: { 
          color: '#E5E7EB',
          width: 1
        } 
      },
      axisTick: {
        show: true,
        alignWithLabel: true,
        length: 4,
        lineStyle: {
          color: '#E5E7EB'
        }
      },
      axisLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        interval: 'auto',
        hideOverlap: true
      }
    },
    yAxis: {
      type: 'value',
      splitNumber: 4,
      axisLine: { 
        show: true,
        lineStyle: { 
          color: '#E5E7EB',
          width: 1
        } 
      },
      axisTick: {
        show: true,
        length: 4,
        lineStyle: {
          color: '#E5E7EB'
        }
      },
      axisLabel: {
        fontSize: 11,
        color: '#9CA3AF'
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#F3F4F6',
          width: 1
        }
      }
    },
    series: [
      {
        name: currentMetric.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: true,
        sampling: 'average',
        itemStyle: {
          color: currentMetric.color,
          borderWidth: 2,
          borderColor: '#fff'
        },
        emphasis: {
          scale: true,
          focus: 'series',
          itemStyle: {
            symbolSize: 8,
            borderWidth: 2
          }
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { 
                offset: 0, 
                color: currentMetric.gradient[0] + '20'
              },
              { 
                offset: 1, 
                color: currentMetric.gradient[1] + '05'
              }
            ]
          }
        },
        data: data.map(item => {
          const value = item[selectedIndicator.value];
          return typeof value === 'number' ? Number(value.toFixed(2)) : value;
        })
      }
    ]
  };

  // 添加AQI参考线
  if (selectedIndicator.value === 'AQI') {
    option.markLine = {
      symbol: 'none',
      lineStyle: { type: 'dashed' },
      data: [
        {
          yAxis: 50,
          lineStyle: { color: '#10b981' },
          label: { formatter: '优', position: 'end', color: '#10b981' }
        },
        {
          yAxis: 100,
          lineStyle: { color: '#f59e0b' },
          label: { formatter: '良', position: 'end', color: '#f59e0b' }
        },
        {
          yAxis: 150,
          lineStyle: { color: '#f97316' },
          label: { formatter: '轻度污染', position: 'end', color: '#f97316' }
        }
      ]
    };
  }

  chart.value.setOption(option);
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', () => {
    chart.value?.resize();
  });
});

watch(() => props.data, updateChart, { deep: true });
watch(() => selectedIndicator.value, updateChart);
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>