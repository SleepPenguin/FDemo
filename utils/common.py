import ccxt
import pandas as pd
import csv
from utils import config


class CSVFile:
    def __init__(self, filename: str, headers: list):
        filename = f"{config.LOG_PATH}/{filename}"
        self.filename = filename
        # 首先以写入模式创建文件并写入表头
        with open(filename, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(headers)

        # 然后以追加模式打开并保持文件句柄
        self.file = open(filename, "a", newline="", encoding="utf-8")
        self.writer = csv.writer(self.file)

    def record(self, row: list):
        row = [str(x) for x in row]
        self.writer.writerow(row)
        # 立即将数据写入磁盘
        self.file.flush()

    def __del__(self):
        # 析构函数中关闭文件
        if hasattr(self, "file"):
            self.file.close()

    def close(self):
        # 提供显式关闭方法
        if hasattr(self, "file"):
            self.file.close()


def tf2ms(timeframe: str) -> int:
    """将时间周期字符串转换为毫秒数"""
    return ccxt.Exchange.parse_timeframe(timeframe) * 1000


def tf2ts(timeframe: str) -> pd.Timestamp:
    """将时间周期字符串转换为pandas Timestamp对象"""
    return pd.Timedelta(milliseconds=tf2ms(timeframe))


def get_now_ms() -> int:
    """获取当前时间的毫秒时间戳（UTC）"""
    return ts2ms(pd.Timestamp.now(tz="UTC"))


def ts2ms(ts: pd.Timestamp) -> int:
    """
    将pandas Timestamp对象转换为毫秒时间戳（UTC）
    如果输入的Timestamp没有时区信息，会被当作UTC时间
    """
    return int(ts.timestamp() * 1000)


def ms2ts(ms: int) -> pd.Timestamp:
    """将毫秒时间戳转换为pandas Timestamp对象（UTC）"""
    return pd.Timestamp(ms, unit="ms")


def df2chart_json(df: pd.DataFrame):
    """将DataFrame转换为图表JSON格式"""
    df = df.dropna()
    result = []
    for ts, row in df.iterrows():
        ts: pd.Timestamp
        row: pd.Series
        result.append(
            {
                "timestamp": ts2ms(ts),
                "open": row["open"],
                "high": row["high"],
                "low": row["low"],
                "close": row["close"],
                "volume": row["volume"],
            }
        )
    return result


def grid_time(timeframe: str, start_time: int, end_time: int) -> list:
    """
    生成时间网格
    :param timeframe: 时间周期字符串
    :param start_time: 开始时间（毫秒时间戳）
    :param end_time: 结束时间（毫秒时间戳）
    :return: 时间网格列表（毫秒时间戳）
    """
    min_len = 1000
    delta = tf2ms(timeframe)
    end_grid = (end_time // delta) * delta
    start_grid = min((start_time // delta + 1) * delta, end_grid - delta * min_len)
    res = list(range(start_grid, end_grid + delta, delta))
    min_time = ccxt.Exchange.parse8601("2010-01-01 00:00:00")
    max_time = (get_now_ms() // delta) * delta - delta
    return [x for x in res if min_time <= x <= max_time]
