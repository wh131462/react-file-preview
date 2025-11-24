import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');
const svgPath = path.join(publicDir, 'icon.svg');

async function generateFavicons() {
  try {
    console.log('生成 favicon 文件...');

    // 生成不同尺寸的 PNG
    const sizes = [16, 32, 48, 64, 128, 192, 512];
    
    for (const size of sizes) {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, `icon-${size}.png`));
      console.log(`✓ 生成 icon-${size}.png`);
    }

    // 生成 favicon.ico (使用 32x32)
    await sharp(svgPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));
    console.log('✓ 生成 favicon.ico');

    // 生成 apple-touch-icon.png (180x180)
    await sharp(svgPath)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✓ 生成 apple-touch-icon.png');

    console.log('\n所有 favicon 文件生成完成！');
  } catch (error) {
    console.error('生成 favicon 时出错:', error);
    process.exit(1);
  }
}

generateFavicons();

