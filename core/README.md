# 注意点

1. 一定要注意加密货币市场的K线索引时间为该条K线的起始时间，防止引入未来数据，相关函数封装在Engine中的get_price函数中，
    始终只使用该函数获取数据
2. 永远使用utc时区，所有代码只有两种时间 (1) 标准时间 unix utc timestamp: int (2) 可读时间 pd.Timestamp tz=None
   不要使用python datetime时间或其他时间模块以免复杂化，
   所有的时间均全为UTC时区，使用common中的ts2ms, ms2ts相互转换
3. 币安的历史K线数据存在缺口，从get_price中拿到的历史数据在缺口上全为nan值，需要特殊处理
