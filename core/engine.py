from data.exg import Exchange
import pandas as pd
from utils import tf2ms, ts2ms, tf2ts, CSVFile
from tqdm import tqdm
from utils import config
import json
import zipfile


class Engine:
    def __init__(self, exg: Exchange):
        self.exg = exg
        self.name = "Engine"
        self.start_time = pd.Timestamp("2023-01-01")
        self.end_time = pd.Timestamp("2024-01-01")
        self.simframe = "1m"
        self.base = "USDT"
        self.now = self.start_time
        self.wallet = {self.base: 1000}
        self.config_name = "config.json"
        self.trade_csv_name = "trade.csv"
        self.trade_csv = CSVFile(
            self.trade_csv_name,
            [
                "time",
                "symbol",
                "side",
                "type",
                "amount",
                "price",
                "cost",
                "wallet",
                "tag",
            ],
        )
        # used_info: {(symbol, timeframe): warmup}
        self.used_info = {("BTC/USDT", "1d"): 30}
        # cache_data: {(symbol, timeframe): df}
        self.cache_data = {}
        self.fee = 0.002

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
        self.save_config()
        self.prepare_data()
        print("Backtesting started")
        total_steps = (self.end_time - self.now) // tf2ts(self.simframe)
        with tqdm(total=total_steps, desc="Backtesting Progress") as pbar:
            while self.now < self.end_time:
                self.on_bar()
                self.now += tf2ts(self.simframe)
                pbar.update(1)
        print("Backtesting completed")
        self.pack_result()

    def get_price_now(self, symbol):
        # TODO: 使用订单簿获取价格
        return self.get_price(symbol, self.simframe, 1)["close"].iloc[-1]

    def buy(self, symbol, amount, tag=None, type="market"):
        amount = float(self.exg.exchange.amount_to_precision(symbol, amount))
        price = self.get_price_now(symbol)
        cost = amount * price * (1 + self.fee)
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
        cost = amount * price * (1 - self.fee)
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

    def save_config(self):
        record_config = {
            "name": self.name,
            "start_time": str(self.start_time),
            "end_time": str(self.end_time),
            "simframe": self.simframe,
            "base": self.base,
            "fee": self.fee,
            "wallet": self.wallet,
            "used_info": str(self.used_info),
        }
        with open(f"{config.LOG_PATH}/{self.config_name}", "w") as f:
            json.dump(record_config, f)

    def pack_result(self):
        # 将输出结果打包成zip文件
        need_pack = [self.config_name, self.trade_csv_name]
        # 以当前时间作为文件名
        now = pd.Timestamp.now().strftime("%Y%m%d_%H%M%S")
        with zipfile.ZipFile(f"{config.LOG_PATH}/{now}.zip", "w") as zipf:
            for file in need_pack:
                zipf.write(f"{config.LOG_PATH}/{file}", file)
        print(f"pack result to {config.LOG_PATH}/{now}.zip")
