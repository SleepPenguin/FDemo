// Material Web 组件初始化
export async function initMaterialWeb(): Promise<void> {
  try {
    // 导入所有Material Web组件
    await import('@material/web/all.js')
    
    // 导入Material Web字体样式
    const { styles } = await import('@material/web/typography/md-typescale-styles.js')
    document.adoptedStyleSheets.push(styles.styleSheet)
    
    console.log('Material Web components loaded successfully')
  } catch (error) {
    console.error('Failed to load Material Web components:', error)
    throw error
  }
}

// 确保Material Web组件在DOM中正确注册
export function ensureMaterialWebRegistered(): Promise<void> {
  // 检查是否有Material组件已注册
  const hasMaterialComponents = customElements.get('md-outlined-text-field')
  
  if (!hasMaterialComponents) {
    console.warn('Material Web components not yet registered, initializing...')
    return initMaterialWeb()
  }
  
  return Promise.resolve()
}