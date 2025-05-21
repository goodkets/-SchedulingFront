<template>
  <div class="scheduling-module">
    <h2 class="module-title">排产结果</h2>
    <el-table :data="schedulingResults" style="width: 100%" stripe border>
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
    <Pagination :total="total" :page="currentPage" :limit="pageSize" @pagination="handlePagination" />
  </div>
</template>

<script>
import { getSchedulingData } from '@/api/scheduling';
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
    };
  },
  created() {
    this.fetchSchedulingData();
  },
  methods: {
    // 处理分页事件
    handlePagination({ page, limit }) {
      this.currentPage = page
      this.pageSize = limit
      this.fetchSchedulingData()
    },
    async fetchSchedulingData() {
      try {
        const response = await getSchedulingData({ page: this.currentPage, pageSize: this.pageSize });
        if(response.status === 0) {
          this.schedulingResults = response.data.items;
          this.total = response.data.pagination.total
        }
      } catch (error) {
        console.error('获取排产数据失败:', error);
        this.$message.error('获取排产数据失败，请稍后重试');
      }
    },
    // 根据状态返回不同的标签类型
    getStatusType(status) {
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
    // 根据状态返回不同的文本描述
    getStatusText(status) {
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

.module-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.el-table {
  background-color: #fff;
  border-radius: 4px;
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
</style>

<style lang="scss" scoped></style>
