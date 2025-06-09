<template>
  <div class="mt-8">
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      <div
        v-for="(indicator, index) in indicators"
        :key="indicator.name"
        class="transform transition-all duration-300 hover:scale-105"
        :style="{ 
          animationDelay: `${index * 100}ms`,
          opacity: 0,
          transform: 'translateY(20px)'
        }"
        :class="['animate-fade-in-up']"
      >
        <div
          class="border-0 shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full rounded-lg"
        >
          <div
            :class="`bg-gradient-to-r ${indicator.bgGradient} p-3 border-b-2`"
            :style="{
              borderColor: indicator.level === '优' ? '#10b981' : indicator.level === '良' ? '#f59e0b' : '#f97316',
            }"
          >
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-gray-900">{{ indicator.name }}</h3>
              <component :is="indicator.icon" :class="indicator.color" class="h-6 w-6" />
            </div>
            <p class="text-xs text-gray-500">{{ indicator.description }}</p>
          </div>
          <div class="p-3">
            <div class="flex justify-between items-end">
              <div class="text-2xl font-bold">
                {{ indicator.value }}
                <span class="text-sm font-normal text-gray-500 ml-1">{{ indicator.unit }}</span>
              </div>
              <div
                :class="`px-2 py-1 rounded-full text-sm ${
                  indicator.level === '优'
                    ? 'bg-green-500 text-white'
                    : indicator.level === '良'
                      ? 'bg-amber-500 text-white'
                      : 'bg-orange-500 text-white'
                }`"
              >
                {{ indicator.level }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { 
  Wind, 
  Droplets, 
  Sun, 
  Thermometer, 
  Activity, 
  Gauge, 
  BarChart2 
} from 'lucide-vue-next';

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

const indicators = computed(() => [
  {
    name: "PM2.5",
    value: props.data.pm25,
    unit: "μg/m³",
    icon: Droplets,
    description: "细颗粒物",
    color: getColorForValue(props.data.pm25, 35, 75, 115, 150, 250),
    level: getLevelText(props.data.pm25, 35, 75, 115, 150, 250),
    bgGradient: "from-blue-50 to-cyan-50",
  },
  {
    name: "PM10",
    value: props.data.pm10,
    unit: "μg/m³",
    icon: Wind,
    description: "可吸入颗粒物",
    color: getColorForValue(props.data.pm10, 50, 150, 250, 350, 420),
    level: getLevelText(props.data.pm10, 50, 150, 250, 350, 420),
    bgGradient: "from-indigo-50 to-blue-50",
  },
  {
    name: "SO₂",
    value: props.data.so2,
    unit: "μg/m³",
    icon: Gauge,
    description: "二氧化硫",
    color: getColorForValue(props.data.so2, 50, 150, 475, 800, 1600),
    level: getLevelText(props.data.so2, 50, 150, 475, 800, 1600),
    bgGradient: "from-green-50 to-emerald-50",
  },
  {
    name: "NO₂",
    value: props.data.no2,
    unit: "μg/m³",
    icon: Activity,
    description: "二氧化氮",
    color: getColorForValue(props.data.no2, 40, 80, 180, 280, 565),
    level: getLevelText(props.data.no2, 40, 80, 180, 280, 565),
    bgGradient: "from-purple-50 to-indigo-50",
  },
  {
    name: "O₃",
    value: props.data.o3,
    unit: "μg/m³",
    icon: Sun,
    description: "臭氧",
    color: getColorForValue(props.data.o3, 100, 160, 215, 265, 800),
    level: getLevelText(props.data.o3, 100, 160, 215, 265, 800),
    bgGradient: "from-amber-50 to-yellow-50",
  },
  {
    name: "CO",
    value: props.data.co,
    unit: "mg/m³",
    icon: Thermometer,
    description: "一氧化碳",
    color: getColorForValue(props.data.co * 1000, 2000, 4000, 14000, 24000, 36000, true),
    level: getLevelText(props.data.co * 1000, 2000, 4000, 14000, 24000, 36000, true),
    bgGradient: "from-rose-50 to-pink-50",
  },
  {
    name: "气压",
    value: props.data.hpa,
    unit: "hPa",
    icon: BarChart2,
    description: "大气压力",
    color: "text-blue-500",
    level: "正常",
    bgGradient: "from-sky-50 to-blue-50",
  },
]);

function getColorForValue(
  value,
  good,
  moderate,
  unhealthySensitive,
  unhealthy,
  veryUnhealthy,
  isCO = false,
) {
  // CO is in mg/m³, but thresholds are in μg/m³
  const actualValue = isCO ? value / 1000 : value;

  if (actualValue <= good) return "text-green-500";
  if (actualValue <= moderate) return "text-amber-500";
  if (actualValue <= unhealthySensitive) return "text-orange-500";
  if (actualValue <= unhealthy) return "text-red-500";
  if (actualValue <= veryUnhealthy) return "text-purple-500";
  return "text-purple-900";
}

function getLevelText(
  value,
  good,
  moderate,
  unhealthySensitive,
  unhealthy,
  veryUnhealthy,
  isCO = false,
) {
  // CO is in mg/m³, but thresholds are in μg/m³
  const actualValue = isCO ? value / 1000 : value;

  if (actualValue <= good) return "优";
  if (actualValue <= moderate) return "良";
  if (actualValue <= unhealthySensitive) return "轻度污染";
  if (actualValue <= unhealthy) return "中度污染";
  if (actualValue <= veryUnhealthy) return "重度污染";
  return "严重污染";
}
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