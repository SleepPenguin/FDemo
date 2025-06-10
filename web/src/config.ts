 // 应用配置
export const config = {
    // API基础URL - 开发环境使用代理，生产环境需要设置为实际的后端地址
    API_BASE_URL: 'http://127.0.0.1:5000/api',
    
    // 应用标题
    APP_TITLE: 'FDemo K线图',
    
    // 默认配置
    DEFAULT_SYMBOL: 'BTC/USDT',
    DEFAULT_TIMEFRAME: '1d',
    
    // 图表配置
    MAX_RENDER_LINES: 5000,
    VOLUME_PANE_HEIGHT: 150
  }
  
  export default config