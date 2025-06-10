from datetime import datetime, timezone

import ccxt
import pandas as pd


def tf2ms(timeframe: str) -> int:
    return ccxt.Exchange.parse_timeframe(timeframe) * 1000


def get_now_ms():
    now = datetime.now(timezone.utc).timestamp()
    return int(now * 1000)


def df2chart_json(df: pd.DataFrame):
    df = df.dropna()
    result = []
    for ts, row in df.iterrows():
        ts: pd.Timestamp
        row: pd.Series
        result.append({
            'timestamp': int(ts.timestamp() * 1000),
            'open': row['open'],
            'high': row['high'],
            'low': row['low'],
            'close': row['close'],
            'volume': row['volume'],
        })
    return result


def grid_time(timeframe, start_time: int, end_time: int):
    min_len = 1000
    delta = tf2ms(timeframe)
    end_grid = (end_time // delta) * delta
    start_grid = min((start_time // delta + 1) * delta, end_grid - delta * min_len)
    res = list(range(start_grid, end_grid + delta, delta))
    min_time = ccxt.Exchange.parse8601("2010-01-01 00:00:00")
    max_time = (get_now_ms() // delta) * delta - delta
    return [x for x in res if min_time <= x <= max_time]
