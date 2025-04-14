<template>
  <div v-if="isEditVisible" class="modal-overlay" @click.self="closeModal" style="z-index: 99;">
    <div class="modal">
      <div class="modal-header">
        <span>编辑设备信息</span>
        <button @click="closeModal">×</button>
      </div>
      <div class="modal-content">
        <DeviceForm :deviceInfo="props.deviceInfo" />
      </div>
      <div class="modal-footer">
        <el-button type="primary" @click="saveDevice">保存</el-button> <!-- 绑定保存事件 -->
        <el-button @click="closeModal">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { format } from 'date-fns';
import axios from 'axios';
import { edit_device } from '@/api/request.js';
import DeviceForm from './components/DeviceForm.vue';

const props = defineProps({
  deviceInfo: {
    type: Object,
    default: () => ({})
  },
  isEditVisible: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['close', 'refresh']); // 增加refresh事件通知父组件刷新

const closeModal = () => {
  emits('close');
};

// 处理日期格式并保存
const saveDevice = async () => {
  console.log(props.deviceInfo)
  if (props.deviceInfo.id) { // 假设后端编辑接口需要设备ID
    // 格式化日期
    if (props.deviceInfo.manufactureDate) {
      props.deviceInfo.manufactureDate = format(
        props.deviceInfo.manufactureDate,
        'yyyy-MM-dd HH:mm:ss'
      );
    }
    if (props.deviceInfo.inspectionDate) {
      props.deviceInfo.inspectionDate = format(
        props.deviceInfo.inspectionDate,
        'yyyy-MM-dd HH:mm:ss'
      );
    }

    try {
      // 发送PUT请求到后端（假设后端编辑接口为 /api/devices/:id）
      // await api.put(`/api/devices/${props.deviceInfo.id}`, props.deviceInfo);
      await edit_device(props.deviceInfo)
      emits('close');
      emits('refresh'); // 通知父组件刷新数据
    } catch (error) {
      console.error('编辑设备信息失败', error);
    }
  }
};
</script>

<style scoped>
@import '@/views/modal.less';

</style>