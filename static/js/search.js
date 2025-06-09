// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function () {
    // 获取搜索按钮并添加点击事件
    const searchButton = document.getElementById('searchSymbol');
    searchButton.addEventListener('click', function () {
        // 创建并显示搜索模态框
        showSearchModal();
    });
});

/**
 * 显示搜索模态框
 */
function showSearchModal() {
    // 创建模态框容器 - 使用半透明背景
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // 半透明背景遮罩
    modal.style.zIndex = '1000';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';

    // 创建模态框内容卡片 - 使用 md-elevated-card
    const modalContent = document.createElement('md-elevated-card');
    modalContent.className = 'search-modal-content';
    modalContent.style.minWidth = '350px';
    modalContent.style.maxWidth = '500px';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.padding = '16px';
    modalContent.style.overflow = 'hidden';
    modalContent.style.display = 'flex';
    modalContent.style.flexDirection = 'column';
    modalContent.style.gap = '16px';
    modalContent.style.borderRadius = '16px';
    modalContent.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    modalContent.style.backgroundColor = '#ffffff'; // 纯白色背景

    // 创建搜索输入框 - 使用 md-outlined-text-field
    const searchField = document.createElement('md-outlined-text-field');
    searchField.type = 'text';
    searchField.label = 'Search symbol';
    searchField.style.width = '100%';

    // 添加前缀图标
    const searchIcon = document.createElement('md-icon');
    searchIcon.slot = 'leading-icon';
    searchIcon.textContent = 'search';
    searchField.appendChild(searchIcon);

    // 创建结果容器
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results';
    resultsContainer.style.overflowY = 'auto';
    resultsContainer.style.maxHeight = '300px';
    resultsContainer.style.paddingRight = '8px';
    resultsContainer.setAttribute('role', 'listbox');
    resultsContainer.style.display = 'flex';
    resultsContainer.style.flexDirection = 'column';
    resultsContainer.style.gap = '2px';

    // 自定义滚动条样式
    resultsContainer.style.scrollbarWidth = 'thin'; // Firefox
    resultsContainer.style.scrollbarColor = '#d4c6f5 transparent'; // Firefox

    // Webkit 浏览器的滚动条样式
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .search-results::-webkit-scrollbar {
            width: 6px;
        }
        .search-results::-webkit-scrollbar-track {
            background: transparent;
        }
        .search-results::-webkit-scrollbar-thumb {
            background-color: #d4c6f5;
            border-radius: 6px;
        }
        .search-results::-webkit-scrollbar-thumb:hover {
            background-color: #b9a2f0;
        }
    `;
    document.head.appendChild(styleElement);

    // 添加所有元素到模态框
    modalContent.appendChild(searchField);
    modalContent.appendChild(resultsContainer);
    modal.appendChild(modalContent);

    // 添加模态框到页面
    document.body.appendChild(modal);

    // 自动聚焦搜索框 - 需要等待组件渲染完成
    setTimeout(() => {
        searchField.focus();
    }, 100);

    // 跟踪当前选中项的索引
    let selectedIndex = -1;
    let resultItems = [];

    // 选择项目的函数
    function selectItem(index) {
        // 首先清除所有已选项的样式
        resultItems.forEach(item => {
            item.removeAttribute('selected');
            item.style.backgroundColor = 'transparent';
            item.setAttribute('aria-selected', 'false');
        });

        // 确保索引在有效范围内
        if (index >= 0 && index < resultItems.length) {
            selectedIndex = index;
            resultItems[selectedIndex].setAttribute('selected', '');
            resultItems[selectedIndex].style.backgroundColor = 'var(--md-sys-color-surface-variant, #e7e0ec)';
            resultItems[selectedIndex].setAttribute('aria-selected', 'true');

            // 确保选中的项在可视区域内
            resultItems[selectedIndex].scrollIntoView({
                behavior: 'auto',
                block: 'nearest'
            });
        } else {
            selectedIndex = -1;
        }
    }

    // 确认选择的函数
    function confirmSelection() {
        if (selectedIndex >= 0 && selectedIndex < resultItems.length) {
            const selectedSymbol = resultItems[selectedIndex].querySelector('.symbol-text').textContent;
            document.getElementById('symbol').value = selectedSymbol;
            document.body.removeChild(modal);
        }
    }

    // 搜索框输入事件
    searchField.addEventListener('input', function () {
        const query = this.value.trim().toLowerCase();

        // 清空之前的结果
        resultsContainer.innerHTML = '';
        resultItems = [];
        selectedIndex = -1;

        if (query.length === 0) {
            return;
        }

        // 在all_symbols中搜索匹配项
        let matchedSymbols = all_symbols.filter(symbol =>
            symbol.toLowerCase().includes(query)
        );

        // 限制最多显示100条结果
        const totalMatches = matchedSymbols.length;
        const hasMoreResults = totalMatches > 100;

        if (hasMoreResults) {
            matchedSymbols = matchedSymbols.slice(0, 100);
        }

        if (matchedSymbols.length === 0) {
            // 使用 Material Design 样式的无结果消息
            const noResult = document.createElement('div');
            noResult.className = 'no-results';
            noResult.style.padding = '16px';
            noResult.style.color = 'var(--md-sys-color-on-surface-variant, #49454f)';
            noResult.style.textAlign = 'center';
            noResult.style.fontSize = '0.875rem';

            const noResultIcon = document.createElement('md-icon');
            noResultIcon.textContent = 'search_off';
            noResultIcon.style.display = 'block';
            noResultIcon.style.margin = '0 auto 8px';
            noResultIcon.style.fontSize = '24px';

            const noResultText = document.createElement('span');
            noResultText.textContent = 'No matching symbols found';

            noResult.appendChild(noResultIcon);
            noResult.appendChild(noResultText);
            resultsContainer.appendChild(noResult);
        } else {
            // 显示搜索结果 - 使用 md-list-item 风格的自定义元素
            matchedSymbols.forEach((symbol, index) => {
                // 创建列表项
                const resultItem = document.createElement('div');
                resultItem.className = 'md-list-item-style';
                resultItem.style.padding = '12px 16px';
                resultItem.style.borderRadius = '28px';
                resultItem.style.cursor = 'pointer';
                resultItem.style.transition = 'background-color 0.2s';
                resultItem.style.display = 'flex';
                resultItem.style.alignItems = 'center';
                resultItem.setAttribute('role', 'option');
                resultItem.setAttribute('aria-selected', 'false');
                resultItem.setAttribute('data-index', index);

                // 添加图标
                const itemIcon = document.createElement('md-icon');
                itemIcon.textContent = 'token';
                itemIcon.style.marginRight = '16px';
                itemIcon.style.color = 'var(--md-sys-color-primary, #6750a4)';
                itemIcon.style.fontSize = '20px';

                // 添加文本
                const itemText = document.createElement('span');
                itemText.className = 'symbol-text';
                itemText.textContent = symbol;
                itemText.style.flexGrow = '1';

                resultItem.appendChild(itemIcon);
                resultItem.appendChild(itemText);

                // 鼠标悬停效果
                resultItem.addEventListener('mouseover', function () {
                    if (selectedIndex !== index) {
                        this.style.backgroundColor = 'var(--md-sys-color-surface-variant-hover, #e6e0ec)';
                    }
                    selectItem(index);
                });

                resultItem.addEventListener('mouseout', function () {
                    if (selectedIndex !== index) {
                        this.style.backgroundColor = 'transparent';
                    }
                });

                // 点击结果项
                resultItem.addEventListener('click', function () {
                    document.getElementById('symbol').value = symbol;
                    document.body.removeChild(modal);
                });

                resultsContainer.appendChild(resultItem);
                resultItems.push(resultItem);
            });

            // 如果有更多结果未显示，添加提示信息
            if (hasMoreResults) {
                const moreResultsInfo = document.createElement('div');
                moreResultsInfo.style.padding = '12px 16px';
                moreResultsInfo.style.color = 'var(--md-sys-color-on-surface-variant, #49454f)';
                moreResultsInfo.style.fontSize = '0.75rem';
                moreResultsInfo.style.textAlign = 'center';
                moreResultsInfo.style.fontStyle = 'italic';
                moreResultsInfo.textContent = `Showing 100 of ${totalMatches} results. Please refine your search for more specific results.`;

                resultsContainer.appendChild(moreResultsInfo);
            }

            // 如果有结果，默认选中第一项
            if (resultItems.length > 0) {
                selectItem(0);
            }
        }
    });

    // 键盘导航事件处理
    searchField.addEventListener('keydown', function (event) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault(); // 防止光标移动
                selectItem(selectedIndex + 1);
                break;
            case 'ArrowUp':
                event.preventDefault(); // 防止光标移动
                selectItem(selectedIndex > 0 ? selectedIndex - 1 : 0);
                break;
            case 'Enter':
                event.preventDefault(); // 防止表单提交
                confirmSelection();
                break;
            case 'Escape':
                event.preventDefault();
                document.body.removeChild(modal);
                break;
        }
    });

    // 点击模态框外部关闭
    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });

    // 全局ESC键关闭模态框
    const escHandler = function (event) {
        if (event.key === 'Escape' && document.body.contains(modal)) {
            document.body.removeChild(modal);
            // 移除这个事件监听器以防内存泄漏
            document.removeEventListener('keydown', escHandler);
        }
    };

    document.addEventListener('keydown', escHandler);
}
