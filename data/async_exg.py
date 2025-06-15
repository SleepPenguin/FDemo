import ccxt.pro as ccxtpro
from utils import config


class AsyncExchange:
    def __init__(self):
        self.exg = ccxtpro.binance()
        self.exg.https_proxy = config.HTTPS_PROXY
        self.exg.ws_proxy = config.WS_PROXY

    async def init(self):
        await self.exg.load_markets()

    async def watch_orderbook(self, symbol):
        orderbook = await self.exg.watch_order_book(symbol)
        print(orderbook)
        await self.exg.close()
