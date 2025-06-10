export class ChartUtils {
  // 下标数字映射
  private static readonly subscriptNumbers: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  }

  /**
   * 小数折叠格式化函数（参考原JS实现）
   */
  static decimalFoldFormat(value: string | number): string {
    const vl = `${value}`
    const reg = new RegExp('\\.0{3,}[1-9][0-9]*$')
    if (reg.test(vl)) {
      const result = vl.split('.')
      const lastIndex = result.length - 1
      const v = result[lastIndex]
      const match = /0*/.exec(v)
      if (match) {
        const count = `${match[0].length}`
        result[lastIndex] = v.replace(/0*/, 
          `0${count.replace(/\d/g, 
            (digit: string) => ChartUtils.subscriptNumbers[digit] ?? '')}`
        )
        return result.join('.')
      }
    }
    return vl
  }

  /**
   * 获取小数位数（参考原JS实现）
   */
  static getDecimalPlaces(num: number): number {
    if (!isFinite(num)) return 0
    const str = num.toString()
    if (str.includes('e')) {
      const [base, exponent] = str.split('e')
      const decimalPlaces = (base.split('.')[1]?.length || 0) - Number(exponent)
      return Math.max(0, decimalPlaces)
    }
    const decimalPart = str.split('.')[1]
    return decimalPart ? decimalPart.length : 0
  }

  /**
   * 等待容器有效尺寸
   */
  static async waitForValidContainer(container: HTMLElement, timeout = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      const checkSize = () => {
        const rect = container.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          resolve()
          return
        }
        
        if (Date.now() - startTime > timeout) {
          reject(new Error('Container size timeout'))
          return
        }
        
        setTimeout(checkSize, 50)
      }
      
      checkSize()
    })
  }
} 