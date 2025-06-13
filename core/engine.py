from data.exg import Exchange
import pandas as pd
from utils import tf2ms, ts2ms, tf2ts, CSVFile
from tqdm import tqdm
from utils import config


class Engine:
    def __init__(self, exg: Exchange):
        self.exg = exg
        self.start_time = pd.Timestamp("2023-01-01")
        self.end_time = pd.Timestamp("2024-01-01")
        self.simframe = "1m"
        self.base = "USDT"
        self.now = self.start_time
        self.wallet = {self.base: 1000}
        self.trade_csv = CSVFile(config.TRADE_CSV_NAME, config.TRADE_CSV_HEADER)
        # used_info: {(symbol, timeframe): warmup}
        self.used_info = {("BTC/USDT", "1d"): 30}
        # cache_data: {(symbol, timeframe): df}
        self.cache_data = {}

    def prepare_data(self):
        print("prepare data for backtesting, used_info: ", self.used_info)
        for (symbol, timeframe), warmup in self.used_info.items():
            end_ms = ts2ms(self.end_time)
            start_ms = ts2ms(self.start_time) - tf2ms(timeframe) * (warmup + 1)
            df = self.exg.get_kline(symbol, timeframe, start_ms, end_ms)
            self.cache_data[(symbol, timeframe)] = df
            print(f"already cache {symbol} {timeframe} data for backtesting")
        print("prepare data for backtesting completed")

    def get_price(self, symbol, timeframe, count=1):
        df = self.cache_data[(symbol, timeframe)]
        df = df.dropna()
        preview = (df.index + tf2ts(timeframe)) <= self.now
        res = df[preview].tail(count)
        return None if len(res) != count else res

    def run(self):
        self.prepare_data()
        print("Backtesting started")
        total_steps = (self.end_time - self.now) // tf2ts(self.simframe)
        with tqdm(total=total_steps, desc="Backtesting Progress") as pbar:
            while self.now < self.end_time:
                self.on_bar()
                self.now += tf2ts(self.simframe)
                pbar.update(1)
        print("Backtesting completed")

    def get_price_now(self, symbol):
        # TODO: 使用订单簿获取价格
        return self.get_price(symbol, self.simframe, 1)["close"].iloc[-1]

    def buy(self, symbol, amount, tag=None, type="market"):
        amount = float(self.exg.exchange.amount_to_precision(symbol, amount))
        price = self.get_price_now(symbol)
        cost = amount * price
        if self.wallet[self.base] < cost:
            print(
                f"wallet: {self.wallet} not enough balance {self.base} to buy {symbol} {amount}, cancel buy"
            )
            return
        if not self.wallet.get(symbol):
            self.wallet[symbol] = 0
        self.wallet[self.base] -= cost
        self.wallet[symbol] += amount
        self.trade_csv.record(
            [
                self.now,
                symbol,
                "buy",
                type,
                amount,
                price,
                cost,
                self.wallet[self.base],
                tag,
            ]
        )

    def sell(self, symbol, amount, tag=None, type="market"):
        amount = float(self.exg.exchange.amount_to_precision(symbol, amount))
        price = self.get_price_now(symbol)
        cost = amount * price
        if self.wallet[symbol] < amount:
            print(
                f"{symbol} in wallet is {self.wallet[symbol]}, but amount is {amount}, cancel sell"
            )
            return
        self.wallet[symbol] -= amount
        self.wallet[self.base] += cost
        self.trade_csv.record(
            [
                self.now,
                symbol,
                "sell",
                type,
                amount,
                price,
                cost,
                self.wallet[self.base],
                tag,
            ]
        )

    def on_bar(self):
        raise NotImplementedError("on_bar method not implemented")
