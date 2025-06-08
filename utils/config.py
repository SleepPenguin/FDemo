import yaml

with open('config.yml', 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

DB_NAME = 'dolphindb'
DB_HOST = config[DB_NAME]['host']
DB_PORT = int(config[DB_NAME]['port'])
DB_USER = config[DB_NAME]['user']
DB_PASSWD = config[DB_NAME]['passwd']
