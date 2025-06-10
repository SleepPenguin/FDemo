// K线数据接口
export interface KlineData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  [key: string]: any
}

// K线请求参数接口
export interface KlineRequestParams {
  symbol: string
  timeframe: string
  start_date: string
  end_date: string
}

// 自定义指标数据类型
export interface ColorfulVolumeData {
  volume: number
  close: number
  open: number
}

export interface ChangeRateData {
  close: number
  open: number
}

// 图表配置接口
export interface ChartConfig {
  timezone: string
  precision?: {
    price: number
    volume?: number
  }
}

// 日期范围接口
export interface DateRange {
  startDate: string
  endDate: string
}

// 验证结果接口
export interface ValidationResult {
  isValid: boolean
  message: string
}



// 符号搜索选项接口
export interface SearchModalOptions {
  symbols: string[]
  onSelect: (symbol: string) => void
}

// API响应基础接口
export interface ApiResponse<T = any> {
  data: T
  status: number
  message?: string
}

// 错误处理接口
export interface KlineError {
  code: string
  message: string
  details?: any
} 