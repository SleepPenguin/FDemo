import ccxt.pro as ccxtpro
from asyncio import run


async def main():
    exchange = ccxtpro.binance()
    proxy = "http://127.0.0.1:7890"
    exchange.https_proxy = proxy
    exchange.http_proxy = proxy
    exchange.wss_proxy = proxy
    exchange.ws_proxy = proxy
    await exchange.load_markets()
    orderbook = await exchange.watch_order_book("BTC/USDT")
    print(orderbook)
    await exchange.close()


run(main())
