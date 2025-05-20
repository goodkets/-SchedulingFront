<template>
  <div class="device-management">
    <el-card class="main-card">
      <div slot="header" class="card-header">
        <span class="header-title">设备管理</span>
        <!-- <el-button style="float: right; padding: 6px 15px" type="primary" size="small" @click="refreshData">刷新数据</el-button> -->
      </div>

      <el-table
        :data="deviceList"
        border
        stripe
        highlight-current-row
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        :row-style="rowStyle"
        style="width: 100%"
        :loading="loading">

        <el-table-column
          prop="code"
          label="编码"
          min-width="120">
        </el-table-column>

        <el-table-column
          prop="name"
          label="设备名称"
          min-width="150">
        </el-table-column>

        <el-table-column
          prop="type"
          label="类型"
          min-width="150"

          :filter-method="filterType">
          <template slot-scope="scope">
            <el-tag type="warning" effect="dark" size="medium">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="materials"
          label="原材料"
          min-width="180">
          <template slot-scope="scope">
            <el-link type="primary" @click="showMaterialDetail(scope.row)">
              {{ formatMaterials(scope.row.rawList) }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column
          prop="status"
          label="状态"
          min-width="120">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-text="运行"
              inactive-text="停止"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="handleStatusChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column
          prop="workers"
          label="工人"
          min-width="150">
          <template slot-scope="scope">
            <div style="display: flex; align-items: center; justify-content: center;">
              <span style="margin-right: 10px;">{{ scope.row.workerList.length }}人</span>
              <!-- 修改为传入设备对象 -->
              <el-button
                type="primary"
                size="small"
                @click="showWorkerManagement(scope.row)">管理</el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          prop="workerStatus"
          label="工人状态"
          min-width="120">
          <template slot-scope="scope">
            <el-tag :type="getWorkerStatusTag(scope.row)" effect="plain" size="medium">
              {{ getOverallWorkerStatus(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="maintenanceDate"
          label="保养日期"
          min-width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.maintenance }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="output"
          label="产量"
          min-width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.output }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- <Pagination
        :total="total"
        :page="currentPage"
        :limit="pageSize"
        @pagination="handlePagination"
      /> -->

    <!-- 原材料详情弹窗 -->
    <el-dialog
      title="原材料详情"
      :visible.sync="materialDialogVisible"
      width="40%">
      <el-table :data="currentMaterials" border>
        <el-table-column prop="name" label="材料名称" width="180"></el-table-column>
        <el-table-column prop="quantity" label="数量" width="180">
          <template slot-scope="scope" >
            <el-input-number
              v-model="scope.row.num"
              size="mini"
              :min="1"
              @change="saveMaterialChange(scope.row)">
            </el-input-number>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位"></el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="materialDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="saveMaterialChanges">保存修改</el-button>
      </span>
    </el-dialog>

    <!-- 工人管理弹窗 -->
    <el-dialog
      title="工人管理"
      :visible.sync="workerDialogVisible"
      width="50%">
      <el-table :data="currentWorkers" border>
        <el-table-column prop="nameNumber" label="工号" width="100"></el-table-column>
        <el-table-column prop="userName" label="姓名" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.status"
              size="mini"
              :disabled="!currentDevice.status"
              @change="saveWorkerStatus(scope.row)">
              <el-option label="忙碌" value="忙碌"></el-option>
              <el-option label="休息" value="休息"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="job" label="岗位"></el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="danger"
              @click="removeWorker(scope.row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px;">
        <el-button size="mini" type="primary" @click="addWorker">添加工人</el-button>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="workerDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="saveWorkerChanges">保存修改</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getResourceData } from '@/api/resource'
export default {
  name: 'DeviceManagement',
  components: {
    Pagination
  },
  data() {
    return {
      currentPage: 1,
      pageSize: 10,
      total: 0,
      deviceList: [],
      currentDevice: null,
      materialDialogVisible: false,
      workerDialogVisible: false,
      currentMaterials: [],
      currentWorkers: [],
      nextWorkerId: 100,
      headerCellStyle: {
        background: '#f5f7fa',
        color: '#303133',
        fontWeight: 'bold',
        fontSize: '15px',
        height: '60px',
        padding: '0',
        textAlign: 'center'
      },
      cellStyle: {
        padding: '12px 0',
        textAlign: 'center'
      },
      rowStyle: {
        height: '60px'
      }
    }
  },
  created() {
    this.fetchDeviceData();
  },
  methods: {
    async fetchDeviceData() {
      this.loading = true;
      try {
        const response = await getResourceData({
          page: this.currentPage,
          pageSize: this.pageSize
        });
        if (response.status === 0) {
          this.deviceList = response.data.map(device => {
            // 将 status 字符串转换为布尔值
            device.status = device.status === 'true';
            return device;
          });
        } else {
          this.$message.error('获取设备数据失败：' + response.message);
        }
      } catch (error) {
        console.error('获取设备数据失败:', error);
        this.$message.error('获取设备数据失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    },
    refreshData() {
      this.fetchDeviceData();
      this.$message.success('数据已刷新');
    },
    filterType(value, row) {
      return row.type === value;
    },
    formatMaterials(materials) {
      if (!materials || materials.length === 0) return '无原材料';
      const names = materials.map(m => m.name);
      return names.join('、').slice(0, 15) + (names.join('、').length > 15 ? '...' : '');
    },
    showMaterialDetail(row) {
      this.currentDevice = row;
      // 确保使用 rawList
      this.currentMaterials = JSON.parse(JSON.stringify(row.rawList));
      this.materialDialogVisible = true;
    },
    saveMaterialChange(material) {
      console.log('材料数量修改', material);
      // 这里可以添加保存到后端API的逻辑
    },
    saveMaterialChanges() {
      // 确保更新 rawList
      this.currentDevice.rawList = this.currentMaterials;
      this.materialDialogVisible = false;
      this.$message.success('原材料修改已保存');
    },
    getOverallWorkerStatus(row) {
      if (row.workerList.length === 0) return '无人';
      const busyCount = row.workerList.filter(w => w.status == 1).length;
      if (busyCount === row.workerList.length) return '全部忙碌';
      if (busyCount === 0) return '全部休息';
      return `${busyCount}人忙碌`;
    },
    getWorkerStatusTag(row) {
      if (row.workerList.length === 0) return 'info';
      const busyCount = row.workerList.filter(w => w.status == 1).length;
      if (busyCount === row.workerList.length) return 'danger';
      if (busyCount === 0) return 'success';
      return 'warning';
    },
    showWorkerManagement(row) {
      this.currentDevice = row;
      // 修改为使用 workerList 并转换状态值
      this.currentWorkers = JSON.parse(JSON.stringify(row.workerList)).map(worker => {
        if (worker.status == 0) {
          worker.status = '休息';
        } else if (worker.status == 1) {
          worker.status = '忙碌';
        }
        return worker;
      });
      this.workerDialogVisible = true;
    },
    addWorker() {
      this.currentWorkers.push({
        id: 'W' + this.nextWorkerId++,
        name: '新工人',
        status: '休息',
        position: '操作员'
      });
    },
    removeWorker(worker) {
      // 检查是否只剩一名工人，如果是则不允许删除
      if (this.currentWorkers.length <= 1) {
        this.$message.warning('至少需要保留一名工人，不允许全部删除');
        return;
      }

      this.$confirm('确定要移除此工人吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.currentWorkers.findIndex(w => w.id === worker.id);
        if (index !== -1) {
          this.currentWorkers.splice(index, 1);
          this.$message.success('工人已移除');
        }
      });
    },
    saveWorkerChanges() {
      // 在保存时将状态文本转换回数字
      this.currentDevice.workerList = this.currentWorkers.map(worker => {
        if (worker.status === '休息') {
          worker.status = 0;
        } else if (worker.status === '忙碌') {
          worker.status = 1;
        }
        return worker;
      });
      this.workerDialogVisible = false;
      this.$message.success('工人信息已保存');
    },
    // 新增处理状态变更的方法
    handleStatusChange(row) {
      // 如果是从运行变为停止状态，弹出确认框
      if (!row.status) {
        this.$confirm('确定要停止该设备吗？停止后所有工人将被设置为休息状态。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 用户点击确定，执行停止操作
          this.changeStatus(row);
        }).catch(() => {
          // 用户点击取消，恢复开关状态
          row.status = true;
          this.$message.info('已取消停止操作');
        });
      } else {
        // 如果是从停止变为运行状态，直接执行
        this.changeStatus(row);
      }
    },

    changeStatus(row) {
      // 当设备状态变为停止时，将所有工人状态设置为休息
      if (!row.status) { // 状态为false表示停止
        if (row.workers && row.workers.length > 0) {
          // 将所有工人状态设置为休息
          row.workers.forEach(worker => {
            worker.status = '休息';
          });
          this.$message.success('设备已停止，所有工人已设置为休息状态');
        }
      } else {
        // 设备启动时，如果有工人，将第一个工人（负责人）状态设为忙碌
        if (row.workers && row.workers.length > 0) {
          // 将第一个工人（负责人）状态设为忙碌
          row.workers[0].status = '忙碌';
          this.$message.success(`设备已启动，负责人 ${row.workers[0].name} 状态已设为忙碌`);
        } else {
          this.$message.success('设备已启动');
        }
      }

      // 这里可以添加保存到后端API的逻辑
      console.log('设备状态变更', row.status);
    },
    saveEdit(row, field) {
      // 这里可以添加保存到后端API的逻辑
      console.log(`保存 ${field} 修改`, row[field]);
    }
  }
}
</script>

<style scoped>
.device-management {
  padding: 20px;
  height: calc(100vh - 84px);
  overflow: auto;
  background-color: #f0f2f5;
}

.main-card {
  height: max-content;
  max-height: 60rem;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.el-table {
  margin-top: 20px;
  border-radius: 6px;
  overflow: hidden;
}

.el-table::before {
  display: none;
}

.el-table th {
  background-color: #f5f7fa !important;
}

.el-table td, .el-table th {
  padding: 12px 0;
}

.el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafafa;
}

.el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: #f0f7ff;
}

.el-tag {
  margin-right: 10px;
  padding: 0 12px;
  height: 32px;
  line-height: 30px;
}

.el-button--small {
  padding: 8px 15px;
}

.el-input-number.el-input-number--small {
  width: 120px;
}
</style>
