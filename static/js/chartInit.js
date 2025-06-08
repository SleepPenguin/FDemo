/**
 * 初始化图表并设置事件处理
 */
window.onload = function () {
    // 初始化图表
    chart = klinecharts.init('chart', {timezone: 'UTC'});

    // 添加指标
    chart.createIndicator('ChangeRate', false, {id: 'candle_pane'});
    chart.createIndicator('ColorfulVolume', true, {id: 'candle_pane'});

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
