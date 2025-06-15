from data.exg import Exchange
from utils import ts2ms, tf2ms, tf2ts


class BackTestDataFeed:
    def __init__(self, exg: Exchange, start_time, end_time):
        self.exg = exg
        self.start_time = start_time
        self.end_time = end_time
        # subscribers: {(symbol, timeframe): count}
        self.subscribers = {}
        # cache_data: {(symbol, timeframe): df}
        self.cache_data = {}

    def subsribe(self, symbol, timeframe, count):
        """
        订阅数据

        :param symbol: 交易对
        :param timeframe: 时间周期
        :param count: 获取数量
        :return: None
        """
        key = (symbol, timeframe)
        if not self.subscribers.get(key):
            self.subscribers[key] = count
        else:
            print(
                f"already subscribed {symbol} {timeframe} {count}, change count to latest"
            )
            self.subscribers[key] = count

    def prepare(self):
        print("prepare data for backtesting, subscribers: ", self.subscribers)
        for (symbol, timeframe), count in self.subscribers.items():
            end_ms = ts2ms(self.end_time)
            start_ms = ts2ms(self.start_time) - tf2ms(timeframe) * (count + 1)
            df = self.exg.get_kline(symbol, timeframe, start_ms, end_ms)
            self.cache_data[(symbol, timeframe)] = df
            print(f"already cache {symbol} {timeframe} data for backtesting")
        print("prepare data for backtesting completed")

    def get_price(self, time, symbol, timeframe):
        key = (symbol, timeframe)
        count = self.subscribers.get(key, 1)
        df = self.cache_data.get(key, None)
        if not df:
            print(
                f"no data for {symbol} {timeframe} in {self.start_time} to {self.end_time}"
            )
            return None
        df = df.dropna()
        preview = (df.index + tf2ts(timeframe)) <= time
        res = df[preview].tail(count)
        return None if len(res) != count else res
