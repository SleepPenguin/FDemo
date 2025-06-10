export class DateUtils {
  /**
   * 格式化日期为 YYYY-MM-DD 格式
   */
  static formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * 获取一个月前的日期
   */
  static getDateOneMonthAgo(): Date {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date
  }

  /**
   * 获取今天的日期
   */
  static getToday(): Date {
    return new Date()
  }

  /**
   * 设置默认日期范围（今天到一个月前）
   */
  static getDefaultDateRange(): { startDate: string; endDate: string } {
    const today = DateUtils.getToday()
    const oneMonthAgo = DateUtils.getDateOneMonthAgo()

    return {
      startDate: DateUtils.formatDate(oneMonthAgo),
      endDate: DateUtils.formatDate(today)
    }
  }
} 