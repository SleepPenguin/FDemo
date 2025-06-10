import { computed, watch } from 'vue'
import type { Ref } from 'vue'
import type { ValidationResult } from '../types/kline'

export interface KlineControlsOptions {
  symbol: Ref<string>
  timeframe: Ref<string>
  startDate: Ref<string>
  endDate: Ref<string>
  onDataLoad: () => void
  onSymbolSearch: () => void
}

export function useKlineControls(options: KlineControlsOptions) {
  const {
    symbol,
    timeframe,
    startDate,
    endDate,
    onDataLoad,
    onSymbolSearch
  } = options

  // 计算属性：检查表单是否有效
  const isFormValid = computed(() => {
    return (
      symbol.value.trim() !== '' &&
      timeframe.value.trim() !== '' &&
      startDate.value !== '' &&
      endDate.value !== '' &&
      new Date(startDate.value) <= new Date(endDate.value)
    )
  })

  // 计算属性：日期范围描述
  const dateRangeDescription = computed(() => {
    if (!startDate.value || !endDate.value) return ''
    
    const start = new Date(startDate.value)
    const end = new Date(endDate.value)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return `${diffDays} days`
  })

  // 验证日期范围
  const validateDateRange = (): ValidationResult => {
    if (!startDate.value || !endDate.value) {
      return { isValid: false, message: 'Please select both start and end dates' }
    }

    const start = new Date(startDate.value)
    const end = new Date(endDate.value)
    const now = new Date()

    if (start > end) {
      return { isValid: false, message: 'Start date must be before end date' }
    }

    if (end > now) {
      return { isValid: false, message: 'End date cannot be in the future' }
    }

    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 365) {
      return { isValid: false, message: 'Date range cannot exceed 365 days' }
    }

    return { isValid: true, message: '' }
  }

  // 处理加载数据
  const handleLoadData = () => {
    const validation = validateDateRange()
    if (!validation.isValid) {
      alert(validation.message)
      return
    }

    if (!isFormValid.value) {
      alert('Please fill in all required fields')
      return
    }

    onDataLoad()
  }

  // 处理符号搜索
  const handleSearchSymbol = () => {
    onSymbolSearch()
  }



  // 监听符号变化
  watch(symbol, (newSymbol, oldSymbol) => {
    if (newSymbol !== oldSymbol && newSymbol.trim() !== '') {
      console.log(`Symbol changed from ${oldSymbol} to ${newSymbol}`)
    }
  })

  // 监听时间框架变化
  watch(timeframe, (newTimeframe, oldTimeframe) => {
    if (newTimeframe !== oldTimeframe && newTimeframe.trim() !== '') {
      console.log(`Timeframe changed from ${oldTimeframe} to ${newTimeframe}`)
    }
  })

  return {
    // 计算属性
    isFormValid,
    dateRangeDescription,

    // 方法
    handleLoadData,
    handleSearchSymbol,
    validateDateRange
  }
} 