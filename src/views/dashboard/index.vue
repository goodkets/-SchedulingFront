<template>
  <div class="dashboard-container">
    <!-- 上方三个模块 -->
    <div class="top-modules">
      <el-card class="module-card module-card--primary">
        <template slot="header">
          <div class="card-header">
            <i class="el-icon-date"></i>
            <span>今日总任务数</span>
          </div>
        </template>
        <p class="module-data">{{ totalTasks }}</p>
      </el-card>
      <el-card class="module-card module-card--success">
        <template slot="header">
          <div class="card-header">
            <i class="el-icon-check"></i>
            <span>已完成任务数</span>
          </div>
        </template>
        <p class="module-data">{{ completedTasks }}</p>
      </el-card>
      <el-card class="module-card module-card--warning">
        <template slot="header">
          <div class="card-header">
            <i class="el-icon-time"></i>
            <span>设备进行中的数据</span>
          </div>
        </template>
        <p class="module-data">{{ inProgressData }}</p>
      </el-card>
    </div>
    <!-- 下方两个模块 -->
    <div class="bottom-modules">
      <el-card class="module-card">
        <template slot="header">
          <div class="card-header">
            <span>设备状态分析</span>
          </div>
        </template>
        <!-- 添加父容器并设置宽度为 100% -->
        <div class="chart-wrapper">
          <LineMarker />
        </div>
      </el-card>
      <el-card class="module-card">
        <template slot="header">
          <div class="card-header">
            <span>订单进度</span>
          </div>
        </template>
        <div v-for="(order, index) in orders" :key="index" class="order-item">
          <div class="order-name">{{ order.name }}</div>
          <el-progress
            :percentage="order.progress"
            :format="formatProgress"
            :stroke-width="18"
            status-color="#409EFF"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import LineMarker from '@/components/Charts/LineMarker.vue';

export default {
  components: {
    LineMarker
  },
  data() {
    return {
      totalTasks: 10,
      completedTasks: 4,
      inProgressData: '4/10',
      // 模拟订单数据
      orders: [
        { name: '订单 1', progress: 40 },
        { name: '订单 2', progress: 60 },
        { name: '订单 3', progress: 80 },
        { name: '订单 4', progress: 30 },
        { name: '订单 5', progress: 70 },
        { name: '订单 6', progress: 50 }
      ]
    };
  },
  methods: {
    formatProgress(percentage) {
      return percentage === 100 ? '完成' : `${percentage}%`;
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  gap: 20px;
}

.top-modules {
  display: flex;
  gap: 20px;
  /* 移除 flex: 1，避免影响高度设置 */
}

.top-modules .module-card {
  flex: 1;
  height: 150px;
  transition: all 0.3s ease;
}

.bottom-modules {
  display: flex;
  gap: 20px;
  flex: 0.6; /* 减小下方模块整体高度占比，可按需调整 */
}

.module-card {
  flex: 1;
  height: 100%; /* 确保卡片填充父容器高度 */
}

.top-modules .module-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.module-card--primary {
  border-top: 4px solid #409EFF;
}

.module-card--success {
  border-top: 4px solid #67C23A;
}

.module-card--warning {
  border-top: 4px solid #E6A23C;
}

.card-header i {
  margin-right: 8px;
  font-size: 18px;
}

/* 提高样式优先级，确保已完成任务数显示为绿色 */
.module-card--success .module-data {
  font-size: 32px;
  font-weight: bold;
  margin-top: 10px;
  color: #67C23A;
  text-align: center;
}

.bottom-modules {
  display: flex;
  gap: 20px;
  flex: 1;
}

.module-card {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 避免全局覆盖 module-data 颜色 */
.module-data:not(.module-card--success .module-data) {
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  text-align: center;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
}

.order-item {
  margin-bottom: 20px; /* 增大订单之间的间距 */
}

.order-name {
  margin-bottom: 10px;
  font-size: 16px;
  color: #606266;
}

.el-progress-bar__outer {
  border-radius: 10px; /* 让进度条边角更圆润 */
}
</style>
