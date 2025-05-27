// 后端API基础URL
const BASE_URL = 'http://127.0.0.1:8765';

// 获取实时空气质量数据
export async function fetchAirQualityData() {
  try {
    const response = await fetch(`${BASE_URL}/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        page: 1,
        size: 10
      })
    });
    
    const result = await response.json();
    console.log('get接口调用', result);

    if (result.status === 0 && result.data?.rows?.length > 0) {
      const latestData = result.data.rows[0];
      return {
        timestamp: latestData.time_point * 1000, // 转换为毫秒
        aqi: latestData.AQI,
        pm25: latestData.PM2_5,
        pm10: latestData.PM10,
        so2: latestData.SO2,
        no2: latestData.NO2,
        o3: latestData.O3,
        co: latestData.CO,
        hpa: parseFloat(latestData.hap || '1013'),
        quality: latestData.Quality,
        measure: latestData.measure,
        primarypollutant: latestData.primarypollutant,
        unheathful: latestData.unheathful
      };
    }
    throw new Error('No data available');
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    throw error;
  }
}

// 获取24小时AQI趋势数据
export async function fetchAQITrend() {
  try {
    const response = await fetch(`${BASE_URL}/aqi_trend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        page: 1
      })
    });
    
    const result = await response.json();
    console.log('AQI trend response:', result); // 添加日志查看返回数据
    
    if (result.status === 0 && result.data?.rows?.length > 0) {
      // 返回排序后的数据，确保时间顺序正确
      return result.data.rows
        .sort((a, b) => a.time_point - b.time_point)
        .map(item => ({
          timestamp: item.time_point * 1000,
          aqi: item.AQI,
          timeStr: item.time_point_str
        }));
    }
    throw new Error('No trend data available');
  } catch (error) {
    console.error('Error fetching AQI trend:', error);
    throw error;
  }
}

// // 获取历史数据（暂时保留模拟数据，后续替换为真实接口）
// export async function fetchHistoricalData(indicator = 'pm25', timeframe = 'daily') {
//   // 模拟API请求延迟
//   await new Promise((resolve) => setTimeout(resolve, 800));

//   const now = new Date();
//   const data = [];
//   const days = timeframe === 'hourly' ? 1 : 30;
//   const pointsPerDay = timeframe === 'hourly' ? 24 : 1;
//   const totalPoints = days * pointsPerDay;
  
//   const baseValues = {
//     aqi: { base: 65, variation: 15 },
//     pm25: { base: 45, variation: 20 },
//     pm10: { base: 70, variation: 25 },
//     so2: { base: 15, variation: 8 },
//     no2: { base: 40, variation: 15 },
//     o3: { base: 85, variation: 30 },
//     co: { base: 0.9, variation: 0.4 },
//     hpa: { base: 1013, variation: 5 }
//   };

//   for (let i = totalPoints - 1; i >= 0; i--) {
//     const timestamp = new Date();
//     if (timeframe === 'hourly') {
//       timestamp.setHours(timestamp.getHours() - i);
//     } else {
//       timestamp.setDate(timestamp.getDate() - i);
//     }
    
//     const timeWave = Math.sin(i / 8) * baseValues[indicator].variation;
//     const randomWave = (Math.random() - 0.5) * baseValues[indicator].variation;
//     const isPeakTime = i === Math.floor(totalPoints * 0.7) || 
//                       i === Math.floor(totalPoints * 0.71) || 
//                       i === Math.floor(totalPoints * 0.72);
//     const peakFactor = isPeakTime ? 1.5 : 1;
    
//     let value = baseValues[indicator].base + timeWave + randomWave;
//     value = value * peakFactor;
    
//     if (indicator === 'co') {
//       value = Math.max(0.4, Math.min(2.0, Number(value.toFixed(1))));
//     } else if (indicator === 'hpa') {
//       value = Math.max(1000, Math.min(1025, Number(value.toFixed(1))));
//     } else {
//       value = Math.max(10, Math.min(300, Math.round(value)));
//     }

//     data.push({
//       date: timestamp.toISOString(),
//       [indicator]: value
//     });
//   }

//   return data;
// }

// 获取预测数据
export async function fetchPredictionData() {

  try {
    const response = await fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    console.log('预测数据响应:', result); // 添加日志查看返回数据

    if (result.status === 0 && result.data) {
      return result.data; // 假设返回的数据结构符合要求
    }
    throw new Error('No prediction data available');
  } catch (error) {
    console.error('Error fetching prediction data:', error);
    throw error;
  }



}

// 获取24小时历史数据
export async function fetchHistoricalMetricData(metric = 'aqi') {
  try {
    const response = await fetch(`${BASE_URL}/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        page: 1,
        size: 24  // 获取24小时的数据
      })
    });
    
    const result = await response.json();
    console.log('Historical metric data response:', result);
    
    if (result.status === 0 && result.data?.rows?.length > 0) {
      // 返回排序后的数据，确保时间顺序正确
      return result.data.rows
        .sort((a, b) => a.time_point - b.time_point)
        .map(item => {
          const value = metric.toUpperCase() === 'AQI' ? item.AQI : 
                       metric.toUpperCase() === 'PM25' ? item.PM2_5 :
                       metric.toUpperCase() === 'PM10' ? item.PM10 :
                       metric.toUpperCase() === 'SO2' ? item.SO2 :
                       metric.toUpperCase() === 'NO2' ? item.NO2 :
                       metric.toUpperCase() === 'O3' ? item.O3 :
                       metric.toUpperCase() === 'CO' ? item.CO :
                       parseFloat(item.hap || '1013');
          
          return {
            timestamp: item.time_point * 1000,
            timeStr: item.time_point_str,
            [metric]: value
          };
        });
    }
    throw new Error('No historical data available');
  } catch (error) {
    console.error('Error fetching historical metric data:', error);
    throw error;
  }
}

export const fetchSpiderData = async () => {
  const response = await fetch(`${BASE_URL}/spider`, { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to fetch spider data');
  }
  const result = await response.json();
  console.log('Spider调用成功', result);
  return null; // 如果需要处理返回的数据，可以在这里进行
};