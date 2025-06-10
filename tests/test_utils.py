import pandas as pd
from utils.common import ts2ms, ms2ts


def test_timestamp_naive_and_utc_equality():
    """测试naive timestamp和UTC timestamp转换为毫秒时间戳时的相等性"""
    # 创建测试用的timestamp
    naive_ts = pd.Timestamp("2023-01-01 12:00:00")
    utc_ts = pd.Timestamp("2023-01-01 12:00:00", tz="UTC")

    # 验证naive和UTC转换后的毫秒值相等
    assert ts2ms(naive_ts) == ts2ms(utc_ts)


def test_timestamp_conversion_roundtrip():
    """测试timestamp转毫秒再转回timestamp的往返转换"""
    original_ts = pd.Timestamp("2023-01-01 12:00:00")
    ms = ts2ms(original_ts)
    converted_ts = ms2ts(ms)

    # 验证转换后的时间相等
    assert original_ts.year == converted_ts.year
    assert original_ts.month == converted_ts.month
    assert original_ts.day == converted_ts.day
    assert original_ts.hour == converted_ts.hour
    assert original_ts.minute == converted_ts.minute
    assert original_ts.second == converted_ts.second


def test_timezone_conversion():
    """测试不同时区的timestamp转换"""
    # 创建不同时区的相同时刻
    shanghai_ts = pd.Timestamp("2023-01-01 20:00:00").tz_localize("Asia/Shanghai")
    utc_ts = pd.Timestamp("2023-01-01 12:00:00", tz="UTC")

    # 验证它们转换为毫秒时间戳后相等（因为表示相同时刻）
    assert ts2ms(shanghai_ts) == ts2ms(utc_ts)


def test_ms2ts_timezone():
    """测试ms2ts返回的timestamp时区属性"""
    ms = 1672574400000  # 2023-01-01 12:00:00 UTC
    ts = ms2ts(ms)

    # 验证返回的timestamp没有时区信息
    assert ts.tz is None
    # 验证时间值正确
    assert ts.strftime("%Y-%m-%d %H:%M:%S") == "2023-01-01 12:00:00"


def test_edge_cases():
    """测试一些边界情况"""
    # 测试0时间戳
    assert ms2ts(0).year == 1970
    assert ms2ts(0).month == 1
    assert ms2ts(0).day == 1
    assert ms2ts(0).hour == 0

    # 测试毫秒精度
    ts = pd.Timestamp("2023-01-01 12:00:00.123456")
    ms = ts2ms(ts)
    converted_ts = ms2ts(ms)
    # 验证毫秒级精度保持一致（注意：只能保证毫秒级精度）
    assert abs(ts.timestamp() * 1000 - converted_ts.timestamp() * 1000) < 1
