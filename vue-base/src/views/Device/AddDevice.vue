<template>
  <div v-if="isAddVisible" class="modal-overlay" @click.self="closeModal" style="z-index: 99;">
    <div class="modal">
      <div class="modal-header">
        <span>添加设备</span>
        <button @click="closeModal">×</button>
      </div>
      <div class="modal-content">
        <DeviceForm :deviceInfo="deviceInfo" />
      </div>
      <div class="modal-footer">
        <el-button type="primary" @click="saveDevice">保存</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { format } from 'date-fns';
import { add_device } from '@/api/request.js';
import DeviceForm from './components/DeviceForm.vue';

const props = defineProps({
  isAddVisible: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['close', 'refresh']);
const closeModal = () => {
  emits('close');
};

const deviceInfo = ref({
  deviceId: '',
  deviceName: '',
  deviceModel: '',
  manufactureDate: null,
  inspectionDate: null,
  manufacturer: '',
  productionPlace: '',
  deviceStatus: ''
});

const saveDevice = async () => {
  if (deviceInfo.value.manufactureDate && deviceInfo.value.inspectionDate) {
    // 格式化日期为 YYYY-MM-DD HH:mm:ss
    deviceInfo.value.manufactureDate = format(
      deviceInfo.value.manufactureDate,
      'yyyy-MM-dd HH:mm:ss'
    );
    deviceInfo.value.inspectionDate = format(
      deviceInfo.value.inspectionDate,
      'yyyy-MM-dd HH:mm:ss'
    );
  }

  try {
    // await api.post('/api/devices', deviceInfo.value);
    await add_device(deviceInfo.value);
    closeModal();
    emits('refresh');
    resetForm();
  } catch (error) {
    console.error('保存设备信息失败', error);
  }
};

const resetForm = () => {
  deviceInfo.value = {
    deviceId: '',
    deviceName: '',
    deviceModel: '',
    manufactureDate: null,
    inspectionDate: null,
    manufacturer: '',
    productionPlace: '',
    deviceStatus: ''
  };
};
</script>

<style scoped>
@import '@/views/modal.less';
</style>