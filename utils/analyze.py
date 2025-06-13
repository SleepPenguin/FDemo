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
        with zipf.open("trade.csv") as trade_file:
            trade_df = pd.read_csv(trade_file)
        config_dict = json.load(zipf.open("config.json"))
    trade_df["time"] = pd.to_datetime(trade_df["time"])
    trade_df.set_index("time", inplace=True)
    return trade_df, config_dict


def get_position_structure(zip_filepath):
    """
    通过交易记录复现持仓结构，输出字典{time: {"before": {"base": wallet, symbol: amount}, "after": {"base": wallet, symbol: amount}}}
    表示time时间前后的持仓结构，需要注意trade.csv中可能存在重复时间点，需要合并
    """
    # 读取并预处理交易数据
    trade_df, _ = get_trade_df_config_dict(zip_filepath)
    # 初始化持仓结构
    position_dict = {}
    current_position = defaultdict(float)
    # 按时间分组，依次处理每个时间点的所有交易
    for time, group in trade_df.groupby(trade_df.index):
        before_position = dict(current_position)  # 处理前快照
        for _, row in group.iterrows():
            if row["side"] == "buy":
                before_position["base"] = float(row["wallet"]) + float(row["cost"])
                current_position[row["symbol"]] += float(row["amount"])
                current_position["base"] = float(row["wallet"])
            elif row["side"] == "sell":
                before_position["base"] = float(row["wallet"]) - float(row["cost"])
                current_position[row["symbol"]] -= float(row["amount"])
                current_position["base"] = float(row["wallet"])
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
