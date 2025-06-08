import json
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
    return json.dumps(result)


def grid_time(timeframe, start_time=None, end_time=None):
    min_len = 300
    delta = tf2ms(timeframe)
    end_grid = (get_now_ms() // delta) * delta - delta
    start_grid = end_grid - min_len * delta
    default_grid = list(range(start_grid, end_grid + delta, delta))
    if start_time is None or end_time is None:
        print(f"None in start_time: {start_time}, end_time: {end_time}, return default line")
        return default_grid
    end_grid = (end_time // delta) * delta  # 对齐到前一个格点
    end_grid = min(end_grid, default_grid[-1])
    start_grid = (start_time // delta + 1) * delta
    start_grid = min(start_grid, end_grid - min_len * delta)
    return list(range(start_grid, end_grid + delta, delta))
