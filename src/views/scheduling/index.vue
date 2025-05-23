<template>
  <div class="scheduling-module">
    <div class="filter-container">
      <h2 class="module-title">排产结果</h2>
      <div class="radio-group">
        <el-radio-group v-model="activeFilter" @change="handleFilterChange">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button
            v-for="item in productFilters"
            :key="item.value"
            :label="item.value"
          >
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="table-container">
        <el-button @click="showTestDialog" type="primary" size="medium">测试排产</el-button>
        <el-dialog
      title="测试完成订单时间"
      :visible.sync="testDialogVisible"
      width="30%"
    >
      <div>
        <el-date-picker
          v-model="testEndTime"
          type="date"
          placeholder="选择结束时间"
          value-format="yyyy-MM-dd"
        />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="testDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTestComplete">确定</el-button>
      </span>
    </el-dialog>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="schedulingResults" stripe border>
        <el-table-column align="center" prop="name" label="产品名称" />
        <el-table-column align="center" prop="process" label="工序" />
        <el-table-column align="center" prop="device" label="设备" />
        <el-table-column align="center" prop="start_time" label="计划开始时间" />
        <el-table-column align="center" prop="end_time" label="计划结束时间" />
        <el-table-column align="center" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="light" class="status-tag">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <Pagination
      :total="total"
      :page="currentPage"
      :limit="pageSize"
      @pagination="handlePagination"
    />
  </div>
</template>

<script>
import { getSchedulingData, updateSchedulingData } from '@/api/scheduling';
import { getResourceData, manualExecuteSqlWrite, updateRawMaterialCount, getRawMaterialCount } from '@/api/resource';
import Pagination from '@/components/Pagination'

export default {
  components: {
    Pagination,
  },
  data() {
    return {
      schedulingResults: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      activeFilter: 'all',
      productFilters: [],
      allProducts: [],
      testEndTime: '',
      testDialogVisible: false,
    };
  },
  created() {
    this.fetchProductFilters();
    this.fetchSchedulingData();
    // manualExecuteSqlWrite();
  },
  methods: {
    showTestDialog() {
      this.testEndTime = this.formatDateTime(new Date());
      this.testDialogVisible = true;
    },
    async handleTestComplete() {
      if (!this.testEndTime) {
        this.$message.error('请选择测试完成时间');
        return;
      }
      // 存储时间到本地
      localStorage.setItem('testEndTime', this.testEndTime);
      this.testDialogVisible = false;

      const schedulingUpdates = [];
      const rawMaterialConsumptions = {};

      // 遍历排产数据
      for (const item of this.schedulingResults) {
        // 仅处理正在进行中的排产记录
        if (item.status == 0) {
          const planEndTime = new Date(item.end_time);
          const testTime = new Date(this.testEndTime);

          // 检查这里的条件是否满足
          if (planEndTime <= testTime) {
            // 修改状态为已完成
            item.status = 1;
            // 收集需要更新的排产数据
            schedulingUpdates.push({ id: item.id, status: 1, process: '无', orderNo: item.orderNo });

            // 根据设备排产数据中的 device 去匹配设备中的 name
            const device = this.allProducts.find(product => product.name === item.device);
            if (device) {
              // 计算每种原材料的消耗
              device.rawList.forEach(raw => {
                const consumption = raw.num * item.quantity;
                if (rawMaterialConsumptions[raw.name]) {
                  rawMaterialConsumptions[raw.name] += consumption;
                } else {
                  rawMaterialConsumptions[raw.name] = consumption;
                }
              });
            }
          }
        }
      }

      try {
        // 获取总原材料数据
        const rawMaterialResponse = await getRawMaterialCount();
        const rawMaterialData = rawMaterialResponse.data; // 假设接口返回的数据结构中有 data 字段

        const rawMaterialUpdates = [];
        // 计算剩余原材料数据
        for (const rawMaterial of rawMaterialData) {
          const remaining = rawMaterial.total - (rawMaterialConsumptions[rawMaterial.name] || 0);
          rawMaterialUpdates.push({
            id: rawMaterial.id, // 使用接口返回的 id
            name: rawMaterial.name,
            total: remaining,
            unit: rawMaterial.unit // 使用接口返回的单位
          });
        }
        // 统一发送排产数据更新请求
        if (schedulingUpdates.length > 0) {
          await updateSchedulingData(schedulingUpdates);
        }
        // 统一发送原料数据更新请求
        if (rawMaterialUpdates.length > 0) {
          await updateRawMaterialCount(rawMaterialUpdates);
        }

        // 执行 SQL 写入操作
        manualExecuteSqlWrite();
      } catch (error) {
        console.error('更新排产数据或原料数量失败:', error);
        this.$message.error('更新排产数据或原料数量失败，请稍后重试');
      }

      // 重新获取排产数据
      this.fetchSchedulingData();
    },
        // 格式化日期时间
        formatDateTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    },
    // 获取产品筛选列表
    async fetchProductFilters() {
      try {
        const response = await getResourceData({page: 1, pageSize: 1000});
        if (response.status === 0) {
          this.allProducts = response.data.items;
          this.productFilters = response.data.items.map(item => ({
            value: item.name,
            label: item.name
          }));
        }
      } catch (error) {
        console.error('获取产品列表失败:', error);
        this.$message.error('获取产品列表失败');
      }
    },
    // 处理筛选变化
    handleFilterChange() {
      this.currentPage = 1; // 重置到第一页
      this.fetchSchedulingData();
    },
    // 处理分页事件
    handlePagination({ page, limit }) {
      this.currentPage = page;
      this.pageSize = limit;
      this.fetchSchedulingData();
    },
    async fetchSchedulingData() {
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize
        };

        // 如果不是显示全部，添加产品名称筛选条件
        if (this.activeFilter !== 'all') {
          params.productName = this.activeFilter;
        }

        const response = await getSchedulingData(params);
        if(response.status === 0) {
          let results = response.data.items;

          const statusPriority = {
            '0': 0, // 进行中
            '-1': 1, // 未开始
            '1': 2  // 已完成
          };

          results.sort((a, b) => {
            const statusA = String(a.status);
            const statusB = String(b.status);
            if (statusPriority[statusA] !== statusPriority[statusB]) {
              return statusPriority[statusA] - statusPriority[statusB];
            }
            // 根据计划开始时间降序排列
            const startTimeA = new Date(a.start_time);
            const startTimeB = new Date(b.start_time);
            return startTimeA - startTimeB;
          });

          this.schedulingResults = results;
          console.log('获取到的排产数据:', this.schedulingResults); // 添加日志检查数据
          this.total = response.data.pagination.total;
        }
      } catch (error) {
        console.error('获取排产数据失败:', error);
        this.$message.error('获取排产数据失败，请稍后重试');
      }
    },
    getStatusType(status) {
      status = String(status);
      switch (status) {
        case '-1':
          return 'info';
        case '0':
          return 'warning';
        case '1':
          return 'success';
        default:
          return 'default';
      }
    },
    getStatusText(status) {
      status = String(status);
      switch (status) {
        case '-1':
          return '未开始';
        case '0':
          return '进行中';
        case '1':
          return '已完成';
        default:
          return '未知状态';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.scheduling-module {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.module-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-right: 20px;
}

.radio-group {
  margin: 10px 0;
}

.table-container {
  max-height: 600px;
  overflow: auto;
}

.el-table {
  width: 100%;
}

.el-table__header th {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #303133;
}

.el-table__body td {
  color: #606266;
}

.status-tag {
  padding: 0 8px;
  font-size: 12px;
  border-radius: 4px;
}

.el-tag.info {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.el-tag.warning {
  background-color: #fffbe6;
  border-color: #ffe58f;
  color: #faad14;
}

.el-tag.success {
  background-color: #f6ffed;
  border-color: #b7eb8f;
  color: #52c41a;
}

.el-tag.default {
  background-color: #fafafa;
  border-color: #d9d9d9;
  color: #222;
}

@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .radio-group {
    margin-top: 10px;
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
<mcfile name="index.vue" path="e:\project\Scheduling\-SchedulingFront\src\views\scheduling\index.vue"></mcfile>
