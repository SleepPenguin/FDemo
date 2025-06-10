<template>
    <div class="kline-container">
        <div class="kline-top-controls">
            <div class="kline-control-item">
                <md-outlined-text-field class="kline-symbol-field kline-outlined-field" v-model="symbol"
                    label="Symbol" />
            </div>

            <div class="kline-control-item">
                <md-filled-tonal-icon-button @click="controls.handleSearchSymbol">
                    <md-icon>search</md-icon>
                </md-filled-tonal-icon-button>
            </div>

            <div class="kline-control-item">
                <md-outlined-select class="kline-timeframe-select kline-outlined-field" v-model="timeframe"
                    label="Timeframe">
                    <md-select-option v-for="tf in timeframes" :key="tf" :value="tf" :selected="tf === '1d'">
                        <div slot="headline">{{ tf }}</div>
                    </md-select-option>
                </md-outlined-select>
            </div>

            <div class="kline-control-item">
                <md-outlined-text-field class="kline-date-field kline-outlined-field" v-model="startDate"
                    label="Start Date" type="date" />
            </div>

            <div class="kline-control-item">
                <md-outlined-text-field class="kline-date-field kline-outlined-field" v-model="endDate" label="End Date"
                    type="date" />
            </div>

            <div class="kline-control-item">
                <md-filled-tonal-button v-if="!isLoading" @click="controls.handleLoadData">
                    <md-icon slot="icon">refresh</md-icon>
                    Load
                </md-filled-tonal-button>
                <div v-else class="kline-loading-indicator">
                    <md-circular-progress four-color indeterminate></md-circular-progress>
                    <span style="padding: 8px">Loading...</span>
                </div>
            </div>


        </div>

        <div ref="chartContainer" class="kline-chart"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue'
import { useKlineChart } from '../composables/useKlineChart'
import { useKlineControls } from '../composables/useKlineControls'
import './kline/styles/KlineChart.css'

export default defineComponent({
    name: 'KlineChart',
    setup() {
        // 使用K线图表管理组合函数
        const klineChart = useKlineChart()

        // 使用控制面板组合函数
        const controls = useKlineControls({
            symbol: klineChart.symbol,
            timeframe: klineChart.timeframe,
            startDate: klineChart.startDate,
            endDate: klineChart.endDate,
            onDataLoad: klineChart.loadData,
            onSymbolSearch: klineChart.handleSearchSymbol
        })

        // 清理函数
        let cleanup: (() => void) | undefined

        onMounted(async () => {
            cleanup = await klineChart.initialize()
        })

        onUnmounted(() => {
            if (cleanup) {
                cleanup()
            }
            klineChart.destroyChart()
        })

        return {
            // K线图表相关
            ...klineChart,

            // 控制面板相关
            controls
        }
    }
})
</script>

<!-- 样式已移至 ./kline/styles/KlineChart.css -->