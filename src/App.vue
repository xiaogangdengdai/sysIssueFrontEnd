<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="📋 系统日志" name="sysLog">
        <SysLog />
      </el-tab-pane>
      <el-tab-pane label="🐛 问题日志" name="issueLog">
        <IssueLog />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SysLog from '@/components/SysLog.vue'
import IssueLog from '@/components/IssueLog.vue'

const activeTab = ref('issueLog')
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
