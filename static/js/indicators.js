// 注册自定义指标 - 彩色成交量
klinecharts.registerIndicator({
    name: 'ColorfulVolume',
    shortName: 'Chg:',
    zLevel: -1,
    figures: [],
    series: 'price',
    calc: dataList => dataList.map(data => ({volume: data.volume, close: data.close, open: data.open})),
    createTooltipDataSource: ({indicator, crosshair}) => {
        const result = indicator.result;
        const data = result[crosshair.dataIndex];
        if (data) {
            const color = data.open > data.close ? 'rgb(230,16,40)' : 'rgb(9,234,123)';
            const rate = (data.close - data.open) / data.open;
            const percentStr = `${(rate * 100).toFixed(2)}%`;
            return {
                legends: [
                    {title: '', value: {text: percentStr, color}},
                ]
            };
        }
        return {};
    },
    draw: ({ctx, chart, indicator, bounding, xAxis}) => {
        const {realFrom, realTo} = chart.getVisibleRange();
        const {gapBar, halfGapBar} = chart.getBarSpace();
        const {result} = indicator;
        let maxVolume = 0;
        for (let i = realFrom; i < realTo; i++) {
            const data = result[i];
            if (data) {
                maxVolume = Math.max(maxVolume, data.volume);
            }
        }
        const totalHeight = bounding.height * 0.4;
        const Rect = klinecharts.getFigureClass('rect');
        for (let i = realFrom; i < realTo; i++) {
            const data = result[i];
            if (data) {
                const height = Math.round(data.volume / maxVolume * totalHeight);
                const color = data.open > data.close ? 'rgba(234,205,224,0.6)' : 'rgba(206,234,243,0.6)';
                new Rect({
                    name: 'rect',
                    attrs: {
                        x: xAxis.convertToPixel(i) - halfGapBar,
                        y: bounding.height - height,
                        width: gapBar,
                        height
                    },
                    styles: {color}
                }).draw(ctx);
            }
        }
        return true;
    }
});

klinecharts.registerIndicator({
    name: 'ChangeRate',
    shortName: '',
    zLevel: -1,
    figures: [],
    series: 'price',
    calc: dataList => dataList.map(data => ({close: data.close, open: data.open})),
    createTooltipDataSource: ({indicator, crosshair}) => {
        const result = indicator.result;
        const data = result[crosshair.dataIndex];
        if (data) {
            const color = data.open > data.close ? 'rgb(230,16,40)' : 'rgb(9,234,123)';
            const rate = (data.close - data.open) / data.open;
            const percentStr = `${(rate * 100).toFixed(2)}%`;
            return {
                legends: [
                    {title: 'Chg: ', value: {text: percentStr, color}},
                ]
            };
        }
        return {};
    },
});

