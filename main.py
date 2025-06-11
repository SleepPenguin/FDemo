import talib.abstract as ta
from core import Engine
from data.exg import Exchange


class TestStartegy(Engine):
    def __init__(self, exg: Exchange):
        super().__init__(exg)
        self.simframe = "1m"
        self.used_info = {("BTC/USDT", "1d"): 30, ("BTC/USDT", self.simframe): 0}

    def on_bar(self):
        # 只在每天23:00执行
        if not (self.now.hour == 23 and self.now.minute == 0):
            return
        trade_symbol = "BTC/USDT"
        price_1d = self.get_price(trade_symbol, "1d", 30)
        if price_1d is None:
            return
        sma_5_1d = ta.SMA(price_1d, 5)
        sma_20_1d = ta.SMA(price_1d, 20)
        if (
            sma_5_1d.iloc[-1] > sma_20_1d.iloc[-1]
            and sma_5_1d.iloc[-2] < sma_20_1d.iloc[-2]
        ):
            cost = 100
            price = self.get_price_now(trade_symbol)
            self.buy(trade_symbol, cost / price)
        elif (
            sma_5_1d.iloc[-1] < sma_20_1d.iloc[-1]
            and sma_5_1d.iloc[-2] > sma_20_1d.iloc[-2]
        ):
            position = self.wallet[trade_symbol]
            self.sell(trade_symbol, position)


if __name__ == "__main__":
    exg = Exchange()
    engine = TestStartegy(exg)
    engine.run()
