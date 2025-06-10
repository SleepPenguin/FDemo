import axios from 'axios'
import { config } from '../config'
import type { KlineData, KlineRequestParams } from '../types/kline'

const API_BASE_URL = config.API_BASE_URL

export class KlineService {
  static async getTimeframes(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/timeframes`)
      return response.data
    } catch (error) {
      console.error('Error fetching timeframes:', error)
      throw error
    }
  }

  static async getSymbols(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/symbols`)
      return response.data
    } catch (error) {
      console.error('Error fetching symbols:', error)
      throw error
    }
  }

  static async getKlineData(params: KlineRequestParams): Promise<KlineData[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/kline`, params)
      return response.data
    } catch (error) {
      console.error('Error loading kline data:', error)
      throw error
    }
  }
} 