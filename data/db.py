import dolphindb as ddb
from utils import config


class DolphinDB:
    def __init__(self, exchange_name: str):
        self.session = ddb.session(
            config.DB_HOST,
            config.DB_PORT,
            config.DB_USER,
            config.DB_PASSWD,
        )
        self.database = f"dfs://{exchange_name}"
        self.table = "main"
        self.create_all()
        self.appender = ddb.TableAppender(dbPath=self.database, tableName=self.table, ddbSession=self.session)

    def create_all(self):
        self.session.run(f"""
        if (not existsDatabase("{self.database}")) {{
            create database "{self.database}"
            partitioned by VALUE(2015.01M..2035.09M)
            engine='TSDB'
        }}
        """)
        self.session.run(f"""
        if (not existsTable("{self.database}", "{self.table}")) {{
            create table "{self.database}"."{self.table}" (
                datetime DATETIME[compress="delta"]
                symbol SYMBOL
                open DOUBLE
                high DOUBLE
                low DOUBLE
                close DOUBLE
                volume DOUBLE
                timeframe SYMBOL
            )
            partitioned by datetime,
            sortColumns=[`timeframe, `symbol, `datetime],
            keepDuplicates=LAST,
            sortKeyMappingFunction=[, hashBucket{{,500}}]
        }}
        """)

    def fetch(self, symbol: str, timeframe: str, start_datetime=None, end_datetime=None):
        self.session.upload(
            {
                "start_datetime": start_datetime,
                "end_datetime": end_datetime,
            }
        )
        result = self.session.run(f"""
        start_datetime = datetime(start_datetime)
        end_datetime = datetime(end_datetime)
        
        tb = loadTable(database="{self.database}", tableName="{self.table}")
        SELECT datetime, open, high, low, close, volume FROM tb 
        WHERE symbol=="{symbol}", timeframe=="{timeframe}", datetime between start_datetime:end_datetime
        """)
        return result