from flask import Flask, render_template, request, jsonify
import ccxt
import utils
from data.exg import Exchange

app = Flask(__name__)
exg = Exchange()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/update", methods=["POST"])
def update():
    req = request.get_json()
    symbol = req.get("symbol", "BTC/USDT")
    timeframe = req.get("timeframe", "1d")
    start = ccxt.Exchange.parse8601(req.get("start_date") + " 00:00:00")
    end = ccxt.Exchange.parse8601(req.get("end_date") + " 23:59:59")
    print(f"receive update symbol: {symbol}, timeframe: {timeframe}, start: {start}, end: {end}")
    time_grid = utils.grid_time(timeframe, start, end)
    max_render_lines = 5000
    if len(time_grid) > max_render_lines:
        print("df too long, only render small part")
        start = time_grid[-max_render_lines]
        end = time_grid[-1]
    df = exg.get_kline(symbol, timeframe, start, end)
    data = utils.df2chart_json(df)
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
