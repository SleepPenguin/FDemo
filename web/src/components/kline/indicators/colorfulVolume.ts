import { registerIndicator, getFigureClass, IndicatorSeries } from 'klinecharts'
import type {
  KLineData,
  IndicatorCreateTooltipDataSourceParams,
  IndicatorTooltipData,
  IndicatorDrawParams,
  TooltipLegend
} from 'klinecharts'

// 自定义指标数据类型
export interface ColorfulVolumeData {
  volume: number
  close: number
  open: number
}

export function registerColorfulVolumeIndicator() {
  registerIndicator({
    name: 'ColorfulVolume',
    shortName: 'Chg:',
    zLevel: -1,
    figures: [],
    series: IndicatorSeries.Price,
    calc: (dataList: KLineData[]) => dataList.map(data => ({
      volume: data.volume || 0,
      close: data.close,
      open: data.open
    })),
    createTooltipDataSource: (params: IndicatorCreateTooltipDataSourceParams<ColorfulVolumeData>): IndicatorTooltipData => {
      const { indicator, crosshair } = params
      const result = indicator.result
      const data = result[crosshair.dataIndex || 0]
      if (data) {
        const color = data.open > data.close ? 'rgb(230,16,40)' : 'rgb(9,234,123)'
        const rate = (data.close - data.open) / data.open
        const percentStr = `${(rate * 100).toFixed(2)}%`
        const legends: TooltipLegend[] = [
          { title: '', value: { text: percentStr, color } }
        ]
        return {
          name: 'ColorfulVolume',
          calcParamsText: '',
          features: [],
          legends
        }
      }
      return {
        name: 'ColorfulVolume',
        calcParamsText: '',
        features: [],
        legends: []
      }
    },
    draw: (params: IndicatorDrawParams<ColorfulVolumeData, any, any>): boolean => {
      const { ctx, chart, indicator, bounding, xAxis } = params
      const { realFrom, realTo } = chart.getVisibleRange()
      const { gapBar, halfGapBar } = chart.getBarSpace()
      const { result } = indicator
      let maxVolume = 0
      for (let i = realFrom; i < realTo; i++) {
        const data = result[i]
        if (data) {
          maxVolume = Math.max(maxVolume, data.volume)
        }
      }
      const totalHeight = bounding.height * 0.4
      const Rect = getFigureClass('rect')
      if (Rect) {
        for (let i = realFrom; i < realTo; i++) {
          const data = result[i]
          if (data) {
            const height = Math.round(data.volume / maxVolume * totalHeight)
            const color = data.open > data.close ? 'rgba(234,205,224,0.6)' : 'rgba(206,234,243,0.6)'
            new Rect({
              name: 'rect',
              attrs: {
                x: xAxis.convertToPixel(i) - halfGapBar,
                y: bounding.height - height,
                width: gapBar,
                height
              },
              styles: { color }
            }).draw(ctx)
          }
        }
      }
      return true
    }
  })
} 