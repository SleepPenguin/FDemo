import pandas as pd
from collections import defaultdict
from utils import ts2ms, tf2ms
from data.exg import Exchange
import zipfile
import json


def get_trade_df_config_dict(zip_filepath):
    """
    通过交易记录获取交易数据，输出 DataFrame
    """
    with zipfile.ZipFile(zip_filepath, "r") as zipf:
        zipf.extract("trade.csv")
        trade_df = pd.read_csv("trade.csv")
        config_dict = json.load(zipf.open("config.json"))
    trade_df["time"] = pd.to_datetime(trade_df["time"])
    trade_df.set_index("time", inplace=True)
    return trade_df, config_dict


def get_position_structure(zip_filepath):
    """
    通过交易记录复现持仓结构，输出字典{time: {"before": {"base": wallet, symbol: amount}, "after": {"base": wallet, symbol: amount}}}
    表示time时间前后的持仓结构，需要注意trade.csv中可能存在重复时间点，需要合并

    Args:
        filepath: 交易记录CSV文件路径

    Returns:
        dict: 按时间索引的持仓结构字典，包含交易前后状态
    """
    # 读取并预处理交易数据
    trade_df, _ = get_trade_df_config_dict(zip_filepath)

    # 初始化持仓结构
    position_dict = {}
    current_position = defaultdict(float)

    # 按时间顺序遍历交易记录
    for time, row in trade_df.iterrows():
        # 创建交易前的持仓快照
        before_position = dict(current_position)

        # 更新持仓
        if row["side"] == "buy":
            # 买入前的base余额 = 当前wallet + 花费的成本
            before_position["base"] = float(row["wallet"]) + float(row["cost"])
            # 买入后更新币种数量和base余额
            current_position[row["symbol"]] += float(row["amount"])
            current_position["base"] = float(row["wallet"])
        elif row["side"] == "sell":
            # 卖出前的base余额 = 当前wallet - 获得的收入
            before_position["base"] = float(row["wallet"]) - float(row["cost"])
            # 卖出后更新币种数量和base余额
            current_position[row["symbol"]] -= float(row["amount"])
            current_position["base"] = float(row["wallet"])

        # 存储当前时间点的交易前后持仓快照
        position_dict[time] = {
            "before": before_position,
            "after": dict(current_position),
        }

    return position_dict


def get_pnl(exg: Exchange, zip_filepath):
    """
    通过交易记录获取总资产曲线，输出字典 {"time": time, "before": before_pnl, "after": after_pnl}
    """
    trade_df, config_dict = get_trade_df_config_dict(zip_filepath)
    sim_frame = config_dict["simframe"]
    all_trade_symbol = trade_df["symbol"].unique()
    start_ms = ts2ms(trade_df.index[0]) - 10 * tf2ms(sim_frame)
    end_ms = ts2ms(trade_df.index[-1]) + 10 * tf2ms(sim_frame)
    all_price_df = {}
    for symbol in all_trade_symbol:
        price_df = exg.get_kline(symbol, sim_frame, start_ms, end_ms)
        all_price_df[symbol] = price_df

    for time, row in trade_df.iterrows():
        symbol = row["symbol"]
        price_df = all_price_df[symbol]
        filter = price_df.index + pd.Timedelta(sim_frame) <= time
        price = price_df[filter]["close"].iloc[-1]
