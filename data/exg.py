import time
from tqdm import tqdm
import ccxt
import pandas as pd
from data.db import DolphinDB
import utils


class Exchange:
    def __init__(self):
        self.exchange = ccxt.binance()
        self.exchange.load_markets()
        self.db = DolphinDB(self.exchange.name.lower())

    def _ohlcv_from_api(self, symbol, timeframe, time_grid, limit=1000) -> pd.DataFrame:
        since, end = time_grid[0], time_grid[-1]
        all_data = []
        with tqdm(total=(len(time_grid) // limit + 1), desc=f"Fetching {symbol} [{timeframe}] from api",
                  unit="page") as pbar:
            while since < end:
                try:
                    ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe=timeframe, since=since, limit=limit)
                    if not ohlcv:
                        break
                    all_data.extend(ohlcv)
                    since = ohlcv[-1][0] + 1
                    pbar.update(1)
                    time.sleep(limit/ 1000)
                except Exception as e:
                    raise RuntimeError(f"Error fetching data: {e}")
        ohlcv = ['open', 'high', 'low', 'close', 'volume']
        df = pd.DataFrame(all_data, columns=['timestamp'] + ohlcv).set_index('timestamp')
        df = df.reindex(time_grid)  # 补齐缺失时间点
        df.index = pd.to_datetime(df.index, unit='ms')
        df.index.name = 'datetime'
        return df[ohlcv]

    def _ohlcv_from_db(self, symbol, timeframe='1h', time_grid=None) -> pd.DataFrame:
        start_datetime = pd.to_datetime(time_grid[0], unit='ms')
        end_datetime = pd.to_datetime(time_grid[-1], unit='ms')
        df = self.db.fetch(symbol, timeframe, start_datetime, end_datetime)
        df = df.set_index('datetime')
        return df

    def _send_ohlcv2db(self, standard_kline_df: pd.DataFrame, timeframe, symbol):
        standard_kline_df = standard_kline_df.reset_index()
        standard_kline_df['timeframe'] = timeframe
        standard_kline_df['symbol'] = symbol
        cols = ['datetime', 'symbol', 'open', 'high', 'low', 'close', 'volume', 'timeframe']
        self.db.appender.append(standard_kline_df[cols])

    def get_kline(self, symbol: str, timeframe: str, start_time=None, end_time=None, use_cache=True) -> pd.DataFrame:
        """
        优先从数据库中获取K线，获取不到的从API获取，存入数据库

        :param use_cache: 是否使用数据库中的缓存
        :param symbol: 需要的标的 (BTC/USDT)
        :param timeframe: 时间间隔
        :param start_time: 开始时间（包含）
        :param end_time: 结束时间（包含）
        :return: Dataframe，index-datetime, 0-open, 1-high, 2-low, 3-close, 4-volume
        """
        time_grid = utils.grid_time(timeframe, start_time, end_time)
        db_df = self._ohlcv_from_db(symbol, timeframe, time_grid)
        if len(db_df) != len(time_grid) or not use_cache:
            api_df = self._ohlcv_from_api(symbol, timeframe, time_grid)
            self._send_ohlcv2db(api_df, timeframe, symbol)
            return api_df
        return db_df
