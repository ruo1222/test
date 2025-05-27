<template>
  <div class="min-h-screen" style="background-color: rgb(232, 236, 235);">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <header class="mb-10 bg-gradient-to-r from-blue-600 to-cyan-500 p-6 rounded-xl shadow-lg text-white">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 class="text-3xl font-bold flex items-center">
              <CloudSun class="h-8 w-8 mr-3 text-yellow-300" />
              惠州市实时空气质量平台
            </h1>
            <div class="flex items-center mt-2 text-blue-100">
              <MapPin class="h-4 w-4 mr-1" />
              <span>广东省惠州市</span>
              <span v-if="lastUpdated" class="ml-4">
                最后更新: {{ formatDate(lastUpdated) }} {{ formatTime(lastUpdated) }}
              </span>
            </div>
          </div>
          <div class="flex gap-2">
            <button 
              @click="spider" 
              :disabled="isLoading"
              class="mt-4 md:mt-0 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md flex items-center"
            >
              <RefreshCw :class="['h-4 w-4 mr-2', isLoading ? 'animate-spin' : '']" />
              {{ isLoading ? "更新中..." : "更新数据" }}
            </button>
            <button 
              @click="handlePredictionClick" 
              class="mt-4 md:mt-0 bg-white text-blue-700 border border-green-200 hover:shadow-lg hover:shadow-green-100 px-4 py-2 rounded-md flex items-center transition-all duration-300"
            >
              <TrendingUp class="h-4 w-4 mr-2 text-green-500" />
              预测
            </button>
          </div>
        </div>
      </header>

      <div v-if="currentData" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="overflow-hidden h-full shadow-md border-0 rounded-lg">
          <div class="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 h-full flex flex-col justify-center">
            <div class="text-center">
              <h2 class="text-lg font-medium text-gray-700 mb-2 flex items-center justify-center">
                <Wind class="h-5 w-5 mr-2 text-blue-500" />
                当前空气质量指数
              </h2>
              <div class="text-7xl font-bold text-amber-500 mb-2 drop-shadow-sm">{{ currentData.aqi }}</div>
              <div class="inline-block px-3 py-1 rounded-full bg-amber-500 text-white font-medium shadow-sm">
                {{ aqiLevel.level }}
              </div>
              <div v-if="lastUpdated" class="text-sm text-gray-500 mt-4">
                更新时间: {{ formatDate(lastUpdated) }} {{ formatTime(lastUpdated) }}
              </div>
            </div>
          </div>
        </div>

        <div class="md:col-span-2">
          <div class="h-full shadow-md border-0 rounded-lg">
            <div class="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 border-b">
              <h3 class="font-medium text-lg flex items-center">
                <AlertTriangle class="h-5 w-5 mr-2 text-amber-500" />
                空气质量评价
              </h3>
            </div>
            <div class="p-6">
              <p class="text-gray-700 mb-4">
                空气质量良好，可能对极少数敏感人群健康有较弱影响，除少数对某些污染物特别敏感的人群外，其他人群可以正常进行室外活动。
              </p>
              <div class="mb-4">
                <div class="flex items-center mb-2">
                  <span class="font-medium mr-2">主要污染物:</span>
                  <span class="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">PM2.5</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    class="bg-gradient-to-r from-green-500 via-amber-500 to-red-500 h-2.5 rounded-full"
                    :style="{ width: `${(currentData.pm25 / 500) * 100}%` }"
                  ></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>100</span>
                  <span>200</span>
                  <span>300</span>
                  <span>500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-10">
        <AirQualityIndicators :data="currentData || defaultData" />
      </div>

      <div class="mb-10">
        <div class="grid grid-cols-2 mb-4 bg-white shadow-sm rounded-lg">
          <button 
            @click="activeTab = 'current'" 
            :class="[
              'py-2 px-4 text-center', 
              activeTab === 'current' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            ]"
          >
            <Clock class="h-4 w-4 inline mr-2" />
            24小时趋势
          </button>
          <button 
            @click="activeTab = 'prediction'" 
            :class="[
              'py-2 px-4 text-center', 
              activeTab === 'prediction' ? 'bg-green-100 text-green-700' : 'text-gray-600'
            ]"
          >
            <TrendingUp class="h-4 w-4 inline mr-2" />
            未来预测
          </button>
        </div>

        <div v-if="activeTab === 'current'" class="mt-0">
          <div class="shadow-md border-0 rounded-lg">
            <div class="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 border-b">
              <h3 class="font-medium text-lg flex items-center">
                <Clock class="h-5 w-5 mr-2 text-blue-500" />
                24小时AQI趋势
              </h3>
              <p class="text-sm text-gray-600">过去24小时空气质量指数变化</p>
            </div>
            <div class="p-6">
              <AirQualityChart v-if="historicalData.length > 0" :data="historicalData" />
              <div v-else class="flex justify-center items-center h-64">
                <p class="text-gray-500">加载中...</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'prediction'" class="mt-0" id="prediction-section">
          <AirQualityPrediction v-if="predictionData.length > 0" :data="predictionData" />
          <div v-else class="flex justify-center items-center h-64">
            <p class="text-gray-500">加载中...</p>
          </div>
        </div>
      </div>

      <!-- <div class="mb-10">
        <HistoricalData />
      </div> -->

      <div class="mb-10">
        <AirQualityKnowledge />
      </div>

      <div class="mb-10 border-l-4 border-amber-500 shadow-md bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
        <div class="pt-6 p-4">
          <div class="flex items-start">
            <AlertTriangle class="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <h3 class="font-medium text-gray-900">健康提示</h3>
              <p class="text-gray-600 mt-1">
                <template v-if="currentData && currentData.aqi <= 50">
                  空气质量优，适合所有人群户外活动。
                </template>
                <template v-else-if="currentData && currentData.aqi > 50 && currentData.aqi <= 100">
                  空气质量良好，极少数敏感人群应减少户外活动。
                </template>
                <template v-else-if="currentData && currentData.aqi > 100 && currentData.aqi <= 150">
                  轻度污染，儿童、老人及呼吸道疾病患者应减少长时间户外活动。
                </template>
                <template v-else-if="currentData && currentData.aqi > 150 && currentData.aqi <= 200">
                  中度污染，儿童、老人及心脏病、肺病患者应避免长时间户外活动。
                </template>
                <template v-else-if="currentData && currentData.aqi > 200">
                  重度污染，儿童、老人和病人应停留在室内，避免体力消耗，一般人群应避免户外活动。
                </template>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer class="text-center text-gray-500 text-sm mt-16 p-6 bg-white rounded-lg shadow-sm">
        <div class="flex justify-center items-center mb-2">
          <CloudSun class="h-5 w-5 text-blue-400 mr-2" />
          <p>数据来源: 惠州市生态环境局 | 更新频率: 每小时</p>
        </div>
        <p class="mt-1">© 2025 惠州市空气质量监测中心</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { 
  CloudSun, 
  MapPin, 
  RefreshCw,
  Wind,
  AlertTriangle,
  Clock,
  TrendingUp
} from 'lucide-vue-next';
import AirQualityIndicators from './AirQualityIndicators.vue';
import AirQualityChart from './AirQualityChart.vue';
import AirQualityPrediction from './AirQualityPrediction.vue';
// import HistoricalData from './HistoricalData.vue';
import AirQualityKnowledge from './AirQualityKnowledge.vue';
import { fetchAirQualityData, fetchPredictionData, fetchAQITrend, fetchSpiderData } from '../lib/api';

const currentData = ref(null);
const historicalData = ref([]);
const predictionData = ref([]);
const isLoading = ref(true);
const lastUpdated = ref(null);
const activeTab = ref('current');

const defaultData = {
  timestamp: new Date().toISOString(),
  aqi: 72,
  pm25: 52,
  pm10: 78,
  so2: 12,
  no2: 38,
  o3: 86,
  co: 0.8,
  hpa: 1013.2,
};

const aqiLevel = computed(() => {
  if (!currentData.value) return { level: "加载中", color: "text-gray-500", bgColor: "bg-gray-100" };
  
  const aqi = currentData.value.aqi;
  if (aqi <= 50) return { level: "优", color: "text-green-500", bgColor: "bg-green-100" };
  if (aqi <= 100) return { level: "良", color: "text-amber-500", bgColor: "bg-blue-50" };
  if (aqi <= 150) return { level: "轻度污染", color: "text-orange-500", bgColor: "bg-orange-100" };
  if (aqi <= 200) return { level: "中度污染", color: "text-red-500", bgColor: "bg-red-100" };
  if (aqi <= 300) return { level: "重度污染", color: "text-purple-500", bgColor: "bg-purple-100" };
  return { level: "严重污染", color: "text-purple-900", bgColor: "bg-purple-200" };
});

onMounted(() => {
  loadData();
});

const loadData = async () => {
  isLoading.value = true;
  try {
    // 获取当前数据
    const current = await fetchAirQualityData();
    // 获取24小时趋势数据
    const trend = await fetchAQITrend();
    console.log('aaaaa', trend);
    // 获取预测数据
    const predictionResponse = await fetchPredictionData();

    currentData.value = current;
    historicalData.value = trend;
    
    if (Array.isArray(predictionResponse)) {
  predictionData.value = predictionResponse;
} else if (predictionResponse && predictionResponse.data && Array.isArray(predictionResponse.data)) {
  predictionData.value = predictionResponse.data;
} else {
  predictionData.value = [];
  console.warn('Prediction data is not in the expected format:', predictionResponse);
}
    lastUpdated.value = new Date();
    console.log('24小时的数据(调用aqi_trend拿到的):', trend);
  } catch (error) {
    console.error("Failed to load data:", error);
    // 确保在错误情况下也初始化数据
    predictionData.value = [];
  } finally {
    isLoading.value = false;
  }
};

const spider = async () => {
  isLoading.value = true;
  try {
    // 调用爬虫接口
    await fetchSpiderData();

    // 获取当前数据
    const current = await fetchAirQualityData();
    // 获取24小时趋势数据
    const trend = await fetchAQITrend();
    // 获取预测数据
    const predictionResponse = await fetchPredictionData();

    currentData.value = current;
    historicalData.value = trend;
    
    if (Array.isArray(predictionResponse)) {
  predictionData.value = predictionResponse;
} else if (predictionResponse && predictionResponse.data && Array.isArray(predictionResponse.data)) {
  predictionData.value = predictionResponse.data;
} else {
  predictionData.value = [];
  console.warn('Prediction data is not in the expected format:', predictionResponse);
}

    lastUpdated.value = new Date();

    console.log('Historical data loaded:', trend);
  } catch (error) {
    console.error("Failed to load data:", error);
    // 确保在错误情况下也初始化数据
    predictionData.value = [];
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (date) => {
  return date.toLocaleDateString();
};

const formatTime = (date) => {
  return date.toLocaleTimeString();
};

// 单独写一个只请求预测的函数
const loadPredictionData = async () => {
  try {
    const predictionResponse = await fetchPredictionData();
    predictionData.value = Array.isArray(predictionResponse) ? predictionResponse : [];
    console.log('预测数据:', predictionData.value);
  } catch (error) {
    predictionData.value = [];
    console.error('Failed to load prediction data:', error);
  }
};

const handlePredictionClick = () => {
  activeTab.value = 'prediction';
  loadPredictionData();
  // 添加滚动功能
  setTimeout(() => {
    const predictionSection = document.getElementById('prediction-section');
    if (predictionSection) {
      predictionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};

// 监听 tab 切换
watch(activeTab, (newVal) => {
  if (newVal === 'prediction') {
    loadPredictionData();
  }
});
</script>