import yaml
import os

LOG_PATH = "logs"
if not os.path.exists(LOG_PATH):
    os.makedirs(LOG_PATH)


with open("config.yml", "r", encoding="utf-8") as f:
    config = yaml.safe_load(f)

DB_NAME = "dolphindb"
DB_HOST = config[DB_NAME]["host"]
DB_PORT = int(config[DB_NAME]["port"])
DB_USER = config[DB_NAME]["user"]
DB_PASSWD = config[DB_NAME]["passwd"]

TRADE_CSV_NAME = "trade.csv"
TRADE_CSV_HEADER = ["time", "symbol", "side", "type", "amount", "price", "cost", "wallet", "tag"]

HTTPS_PROXY = config["proxy"]["https"]