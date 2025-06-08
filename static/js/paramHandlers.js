// 全局变量，供其他脚本使用
let chart;

/**
 * 发送参数到服务器获取新数据
 */
function sendParams() {
    const symbol = document.getElementById('symbol').value;
    const timeframe = document.getElementById('timeframe').value;
    const start_date = document.getElementById('start_date').value;
    const end_date = document.getElementById('end_date').value;

    fetch('/update', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({symbol, timeframe, start_date, end_date})
    })
    .then(res => res.json())
    .then(dataList => {
        chart.applyNewData(JSON.parse(dataList));
    })
    .catch(err => alert("error update: " + err));
}
