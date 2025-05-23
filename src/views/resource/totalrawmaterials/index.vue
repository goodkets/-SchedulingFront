<template>
  <div class="raw-materials-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <h3>原材料管理</h3>
        <el-button style="float: right; margin-left: 10px" type="primary" size="small" @click="saveRawMaterials">{{ text }}</el-button>
      </div>
      <el-table
        :data="rawMaterials"
        border
        style="width: 100%"
      >
        <el-table-column
          prop="id"
          label="ID"
          align="center"
        />
        <el-table-column
          prop="name"
          label="原材料名称"
          align="center"
        />
        <el-table-column
          prop="total"
          label="数量"
          align="center"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.total"
              size="small"
              @change="handleTotalChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="unit"
          label="单位"
          align="center"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import {getRawMaterialCount, updateRawMaterialCount} from '@/api/resource'

export default {
  name: 'RawMaterials',
  data() {
    return {
      rawMaterials: [],
      text: '保存',
      originalData: [] // 用于存储原始数据，便于比较是否有修改
    }
  },
  created() {
    this.fetchRawMaterials()
  },
  methods: {
    // 获取原材料数据
    fetchRawMaterials() {
      getRawMaterialCount().then(response => {
        if (response.status === 0) {
          this.rawMaterials = response.data
          // 深拷贝原始数据
          this.originalData = JSON.parse(JSON.stringify(response.data))
        } else {
          this.$message.error(response.message || '获取原材料数据失败')
        }
      }).catch(error => {
        console.error('获取原材料数据出错:', error)
        // this.$message.error('获取原材料数据出错')
      })
    },

    // 处理数量变更
    handleTotalChange(row) {
      this.text = '保存修改'
      // 可以在这里添加数量变更的额外逻辑，如验证等
      console.log('数量已更改:', row)
    },

    // 保存所有原材料数据
    saveRawMaterials() {
      // 检查是否有数据被修改
      const hasChanges = JSON.stringify(this.rawMaterials) !== JSON.stringify(this.originalData)

      if (!hasChanges) {
        this.$message.info('没有数据被修改')
        return
      }
      updateRawMaterialCount(this.rawMaterials).then(response => {
        if (response.status === 0) {
          this.$message.success('原材料数据更新成功')
          // 更新原始数据
          this.originalData = JSON.parse(JSON.stringify(this.rawMaterials))
        } else {
          this.$message.error(response.message || '更新原材料数据失败')
        }
      }).catch(error => {
        console.error('更新原材料数据出错:', error)
        // this.$message.error('更新原材料数据出错')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.raw-materials-container {
  padding: 20px;

  .box-card {
    width: 100%;
    margin-bottom: 20px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both;
  }
}
</style>

