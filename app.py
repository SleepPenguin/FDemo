from flask import Flask, jsonify, request
from flask_cors import CORS
import ccxt
import utils
import os
from utils import config, analyze
from data.exg import Exchange

app = Flask(__name__)
CORS(app)  # 启用CORS支持
exg = Exchange()


@app.route("/api/kline", methods=["POST"])
def get_kline():
    req = request.get_json()
    symbol = req.get("symbol")
    timeframe = req.get("timeframe")
    start_date = req.get("startDate")
    end_date = req.get("endDate")
    print(
        f"receive update symbol: {symbol}, timeframe: {timeframe}, start: {start_date}, end: {end_date}"
    )
    start = ccxt.Exchange.parse8601(start_date + " 00:00:00")
    end = ccxt.Exchange.parse8601(end_date + " 23:59:59")
    time_grid = utils.grid_time(timeframe, start, end)
    max_render_lines = 5000
    if len(time_grid) > max_render_lines:
        print("df too long, only render small part")
        start = time_grid[-max_render_lines]
        end = time_grid[-1]
    df = exg.get_kline(symbol, timeframe, start, end)
    data = utils.df2chart_json(df)
    return jsonify(data)


@app.route("/api/timeframes")
def get_timeframes():
    timeframes = list(exg.exchange.timeframes.keys())
    return jsonify(timeframes)


@app.route("/api/symbols")
def get_symbols():
    symbols = exg.exchange.symbols
    return jsonify(symbols)


@app.route("/api/backtest_file_path")
def get_backtest_files():
    files = os.listdir(config.LOG_PATH)
    res = [
        os.path.join(config.LOG_PATH, file) for file in files if file.endswith(".zip")
    ]
    return jsonify(res)


@app.route("/api/position_structure")
def get_position_structure():
    file_path = request.args.get("file_path")
    print("receive request position_structure", file_path)
    return jsonify(analyze.get_position_structure(file_path))


@app.route("/api/pnl")
def get_pnl():
    file_path = request.args.get("file_path")
    resolution = request.args.get("resolution", "1d")
    print("receive request pnl", file_path, resolution)
    return jsonify(analyze.get_pnl(exg, file_path, resolution))


if __name__ == "__main__":
    app.run(debug=True)
