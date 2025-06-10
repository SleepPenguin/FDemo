import { ref, nextTick} from 'vue'
import { init } from 'klinecharts'
import type { Chart } from 'klinecharts'
import { config } from '../config'
import { KlineService } from '../services/klineService'
import { DateUtils } from '../components/kline/utils/dateUtils'
import { ChartUtils } from '../components/kline/utils/chartUtils'
import { registerCustomIndicators } from '../components/kline/indicators'
import { useSearchModal } from './useSearchModal'

export function useKlineChart() {
    // 响应式状态
    const chartContainer = ref<HTMLElement | null>(null)
    const chart = ref<Chart | null>(null)
    const symbol = ref(config.DEFAULT_SYMBOL)
    const timeframe = ref(config.DEFAULT_TIMEFRAME)
    const timeframes = ref<string[]>([config.DEFAULT_TIMEFRAME])
    const startDate = ref('')
    const endDate = ref('')
    const isLoading = ref(false)
    const allSymbols = ref<string[]>([])

    const { showSearchModal } = useSearchModal()

    // 初始化图表
    const initChart = async () => {
        if (!chartContainer.value) return

        try {
            await ChartUtils.waitForValidContainer(chartContainer.value)

            chart.value = init(chartContainer.value, {
                timezone: 'UTC'
            })

            if (!chart.value) return

            // 设置小数折叠格式化
            chart.value.setDecimalFold({
                format: ChartUtils.decimalFoldFormat
            })

            // 添加指标
            chart.value.createIndicator('VOL', false, { id: 'VOL_pane', height: 150 })
            chart.value.createIndicator('ChangeRate', false, { id: 'candle_pane' })

            // 响应式调整
            const handleResize = () => {
                chart.value?.resize()
            }
            window.addEventListener('resize', handleResize)

            // 返回清理函数
            return () => {
                window.removeEventListener('resize', handleResize)
            }
        } catch (error) {
            console.error('Error initializing chart:', error)
        }
    }

    // 设置默认日期
    const setDefaultDates = () => {
        const { startDate: defaultStart, endDate: defaultEnd } = DateUtils.getDefaultDateRange()
        startDate.value = defaultStart
        endDate.value = defaultEnd
    }

    // 加载时间框架
    const loadTimeframes = async () => {
        try {
            timeframes.value = await KlineService.getTimeframes()
        } catch (error) {
            console.error('Error fetching timeframes:', error)
            throw error
        }
    }

    // 加载符号列表
    const loadSymbols = async () => {
        try {
            allSymbols.value = await KlineService.getSymbols()
        } catch (error) {
            console.error('Error fetching symbols:', error)
            throw error
        }
    }

    // 验证符号
    const validateSymbol = (symbolToCheck: string): boolean => {
        return allSymbols.value.includes(symbolToCheck)
    }

    // 加载数据
    const loadData = async () => {
        if (!validateSymbol(symbol.value)) {
            alert('symbol not in exchange')
            return
        }

        isLoading.value = true
        try {
            const data = await KlineService.getKlineData({
                symbol: symbol.value,
                timeframe: timeframe.value,
                start_date: startDate.value,
                end_date: endDate.value
            })

            if (chart.value && data.length > 0) {
                // 刷新精度
                chart.value.setPrecision({ price: ChartUtils.getDecimalPlaces(data[0].close) })
                chart.value.applyNewData(data)
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            alert(`Error loading data: ${errorMessage}`)
            console.error('Error loading kline data:', error)
        } finally {
            isLoading.value = false
        }
    }

    // 处理搜索符号
    const handleSearchSymbol = () => {
        showSearchModal({
            symbols: allSymbols.value,
            onSelect: (selectedSymbol) => {
                symbol.value = selectedSymbol
            }
        })
    }

    // 刷新数据
    const refreshData = async () => {
        await loadData()
    }

    // 更改符号
    const changeSymbol = (newSymbol: string) => {
        if (validateSymbol(newSymbol)) {
            symbol.value = newSymbol
            loadData()
        } else {
            console.warn(`Symbol ${newSymbol} not found in exchange`)
        }
    }

    // 更改时间框架
    const changeTimeframe = (newTimeframe: string) => {
        timeframe.value = newTimeframe
        loadData()
    }

    // 销毁图表
    const destroyChart = () => {
        if (chart.value) {
            // klinecharts 没有 dispose 方法，只需要将引用设为 null
            chart.value = null
        }
    }

    // 初始化函数
    const initialize = async () => {
        try {
            registerCustomIndicators()
            setDefaultDates()
            await Promise.all([loadSymbols(), loadTimeframes()])
            await nextTick()

            // 确保容器尺寸稳定后再初始化图表
            await new Promise(resolve => setTimeout(resolve, 150))
            const cleanup = await initChart()

            // 再次确保图表完全渲染后加载数据
            await nextTick()
            await loadData()

            return cleanup
        } catch (error) {
            console.error('Error during initialization:', error)
        }
    }

    return {
        // 响应式状态
        chartContainer,
        chart,
        symbol,
        timeframe,
        timeframes,
        startDate,
        endDate,
        isLoading,
        allSymbols,

        // 方法
        loadData,
        refreshData,
        handleSearchSymbol,
        changeSymbol,
        changeTimeframe,
        validateSymbol,
        destroyChart,
        initialize,

        // 配置
        config
    }
} 