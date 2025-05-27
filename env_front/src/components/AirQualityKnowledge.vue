<template>
  <div class="mt-12">
    <h2 class="text-2xl font-bold text-gray-800 mb-8 px-1">深入了解关于惠州的空气污染情况</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(card, index) in knowledgeCards"
        :key="index"
        class="transform transition-all duration-300 h-full"
        :style="{ 
          animationDelay: `${index * 100}ms`,
          opacity: 0,
          transform: 'translateY(20px)'
        }"
        :class="['animate-fade-in-up']"
      >
        <div 
          class="flex flex-col h-full overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group rounded-xl bg-white shadow-sm"
          @click="handleCardClick(card.link)"
        >
          <div class="relative h-48 overflow-hidden">
            <div class="absolute inset-0 bg-gray-900/20 z-10 group-hover:bg-gray-900/30 transition-colors duration-300"></div>
            <div class="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent z-10"></div>
            <img
              :src="card.image || '/placeholder.svg'"
              :alt="card.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div class="absolute bottom-4 left-4 right-4 z-20">
              <div class="flex items-center">
                <div 
                  :class="`p-2.5 rounded-full bg-gradient-to-r ${card.color} mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300`"
                >
                  <component :is="card.icon" class="h-6 w-6 text-white" />
                </div>
                <h3 class="text-white font-bold text-lg leading-tight">{{ card.title }}</h3>
              </div>
            </div>
          </div>
          <div class="flex flex-col flex-grow p-5">
            <p class="text-gray-600 text-sm leading-relaxed flex-grow">{{ card.description }}</p>
            <div class="pt-4 mt-auto">
              <div class="inline-flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                了解更多
                <ArrowUpRight class="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  ArrowUpRight, 
  BookOpen, 
  Shield, 
  TreesIcon as Lungs, 
  Wind, 
  AlertTriangle, 
  Users 
} from 'lucide-vue-next';

// 处理卡片点击事件
const handleCardClick = (url) => {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

const knowledgeCards = [
  {
    title: "空气质量指数(AQI)解读",
    description: "了解AQI各级别的含义及对健康的影响，掌握空气质量评价标准。",
    icon: BookOpen,
    image: "/image/air-quality-index.png",
    color: "from-blue-500 to-cyan-500",
    link: "https://www.iqair.cn/cn/newsroom/what-is-aqi",
  },
  {
    title: "空气污染物对健康的影响",
    description: "PM2.5、臭氧等污染物如何影响呼吸系统和心血管系统健康。",
    icon: Lungs,
    image: "/image/health-effects.png",
    color: "from-red-500 to-orange-500",
    link: "https://www.who.int/zh/news-room/spotlight/how-air-pollution-is-destroying-our-health",
  },
  {
    title: "空气污染天气防护指南",
    description: "重污染天气如何做好个人防护，减少污染物对健康的危害。",
    icon: Shield,
    image: "/image/protection-guide.png",
    color: "from-green-500 to-emerald-500",
    link: "http://www.nhc.gov.cn/jkj/s7934td/201912/63275bbd448543a599e3b1b5a7d2f32e.shtml",
  },
  {
    title: "惠州市空气污染源分析",
    description: "了解惠州市主要污染物来源及分布，工业、交通和自然因素的影响。",
    icon: Wind,
    image: "/image/pollution-source.png",
    color: "from-amber-500 to-yellow-500",
    link: "http://www.cjee.ac.cn/data/article/app-reference/647482f4c59bc3243d453b93",
  },
  {
    title: "空气污染与气候变化",
    description: "空气污染与全球气候变化的关系，以及对生态环境的长期影响。",
    icon: AlertTriangle,
    image: "/image/air-quality-monitoring.png",
    color: "from-purple-500 to-indigo-500",
    link: "https://www.unep.org/zh-hans/xinwenyuziyuan/gushi/kongqiwuranyuqihoubianhuayingbideliangmian"
,
  },
  {
    title: "社区空气质量改善行动",
    description: "公民如何参与社区空气质量监测和改善，共建清洁健康环境。",
    icon: Users,
    image: "/image/air-purifier.png",
    color: "from-teal-500 to-cyan-500",
    link: "https://www.gov.cn/zhengce/content/202312/content_6919000.html",
  },
];
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease forwards;
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