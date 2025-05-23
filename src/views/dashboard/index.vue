<template>
  <div class="dashboard-container">
    <!-- 上方三个模块 -->
    <div class="top-modules">
      <el-card class="module-card module-card--primary">
        <template slot="header">
          <div class="card-header">
            <i class="el-icon-date"></i>
            <span>未交付总订单数</span>
          </div>
        </template>
        <p class="module-data">{{ totalTasks }}</p>
      </el-card>
      <el-card class="module-card module-card--success">
        <template slot="header">
          <div class="card-header">
            <i class="el-icon-check"></i>
            <span>已完成订单</span>
          </div>
        </template>
        <p class="module-data">{{ completedTasks }}</p>
      </el-card>
      <el-card class="module-card module-card--warning">
        <template slot="header">
          <div class="card-header">
            <i class="el-icon-time"></i>
            <span>设备使用</span>
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
            <i class="el-icon-data-analysis"></i>
            <span>设备状态分析</span>
          </div>
        </template>
        <!-- 添加父容器并设置宽度为 100% -->
        <div class="chart-wrapper">
          <LineMarker   :trueCount="trueCount" />
        </div>
      </el-card>
      <el-card class="module-card">
        <template slot="header">
          <div class="card-header">
            <i class="el-icon-s-order"></i>
            <span>订单进度（高优先级的订单）</span>
          </div>
        </template>
        <div v-for="(order, index) in orders" :key="index" class="order-item" @click="handleView(order)">
          <div class="order-name">{{ order.order_no }}</div>
          <div class="body" >
            <el-progress
            :percentage="order.progress"
            :format="formatProgress"
            :stroke-width="14"
            status-color="#409EFF"
            :trueCount="trueCount"
          />
          </div>
        </div>
      </el-card>
         <!--订单模态框 -->
    <el-dialog title="订单详情" :visible.sync="dialogVisible" width="50%" :before-close="handleClose" >
      <el-form :model="orderForm"  label-width="100px">
        <el-form-item label="订单编号" prop="order_no">
          <el-input
          disabled
            v-model="orderForm.order_no"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="产品名称" prop="name">
          <el-input disabled v-model="orderForm.name" trim></el-input>
        </el-form-item>
        <el-form-item label="数量:" prop="quantity">
          <el-input-number v-model="orderForm.quantity" :min="1" disabled></el-input-number>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select disabled v-model="orderForm.type">
            <el-option label="电容" value="电容"></el-option>
            <el-option label="电阻" value="电阻"></el-option>
            <el-option label="继电器" value="继电器"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="交付日期" prop="due_data">
          <el-input
            disabled
            v-model="orderForm.due_data"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select disabled v-model="orderForm.priority">
            <el-option label="高" value="1"></el-option>
            <el-option label="中" value="0"></el-option>
            <el-option label="低" value="-1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select disabled v-model="orderForm.status" placeholder="请选择状态" >
            <el-option label="未交付" value="-1"></el-option>
            <el-option label="已交付" value="1"></el-option>
            <el-option label="生产中" value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-dialog>
    </div>
  </div>
</template>

<script>
import LineMarker from '@/components/Charts/LineMarker.vue';
import {orderProgress} from '@/api/dashboard';

export default {
  components: {
    LineMarker
  },
  data() {
    return {
      totalTasks: 10,
      completedTasks: 4,
      inProgressData: '4/10',
      dialogVisible: false,
      // 模拟订单数据
      orders: [],
      orderForm:{},
      trueCount:0
    };
  },
  created() {
    orderProgress().then(res => {
      this.orders = res.data.list.map(order => ({
      ...order,
      progress: Number(order.progress) // 确保 progress 是数字
    }));
      this.totalTasks = res.data.totalOrders
      this.completedTasks = res.data.deliveredOrders
      this.inProgressData = res.data.inProgressData
      this.trueCount = res.data.trueCount
    });
  },
  methods: {
    formatProgress(percentage) {
      return percentage === 100 ? '完成' : `${percentage}%`;
    },
    handleView(order) {
      console.log('查看订单:', order);
      this.dialogVisible = true;
      this.orderForm = order;
    },
    handleClose(done) {
      this.dialogVisible = false;
    },
  }
};
</script>

<style lang="scss" scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 90px);
  overflow-y: scroll;
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
  height: 250px;
  font-size: 25px;
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

/* 在<style scoped>部分添加或修改以下样式 */

/* 修改底部模块卡片头部样式 */
.bottom-modules .el-card__header {
  padding: 15px 20px; /* 增加上下内边距 */
  height: 50px; /* 设置固定高度 */
  display: flex;
  align-items: center;
}



/* 设备状态分析模块的图标颜色 */
.bottom-modules .module-card:first-child .card-header i {
  color: #409EFF;
}

/* 订单进度模块的图标颜色 */
.bottom-modules .module-card:last-child .card-header i {
  color: #E6A23C; /* 使用警告色 */
}

/* 提高样式优先级，确保已完成任务数显示为绿色 */
.module-card--success .module-data {
  font-size: 60px;
  font-weight: bold;
  margin-top: 40px;
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
  gap: 10px;
  margin-right: 8px;
  font-size: 25px;
 i {
  color: #409EFF; /* 使用主题蓝色 */
 }
}

/* 避免全局覆盖 module-data 颜色 */
.module-data:not(.module-card--success .module-data) {
  font-size: 50px;
  font-weight: bold;
  color: #007bff;
  text-align: center;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
  margin-top: 100px;
}

.order-item {
  margin-bottom: 20px; /* 增大订单之间的间距 */
  margin-top: 30px;
  transition: all 0.3s ease; /* 添加过渡效果 */
  padding: 10px;
  border-radius: 4px;
  margin:30px 20px 20px 20px;
}

.order-item:hover {
  transform: scale(1.05); /* 鼠标悬停时放大 */
  background-color: rgba(64, 158, 255, 0.05); /* 添加轻微背景色 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
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
