<template>
  <div>
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="m in metrics"
        :key="m.id"
        @click="setMetric(m.id)"
        :class="[
          'px-3 py-1 text-sm rounded-md shadow-sm',
          metric === m.id ? 'text-white' : 'border',
        ]"
        :style="{
          backgroundColor: metric === m.id ? m.color : 'transparent',
          color: metric === m.id ? 'white' : 'inherit',
          borderColor: metric === m.id ? 'transparent' : m.color,
        }"
      >
        {{ m.name }}
      </button>
    </div>

    <div class="relative h-[400px] mt-6 bg-white p-4 rounded-lg">
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
        <p class="text-gray-500">加载中...</p>
      </div>
      <div ref="chartContainer" class="w-full h-full"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from 'vue';
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
import { fetchHistoricalMetricData } from '../lib/api';

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
const metric = ref('aqi');
const isLoading = ref(false);
const chartData = ref([]);

const metrics = [
  { id: "aqi", name: "AQI", color: "#10b981", gradient: ["#10b981", "#d1fae5"], unit: "" },
  { id: "pm25", name: "PM2.5", color: "#3b82f6", gradient: ["#3b82f6", "#bfdbfe"], unit: "μg/m³" },
  { id: "pm10", name: "PM10", color: "#8b5cf6", gradient: ["#8b5cf6", "#ddd6fe"], unit: "μg/m³" },
  { id: "o3", name: "O₃", color: "#f59e0b", gradient: ["#f59e0b", "#fef3c7"], unit: "μg/m³" },
  { id: "no2", name: "NO₂", color: "#ef4444", gradient: ["#ef4444", "#fee2e2"], unit: "μg/m³" },
  { id: "so2", name: "SO₂", color: "#6366f1", gradient: ["#6366f1", "#e0e7ff"], unit: "μg/m³" },
  { id: "co", name: "CO", color: "#ec4899", gradient: ["#ec4899", "#fbcfe8"], unit: "mg/m³" },
  { id: "hpa", name: "气压", color: "#0ea5e9", gradient: ["#0ea5e9", "#bae6fd"], unit: "hPa" },
];

const selectedMetric = computed(() => {
  return metrics.find(m => m.id === metric.value) || metrics[0];
});

const processedData = computed(() => {
  if (metric.value === 'aqi') {
    return props.data;
  }
  return chartData.value;
});

const loadMetricData = async () => {
  isLoading.value = true;
  try {
    const data = await fetchHistoricalMetricData(metric.value);
    chartData.value = data;
    updateChart();
  } catch (error) {
    console.error('Failed to load metric data:', error);
    chartData.value = [];
  } finally {
    isLoading.value = false;
  }
};

const setMetric = async (newMetric) => {
  metric.value = newMetric;
  await loadMetricData();
};

const initChart = () => {
  if (chartContainer.value) {
    chart.value = echarts.init(chartContainer.value);
    loadMetricData();
  }
};

const updateChart = () => {
  if (!chart.value) return;

  const data = processedData.value;
  const currentMetric = selectedMetric.value;
  const thresholdLine = getThresholdLine();
  
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
      position: 'top',
      formatter: function(params) {
        return [
          `<div style="margin-bottom: 4px;">${params.name}</div>`,
          `<div style="display: flex; align-items: center;">`,
          `<span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${params.color}; margin-right: 6px;"></span>`,
          `<span>${currentMetric.name}: <span style="font-weight: 600;">${params.value}</span>${currentMetric.unit}</span>`,
          `</div>`
        ].join('');
      },
      axisPointer: {
        type: 'none'
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
      data: data.map(item => item.timeStr),
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
        data: data.map(item => item[metric.value])
      }
    ],
    markLine: {
      silent: true,
      symbol: 'none',
      lineStyle: {
        color: '#DC2626',
        type: 'dashed',
        width: 1
      },
      data: [
        {
          yAxis: thresholdLine,
          label: {
            formatter: '标准线',
            position: 'insideEndTop',
            fontSize: 12,
            color: '#DC2626',
            padding: [2, 4],
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderRadius: 2
          }
        }
      ]
    }
  };

  chart.value.setOption(option, true);
};

const getThresholdLine = () => {
  switch (metric.value) {
    case "aqi": return 100;
    case "pm25": return 35;
    case "pm10": return 50;
    case "o3": return 100;
    case "no2": return 40;
    case "so2": return 50;
    case "co": return 4;
    case "hpa": return 1013; // 标准大气压
    default: return 100;
  }
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', () => {
    chart.value?.resize();
  });
});

watch(() => props.data, () => {
  if (metric.value === 'aqi') {
    chartData.value = props.data;
    updateChart();
  }
}, { deep: true });

onUnmounted(() => {
  if (chart.value) {
    chart.value.dispose();
  }
  window.removeEventListener('resize', () => {
    chart.value?.resize();
  });
});
</script>