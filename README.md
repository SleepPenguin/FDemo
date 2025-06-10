# FDemo

一个基于Vue 3 + TypeScript的前端和Flask后端的加密货币K线图展示应用。

## 项目结构

```bash
FDemo/
├── web/                # 前端Vue项目
│   ├── src/           # Vue源代码
│   └── package.json   # 前端依赖配置
├── app.py             # Flask后端入口
├── requirements.txt   # Python依赖
└── README.md         # 项目说明
```

## 启动说明

### 后端

1. 创建并激活Python虚拟环境（可选）：

   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

2. 安装依赖：

   ```bash
   pip install -r requirements.txt
   ```

3. 启动后端服务：

   ```bash
   python app.py
   ```

### 前端

1. 进入前端项目目录：

   ```bash
   cd web
   ```

2. 安装依赖：

   ```bash
   npm install
   ```

3. 启动开发服务器：

   ```bash
   npm run dev
   ```

## 使用说明

1. 在浏览器中访问 <http://localhost:5173>
2. 选择交易对、时间周期和日期范围
3. 点击"Load"按钮加载K线数据

数字货币K线图展示与自定义指标展示

基于ccxt获取历史数据

dolphindb缓存历史数据

js渲染K线至网页
