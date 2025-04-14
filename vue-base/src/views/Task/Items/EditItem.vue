<template>
  <div v-if="isEditVisible" class="modal-overlay" @click.self="closeModal" style="z-index: 99;">
    <div class="modal">
      <div class="modal-header">
        <span>编辑检测项目信息</span>
        <button @click="closeModal">×</button>
      </div>
      <div class="modal-content">
        <form>
          <div class="form-item">
            <label>*项目</label>
            <el-input v-model="itemInfo.project" placeholder="请输入项目"></el-input>
          </div>
          <div class="form-item">
            <label>档位</label>
            <el-input v-model="itemInfo.gear" placeholder="请输入档位"></el-input>
          </div>
          <div class="form-item">
            <label>*百分比(%)</label>
            <el-input v-model="itemInfo.percentage" placeholder="请输入百分比"></el-input>
          </div>
          <div class="form-item">
            <label>*数据下限(%)</label>
            <el-input v-model="itemInfo.data_lower_limit" placeholder="请输入数据下限"></el-input>
          </div>
          <div class="form-item">
            <label>*数据上限(%)</label>
            <el-input v-model="itemInfo.data_upper_limit" placeholder="请输入数据上限"></el-input>
          </div>
          <div class="form-item">
            <label>*实测数据(%)</label>
            <el-input v-model="itemInfo.measured_data" placeholder="请输入实测数据"></el-input>
          </div>
          <div class="form-item">
            <label>*关联任务ID</label>
            <el-input v-model="itemInfo.task_id" placeholder="请输入关联任务ID"></el-input>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <el-button type="primary" @click="saveItem">保存</el-button>
        <el-button @click="closeModal">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { edit_inspectionItem } from '@/api/request.js';

const props = defineProps({
  itemInfo: {
    type: Object,
    default: () => ({})
  },
  isEditVisible: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['close', 'refresh']);

const closeModal = () => {
  emits('close');
};

const saveItem = async () => {
  if (props.itemInfo.item_id) {
    try {

      await edit_inspectionItem(props.itemInfo.item_id, props.itemInfo);
      emits('close');
      emits('refresh');
    } catch (error) {
      console.error('编辑检测项目信息失败', error);
    }
  }
};
</script>

<style scoped>
@import '@/views/modal.less';
</style>