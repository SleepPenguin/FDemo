import { registerIndicator, IndicatorSeries } from 'klinecharts'
import type {
  KLineData,
  IndicatorCreateTooltipDataSourceParams,
  IndicatorTooltipData,
  TooltipLegend
} from 'klinecharts'

export interface ChangeRateData {
  close: number
  open: number
}

export function registerChangeRateIndicator() {
  registerIndicator({
    name: 'ChangeRate',
    shortName: '',
    zLevel: -1,
    figures: [],
    series: IndicatorSeries.Price,
    calc: (dataList: KLineData[]) => dataList.map(data => ({
      close: data.close,
      open: data.open
    })),
    createTooltipDataSource: (params: IndicatorCreateTooltipDataSourceParams<ChangeRateData>): IndicatorTooltipData => {
      const { indicator, crosshair } = params
      const result = indicator.result
      const data = result[crosshair.dataIndex || 0]
      if (data) {
        const color = data.open > data.close ? 'rgb(230,16,40)' : 'rgb(9,234,123)'
        const rate = (data.close - data.open) / data.open
        const percentStr = `${(rate * 100).toFixed(2)}%`
        const legends: TooltipLegend[] = [
          { title: 'Chg: ', value: { text: percentStr, color } }
        ]
        return {
          name: 'ChangeRate',
          calcParamsText: '',
          features: [],
          legends
        }
      }
      return {
        name: 'ChangeRate',
        calcParamsText: '',
        features: [],
        legends: []
      }
    }
  })
} 