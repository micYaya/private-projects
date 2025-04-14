<template>
  <div v-if="isAddVisible" class="modal-overlay" @click.self="closeModal" style="z-index: 99;">
    <div class="modal">
      <div class="modal-header">
        <span>添加结果</span>
        <button @click="closeModal">×</button>
      </div>
      <div class="modal-content">
        <ResultForm :resultInfo="resultInfo" />
      </div>
      <div class="modal-footer">
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { add_result } from '@/api/request.js';
import { format } from 'date-fns';
import ResultForm from './components/ResultForm.vue';

const props = defineProps({
  isAddVisible: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['close', 'refresh']);
const resultInfo = ref({
  deviceId: '',
  twoP: null,
  tanValue: null,
  measuredId: null,
  temperature: null,
  humidity: null,
  testDate: null,
  fa: null,
  fb: null,
  fc: null,
  da: null,
  db: null,
  dc: null,
  dUa: null,
  dUb: null,
  dUc: null,
  Upta: null,
  Uptb: null,
  Uptc: null,
  Uyba: null,
  Uybb: null,
  Uybc: null,
  rate: null,
  res1: null,
  res2: null,
  res3: null,
  res4: null
});
const resultForm = ref(null);

const handleSave = async () => {
  // 格式化日期
  if (resultInfo.value.testDate) {
    resultInfo.value.testDate = format(resultInfo.value.testDate, 'yyyy-MM-dd');
  }
  try {
    // await api.post('/api/results', resultInfo.value);
    await add_result(resultInfo.value);
    emits('refresh');
    emits('close');
    resetForm();
  } catch (error) {
    console.error('保存结果失败:', error);
  }
};

const resetForm = () => {
  resultInfo.value = {
    deviceId: '',
    twoP: null,
    tanValue: null,
    measuredId: null,
    temperature: null,
    humidity: null,
    testDate: null,
    fa: null,
    fb: null,
    fc: null,
    da: null,
    db: null,
    dc: null,
    dUa: null,
    dUb: null,
    dUc: null,
    Upta: null,
    Uptb: null,
    Uptc: null,
    Uyba: null,
    Uybb: null,
    Uybc: null,
    rate: null,
    res1: null,
    res2: null,
    res3: null,
    res4: null
  };
};

const closeModal = () => {
  emits('close');
};
</script>

<style scoped>
@import '@/views/modal.less';
.modal {
  width: 1000px; 
  max-height: 90vh; 
  overflow-y: auto;
}
</style>