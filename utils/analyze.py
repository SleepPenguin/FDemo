import pandas as pd
from collections import defaultdict


def get_position_structure(filepath):
    """
    通过交易记录复现持仓结构，输出字典{time: {"before": {"base": wallet, symbol: amount}, "after": {"base": wallet, symbol: amount}}}
    表示time时间前后的持仓结构

    Args:
        filepath: 交易记录CSV文件路径

    Returns:
        dict: 按时间索引的持仓结构字典，包含交易前后状态
    """
    # 读取并预处理交易数据
    trade_df = pd.read_csv(filepath)
    trade_df["time"] = pd.to_datetime(trade_df["time"])
    trade_df.set_index("time", inplace=True)

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
