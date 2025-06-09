/**
 * 初始化图表并设置事件处理
 */
const subscriptNumbers = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉'
}


window.onload = function () {
    // 初始化图表
    chart = klinecharts.init('chart', {timezone: 'UTC'});
    chart.setDecimalFold({
        format: value => {
            const vl = `${value}`;
            const reg = new RegExp('\\.0{3,}[1-9][0-9]*$');
            if (reg.test(vl)) {
                const result = vl.split('.');
                const lastIndex = result.length - 1;
                const v = result[lastIndex];
                const match = /0*/.exec(v);
                if (match) {
                    const count = `${match[0].length}`;
                    result[lastIndex] = v.replace(/0*/,
                        `0${count.replace(/\d/,
                            $1 => subscriptNumbers[$1] ?? '')}`);
                    return result.join('.')
                }
            }
            return vl;
        }
    })

    // 添加指标
    chart.createIndicator('VOL', false, {id: 'VOL_pane', height: 150});
    chart.createIndicator('ChangeRate', false, {id: 'candle_pane'});


    // 响应式调整
    window.addEventListener('resize', function () {
        chart.resize();
    });

    // 绑定按钮事件
    document.getElementById('loadButton').addEventListener('click', sendParams);

    // 设置当前日期为默认日期
    setDefaultDates();

    sendParams();
}

document.addEventListener('DOMContentLoaded', function () {
    const timeframeSelect = document.getElementById("timeframe");

    fetch('/api/timeframes')
        .then(response => response.json())
        .then(timeframes => {
            timeframes.forEach(timeframe => {
                const option = document.createElement('md-select-option');
                option.setAttribute('value', timeframe);

                const headline = document.createElement('div');
                headline.setAttribute('slot', 'headline');
                headline.textContent = timeframe;

                option.appendChild(headline);
                timeframeSelect.appendChild(option);
            });
        }).catch(error => console.error('Error fetching timeframes:', error));
})



/**
 * 设置默认日期范围
 */
function setDefaultDates() {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    document.getElementById('end_date').value = formatDate(today);
    document.getElementById('start_date').value = formatDate(oneMonthAgo);
}

/**
 * 格式化日期为YYYY-MM-DD格式
 * @param {Date} date - 要格式化的日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
