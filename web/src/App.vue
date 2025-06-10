<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import KlineChart from './components/KlineChart.vue'
import { initMaterialWeb } from './plugins/material'

export default defineComponent({
  name: 'App',
  components: {
    KlineChart
  },
  setup() {
    onMounted(async () => {
      try {
        await initMaterialWeb()
        // 确保DOM和CSS完全加载后再通知子组件
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error('Failed to initialize Material Web:', error)
      }
    })
  }
})
</script>

<template>
  <div class="app">
    <KlineChart />
  </div>
</template>

<style>
/* 导入Google字体 */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
}

.app {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
  display: flex;
  flex-direction: column;
}

/* Material Design CSS变量 */
:root {
  --md-circular-progress-size: 36px;
}
</style>
