import type { SearchModalOptions } from '../types/kline'

export function useSearchModal() {
  const showSearchModal = (options: SearchModalOptions) => {
    const { symbols, onSelect } = options

    // 创建模态框容器
    const modal = document.createElement('div')
    modal.className = 'search-modal'
    modal.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
    `

    // 创建模态框内容
    const modalContent = document.createElement('md-elevated-card')
    modalContent.className = 'search-modal-content'
    modalContent.style.cssText = `
      min-width: 350px;
      max-width: 500px;
      max-height: 80vh;
      padding: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 16px;
      border-radius: 16px;
      background-color: #ffffff;
    `

    // 创建搜索输入框
    const searchField = document.createElement('md-outlined-text-field')
    searchField.setAttribute('type', 'text')
    searchField.setAttribute('label', 'Search symbol')
    searchField.style.width = '100%'

    const searchIcon = document.createElement('md-icon')
    searchIcon.setAttribute('slot', 'leading-icon')
    searchIcon.textContent = 'search'
    searchField.appendChild(searchIcon)

    // 创建结果容器
    const resultsContainer = document.createElement('div')
    resultsContainer.className = 'search-results'
    resultsContainer.style.cssText = `
      overflow-y: auto;
      max-height: 300px;
      padding-right: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      scrollbar-width: thin;
      scrollbar-color: #d4c6f5 transparent;
    `

    // 添加样式
    const styleElement = document.createElement('style')
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
    `
    document.head.appendChild(styleElement)

    modalContent.appendChild(searchField)
    modalContent.appendChild(resultsContainer)
    modal.appendChild(modalContent)
    document.body.appendChild(modal)

    // 自动聚焦
    setTimeout(() => {
      searchField.focus()
    }, 100)

    let selectedIndex = -1
    let resultItems: HTMLElement[] = []

    // 选择项目
    const selectItem = (index: number) => {
      resultItems.forEach(item => {
        item.removeAttribute('selected')
        item.style.backgroundColor = 'transparent'
      })

      if (index >= 0 && index < resultItems.length) {
        selectedIndex = index
        resultItems[selectedIndex].setAttribute('selected', '')
        resultItems[selectedIndex].style.backgroundColor = 'var(--md-sys-color-surface-variant, #e7e0ec)'
        resultItems[selectedIndex].scrollIntoView({
          behavior: 'auto',
          block: 'nearest'
        })
      } else {
        selectedIndex = -1
      }
    }

    // 确认选择
    const confirmSelection = () => {
      if (selectedIndex >= 0 && selectedIndex < resultItems.length) {
        const symbolText = resultItems[selectedIndex].querySelector('.symbol-text')?.textContent
        if (symbolText) {
          onSelect(symbolText)
          document.body.removeChild(modal)
        }
      }
    }

    // 搜索输入事件
    searchField.addEventListener('input', function (this: any) {
      const query = this.value.trim().toLowerCase()

      resultsContainer.innerHTML = ''
      resultItems = []
      selectedIndex = -1

      if (query.length === 0) return

      let matchedSymbols = symbols.filter(sym =>
        sym.toLowerCase().includes(query)
      )

      const totalMatches = matchedSymbols.length
      const hasMoreResults = totalMatches > 100

      if (hasMoreResults) {
        matchedSymbols = matchedSymbols.slice(0, 100)
      }

      if (matchedSymbols.length === 0) {
        const noResult = document.createElement('div')
        noResult.style.cssText = `
          padding: 16px;
          color: var(--md-sys-color-on-surface-variant, #49454f);
          text-align: center;
          font-size: 0.875rem;
        `

        const noResultIcon = document.createElement('md-icon')
        noResultIcon.textContent = 'search_off'
        noResultIcon.style.cssText = `
          display: block;
          margin: 0 auto 8px;
          font-size: 24px;
        `

        const noResultText = document.createElement('span')
        noResultText.textContent = 'No matching symbols found'

        noResult.appendChild(noResultIcon)
        noResult.appendChild(noResultText)
        resultsContainer.appendChild(noResult)
      } else {
        matchedSymbols.forEach((sym, index) => {
          const resultItem = document.createElement('div')
          resultItem.style.cssText = `
            padding: 12px 16px;
            border-radius: 28px;
            cursor: pointer;
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
          `

          const itemIcon = document.createElement('md-icon')
          itemIcon.textContent = 'token'
          itemIcon.style.cssText = `
            margin-right: 16px;
            color: var(--md-sys-color-primary, #6750a4);
            font-size: 20px;
          `

          const itemText = document.createElement('span')
          itemText.className = 'symbol-text'
          itemText.textContent = sym
          itemText.style.flexGrow = '1'

          resultItem.appendChild(itemIcon)
          resultItem.appendChild(itemText)

          resultItem.addEventListener('mouseover', () => {
            selectItem(index)
          })

          resultItem.addEventListener('click', () => {
            onSelect(sym)
            document.body.removeChild(modal)
          })

          resultsContainer.appendChild(resultItem)
          resultItems.push(resultItem)
        })

        if (hasMoreResults) {
          const moreInfo = document.createElement('div')
          moreInfo.style.cssText = `
            padding: 12px 16px;
            color: var(--md-sys-color-on-surface-variant, #49454f);
            font-size: 0.75rem;
            text-align: center;
          `
          moreInfo.textContent = `Showing first 100 of ${totalMatches} results. Type more to narrow down.`
          resultsContainer.appendChild(moreInfo)
        }
      }
    })

    // 键盘事件
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        selectItem(Math.min(selectedIndex + 1, resultItems.length - 1))
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        selectItem(Math.max(selectedIndex - 1, -1))
      } else if (event.key === 'Enter') {
        event.preventDefault()
        confirmSelection()
      } else if (event.key === 'Escape') {
        document.body.removeChild(modal)
      }
    }

    // 点击外部关闭
    const clickHandler = (event: MouseEvent) => {
      if (event.target === modal) {
        document.body.removeChild(modal)
      }
    }

    document.addEventListener('keydown', keyHandler)
    modal.addEventListener('click', clickHandler)

    // 清理事件监听器
    const cleanup = () => {
      document.removeEventListener('keydown', keyHandler)
      modal.removeEventListener('click', clickHandler)
      document.head.removeChild(styleElement)
    }

    modal.addEventListener('remove', cleanup)
  }

  return {
    showSearchModal
  }
} 