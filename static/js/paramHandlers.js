// 全局变量，供其他脚本使用
let chart;

let all_symbols;

fetch('/api/symbols')
    .then(response => {
        if (!response.ok) {
            throw new Error('symbol request failed');
        }
        return response.json();
    })
    .then(symbols => {
        all_symbols = symbols;
    })
    .catch(error => {
        console.error('get symbol error:', error);
    });


function showIsLoading() {
    // 获取加载按钮元素
    const loadButton = document.getElementById('loadButton');

    // 存储按钮的原始位置
    const buttonParent = loadButton.parentNode;
    const buttonNextSibling = loadButton.nextSibling;

    // 创建加载指示器
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loadingIndicator';
    loadingIndicator.style.display = 'flex';
    // loadingIndicator.style.alignItems = 'center';
    // loadingIndicator.style.justifyContent = 'center';
    loadingIndicator.style.height = '40px';
    loadingIndicator.innerHTML = `
        <md-circular-progress four-color indeterminate></md-circular-progress>
        <span style="padding: 8px">Loading...</span>
    `;

    // 替换按钮为加载指示器
    loadButton.replaceWith(loadingIndicator);

    // 保存引用以便在完成后恢复
    return function restoreButton() {
        if (document.getElementById('loadingIndicator')) {
            // 如果加载指示器存在，则替换回原按钮
            if (buttonNextSibling) {
                buttonParent.insertBefore(loadButton, buttonNextSibling);
            } else {
                buttonParent.appendChild(loadButton);
            }
            document.getElementById('loadingIndicator').remove();
        }
    };
}


/**
 * 发送参数到服务器获取新数据
 */
function sendParams() {
    const symbol = document.getElementById('symbol').value;
    const timeframe = document.getElementById('timeframe').value;
    const start_date = document.getElementById('start_date').value;
    const end_date = document.getElementById('end_date').value;
    if (!all_symbols.includes(symbol)) {
        // 显示错误消息
        alert('symbol not in exchange');
        return; // 终止函数执行
    }

    // 显示加载状态并获取恢复函数
    const restoreButton = showIsLoading();
    fetch('/update', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({symbol, timeframe, start_date, end_date})
    })
        .then(res => res.json())
        .then(dataList => {
            const data = JSON.parse(dataList);
            // 刷新精度
            chart.setPrecision({price: getDecimalPlaces(data[0]['close'])});
            chart.applyNewData(data);

            // 恢复按钮状态
            restoreButton();
        })
        .catch(err => {
            alert("error update: " + err);

            // 发生错误也要恢复按钮状态
            restoreButton();
        });
}

function getDecimalPlaces(num) {
    if (!isFinite(num)) return 0; // 处理Infinity和NaN
    const str = num.toString();
    if (str.includes('e')) {
        // 处理科学计数法，例如 1e-7
        const [base, exponent] = str.split('e');
        const decimalPlaces = (base.split('.')[1]?.length || 0) - Number(exponent);
        return Math.max(0, decimalPlaces);
    }
    const decimalPart = str.split('.')[1];
    return decimalPart ? decimalPart.length : 0;
}

