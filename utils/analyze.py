import pandas as pd
from utils import ts2ms, tf2ms
from data.exg import Exchange
import zipfile
import json
import ast


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

    config_dict["start_time"] = pd.Timestamp(config_dict["start_time"])
    config_dict["end_time"] = pd.Timestamp(config_dict["end_time"])
    return trade_df, config_dict


def get_position_structure(zip_filepath):
    """
    通过交易记录复现持仓结构，输出列表[{"time": time, "wallet": wallet}]
    表示time时间后的持仓结构，需要注意trade.csv中可能存在重复时间点，需要合并
    """
    # 读取并预处理交易数据
    trade_df, config_dict = get_trade_df_config_dict(zip_filepath)
    start_wallet = config_dict["wallet"]
    start_time = config_dict["start_time"]
    # 初始化持仓结构
    res = [{"time": start_time, "wallet": start_wallet}]
    for time, row in trade_df.iterrows():
        wallet = ast.literal_eval(row["wallet"])
        if time == res[-1]["time"]:
            res[-1]["wallet"] = wallet
        else:
            res.append({"time": time, "wallet": wallet})
    return res


def get_pnl(exg: Exchange, zip_filepath, resolution="1d"):
    """
    通过交易记录获取总资产曲线，输出列表 [{"time": time, "pnl": pnl}]
    确保每个时间网格点都有数据，使用前一个时间点的状态进行填充
    """
    trade_df, config_dict = get_trade_df_config_dict(zip_filepath)
    sim_frame = config_dict["simframe"]
    start_time = config_dict["start_time"]
    end_time = config_dict["end_time"]
    base = config_dict["base"]
    time_grid = pd.date_range(start_time, end_time, freq=resolution)

    all_trade_symbol = trade_df["symbol"].unique()
    start_ms = ts2ms(trade_df.index[0]) - 10 * tf2ms(sim_frame)
    end_ms = ts2ms(trade_df.index[-1]) + 10 * tf2ms(sim_frame)

    all_price_df = {}
    for symbol in all_trade_symbol:
        price_df = exg.get_kline(symbol, resolution, start_ms, end_ms)
        all_price_df[symbol] = price_df

    position_info = get_position_structure(zip_filepath)

    pnl_list = []
    i = 0
    j = 0
    while i < len(time_grid):
        while j < len(position_info) and position_info[j]["time"] <= time_grid[i]:
            pos_info = position_info[j]
            total_value = pos_info["wallet"][base]
            for symbol, amount in pos_info["wallet"].items():
                if symbol != base and amount != 0:
                    price = float(all_price_df[symbol].loc[time_grid[i]]["open"])
                    total_value += amount * price
            pnl_list.append({"time": time_grid[i], "pnl": total_value})
            j += 1
        i += 1
    return pnl_list
