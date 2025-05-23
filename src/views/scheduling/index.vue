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
import { getSchedulingData } from '@/api/scheduling';
import { getResourceData, manualExecuteSqlWrite } from '@/api/resource';
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
    manualExecuteSqlWrite();
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
            '0': 0,
            '-1': 1,
            '1': 2
          };

          results.sort((a, b) => {
            const statusA = String(a.status);
            const statusB = String(b.status);
            if (statusPriority[statusA] !== statusPriority[statusB]) {
              return statusPriority[statusA] - statusPriority[statusB];
            }
            const endTimeA = new Date(a.end_time);
            const endTimeB = new Date(b.end_time);
            return endTimeB - endTimeA;
          });

          this.schedulingResults = results;
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
