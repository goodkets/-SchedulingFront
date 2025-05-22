<template>
  <div class="purchase-container">
    <!-- 顶部操作栏 -->
    <div class="top-operate">
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
v-model="searchQuery" placeholder="搜索订单编号或产品名称" clearable @keyup.enter="handleSearch"
          @input="removeSpaces" class="search-input">
          <template #append>
            <el-button @click="handleSearch" class="search-button">搜索</el-button>
          </template>
        </el-input>
      </div>
      <!-- 添加订单按钮 -->
      <div class="add-order">
        <el-button type="primary" @click="handleAddOrder">
          <i class="el-icon-plus"></i> 添加订单
        </el-button>
      </div>
    </div>
    <!-- 订单表格 -->
    <div class="table-container">
      <el-table :data="orders" style="width: 100%" class="order-table" fit>
        <el-table-column prop="order_no" label="订单编号" />
        <el-table-column prop="name" label="产品名称" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="due_data" label="交付时间">
          <template #default="scope">
            {{ formatDate(scope.row.due_data) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="交付状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="plain">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)" effect="plain">
              {{ getPriorityText(scope.row.priority) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="250">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" type="warning" @click="handleEdit(scope.row)" class="action-button">
                <i class="el-icon-edit"></i> 编辑
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)" class="action-button">
                <i class="el-icon-delete"></i> 删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        :total="total"
        :page="currentPage"
        :limit="pageSize"
        @pagination="handlePagination"
      />
    </div>
    <!-- 添加/编辑订单模态框 -->
    <el-dialog :title="isEdit ? '编辑订单' : '添加订单'" :visible.sync="dialogVisible" width="50%" :before-close="handleClose">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="订单编号" prop="order_no">
          <el-input
            v-model="form.order_no_suffix"
            placeholder="请输入订单编号后续内容"
            @input="combineOrderNo"
            :readonly="isEdit"
          >
            <template #prefix>DR</template>
          </el-input>
        </el-form-item>
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入产品名称" trim></el-input>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="电容" value="电容"></el-option>
            <el-option label="电阻" value="电阻"></el-option>
            <el-option label="继电器" value="继电器"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="交付日期" prop="due_data">
          <el-date-picker v-model="form.due_data" type="date" placeholder="选择交付日期" format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择优先级">
            <el-option label="高" value="1"></el-option>
            <el-option label="中" value="0"></el-option>
            <el-option label="低" value="-1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" :disabled="!isEdit">
            <el-option label="未交付" value="-1"></el-option>
            <el-option label="已交付" value="1"></el-option>
            <el-option label="生产中" value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            {{ isEdit ? '确认修改' : '确认添加' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { orderList, addPurchaseData, deletePurchaseData, editPurchaseData } from '@/api/orderList'
import Pagination from '@/components/Pagination'
export default {
  name: 'Purchase',
  components: {
    Pagination
  },
  data() {
    const validateRequired = (rule, value, callback) => {
      if (!value && value !== 0) {
        callback(new Error('该项为必填项'));
      } else {
        callback();
      }
    };
    return {
      searchQuery: '',
      orders: [],
      dialogVisible: false,
      form: {
        order_no: 'DR',
        order_no_suffix: '',
        name: '',
        quantity: 1,
        due_data: '',
        priority: '',
        status: '未交付',
        type: ''
      },
      rules: {
        order_no: [
          { validator: validateRequired, trigger: 'blur' }
        ],
        name: [
          { validator: validateRequired, trigger: 'blur' }
        ],
        quantity: [
          { validator: validateRequired, trigger: 'blur' }
        ],
        due_data: [
          { validator: validateRequired, trigger: 'change' }
        ],
        priority: [
          { validator: validateRequired, trigger: 'change' }
        ],
        status: this.isEdit ? [
          { validator: validateRequired, trigger: 'change' }
        ] : []
      },
      currentPage: 1,
      pageSize: 10,
      total: 0,
      isEdit: false // 新增标识，用于区分添加和编辑操作
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 调用接口
    async getOrderList() {
      try {
        const res = await orderList({
          page: this.currentPage,
          pageSize: this.pageSize,
          searchParam: this.searchQuery
        })
        // 假设接口返回的数据结构为 { data: { list: [], total: 0 } }
        this.orders = res.data || []
        this.total = res.total || 0
      } catch (error) {
        console.error('获取订单列表失败:', error)
      }
    },
    // 搜索操作
    handleSearch() {
      this.currentPage = 1
      this.getOrderList()
    },
    // 合并订单编号前缀和用户输入的后缀
    combineOrderNo() {
      this.form.order_no = `DR${this.form.order_no_suffix}`;
    },
    // 打开添加订单模态框
    handleAddOrder() {
      this.isEdit = false
      this.dialogVisible = true
      this.form = {
        order_no: 'DR',
        order_no_suffix: '',
        name: '',
        quantity: 1,
        due_data: '',
        priority: '',
        status: '-1', // 初始化状态值为 -1（未交付）
        type:''
      }
    },
    // 关闭模态框
    handleClose() {
      this.dialogVisible = false
    },
    // 提交添加/编辑订单信息
    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            const formData = { ...this.form }
            if (this.isEdit) {
              // 编辑时传递用户选择的状态
              await editPurchaseData(formData);
            } else {
              // 添加时状态固定为未交付
              formData.status = '-1'
              await addPurchaseData(formData);
            }
            await this.getOrderList();
            this.dialogVisible = false;
            this.isEdit = false;
          } catch (error) {
            console.error(this.isEdit ? '修改订单失败:' : '添加订单失败:', error);
            this.$message.error(this.isEdit ? '订单修改失败，请稍后重试' : '订单添加失败，请稍后重试');
          }
        } else {
          console.log('表单验证失败');
          return false;
        }
      });
    },
    // 查看订单操作
    handleView(row) {
      console.log('查看订单:', row)
    },
    // 编辑订单操作
    handleEdit(row) {
      this.isEdit = true // 设置为编辑模式
      this.dialogVisible = true
      // 提取订单编号后缀
      const orderNoSuffix = row.order_no.replace('DR', '');
      this.form = {
        ...row,
        order_no_suffix: orderNoSuffix,
        order_no: 'DR' + orderNoSuffix
      }
    },
    // 删除订单操作
    async handleDelete(row) {
      try {
        // 弹出确认框
        await this.$msgbox({
          title: '提示',
          message: '确定要删除该订单吗？',
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        });

        // 用户点击确定，请求删除接口，传递订单编号
        await deletePurchaseData({ order_no: row.order_no });
        // 删除成功，从本地数据中移除该订单
        const index = this.orders.indexOf(row);
        if (index !== -1) {
          this.orders.splice(index, 1);
        }
        // 更新总数据量
        this.total = this.orders.length;
        console.log('删除订单:', row);
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除订单失败:', error);
          this.$message.error('订单删除失败，请稍后重试');
        }
      }
    },
    getPriorityType(priority) {
      switch (parseInt(priority)) {
        case 1:
          return 'danger';
        case 0:
          return 'warning';
        case -1:
          return 'success';
        default:
          return 'default';
      }
    },
    getPriorityText(priority) {
      switch (parseInt(priority)) {
        case 1:
          return '高';
        case 0:
          return '中';
        case -1:
          return '低';
        default:
          return '未知优先级';
      }
    },
    getStatusType(status) {
      switch (parseInt(status)) {
        case -1:
          return 'info';
        case 0:
          return 'success';
        case 1:
          return 'warning';
        default:
          return 'default';
      }
    },
    getStatusText(status) {
      switch (parseInt(status)) {
        case -1:
          return '未交付';
        case 1:
          return '已交付';
        case 0:
          return '生产中';
        default:
          return '未知状态';
      }
    },
    // 格式化日期函数
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    // 过滤输入内容中的空格
    removeSpaces(e) {
      this.searchQuery = e.replace(/\s/g, '');
    },
    // 处理分页事件
    handlePagination({ page, limit }) {
      this.currentPage = page
      this.pageSize = limit
      this.getOrderList()
    }
  }
}
</script>

<style lang="scss" scoped>
.purchase-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.top-operate {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-area {
  .search-input {
    width: 300px;

    .el-input__inner {
      border-radius: 4px 0 0 4px;
      // 添加立体感样式
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: box-shadow 0.3s;

      &:focus {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }

  .search-button {
    border-radius: 0 4px 4px 0;
    background-color: #409eff;
    color: white;
    border: none;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);

    &:hover {
      background-color: #66b1ff;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
    }

    &:active {
      background-color: #3a8ee6;
      transform: translateY(0);
      box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
    }
  }
}

.add-order {
  .add-button {
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
  }
}

.table-container {
  overflow-x: auto; // 当内容宽度超出容器时显示水平滚动条
  border-radius: 4px;
}

.order-table {
  background-color: #fff;
  // 移除固定宽度，让表格根据内容自适应
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .el-table__header {
    th {
      background-color: #f5f7fa;
    }
  }

  .el-table__body {
    td {
      transition: background-color 0.3s;

      &:hover {
        background-color: #fafafa;
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 5px;
  }

  .action-button {
    flex: 1 1 auto;
    min-width: 60px;
    max-width: 100px;
  }
}
</style>
