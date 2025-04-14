<template>
  <form>
    <div class="form-item">
      <label>*设备ID</label>
      <el-input v-model="deviceInfo.deviceId" placeholder="请输入设备ID"></el-input>
    </div>
    <div class="form-item">
      <label>*设备名称</label>
      <el-input v-model="deviceInfo.deviceName" placeholder="请输入设备名称"></el-input>
    </div>
    <div class="form-item">
      <label>*设备型号</label>
      <el-input v-model="deviceInfo.deviceModel" placeholder="请输入设备型号"></el-input>
    </div>
    <div class="form-item">
      <label>*生产日期</label>
      <el-date-picker
        type="datetime"
        v-model="deviceInfo.manufactureDate"
        placeholder="请选择生产日期"
        style="width: 240px;"
      ></el-date-picker>
    </div>
    <div class="form-item">
      <label>*送检日期</label>
      <el-date-picker
        type="datetime"
        v-model="deviceInfo.inspectionDate"
        placeholder="请选择送检日期"
        style="width: 240px;"
      ></el-date-picker>
    </div>
    <div class="form-item">
      <label>*制造商</label>
      <el-input v-model="deviceInfo.manufacturer" placeholder="请输入制造商"></el-input>
    </div>
    <div class="form-item">
      <label>*产地</label>
      <el-input v-model="deviceInfo.productionPlace" placeholder="请输入产地"></el-input>
    </div>
    <div class="form-item status-item">
      <label>*设备状态</label>
      <el-radio-group v-model="deviceInfo.deviceStatus">
        <el-radio label="已检测">已检测</el-radio>
        <el-radio label="未检测">未检测</el-radio>
      </el-radio-group>
    </div>
  </form>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  deviceInfo: {
    type: Object,
    default: () => ({})
  }
});
</script>

<style scoped>
@import '@/views/modal.less';
</style>