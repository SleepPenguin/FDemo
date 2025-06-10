import { registerColorfulVolumeIndicator } from './colorfulVolume'
import { registerChangeRateIndicator } from './changeRate'

export function registerCustomIndicators() {
  registerColorfulVolumeIndicator()
  registerChangeRateIndicator()
}

export * from './colorfulVolume'
export * from './changeRate' 