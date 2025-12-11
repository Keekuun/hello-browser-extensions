const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

async function generateIcons() {
  const svgPath = path.join(__dirname, 'assets', 'icon.svg')
  const outputPath = path.join(__dirname, 'assets', 'icon.png')
  
  try {
    // 读取SVG文件
    const svgBuffer = fs.readFileSync(svgPath)
    
    // 将SVG转换为128x128的PNG
    await sharp(svgBuffer)
      .resize(128, 128)
      .png()
      .toFile(outputPath)
    
    console.log('Icon generated successfully!')
    console.log(`Output: ${outputPath}`)
    
  } catch (error) {
    console.error('Error generating icon:', error)
  }
}

generateIcons()
