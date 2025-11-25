#!/bin/bash

set -e

echo "开始构建和部署..."

# 清理旧的构建文件
rm -rf dist-deploy

# 创建部署目录
mkdir -p dist-deploy

# 构建示例项目
echo "构建示例项目..."
cd packages/example
pnpm build
cd ../..

# 复制示例项目到部署目录根路径
echo "复制示例项目..."
cp -r packages/example/dist/* dist-deploy/

# 构建文档站点
echo "构建文档站点..."
cd packages/docs
pnpm build
cd ../..

# 复制文档站点到 /docs 子路径
echo "复制文档站点..."
mkdir -p dist-deploy/docs
cp -r packages/docs/.vitepress/dist/* dist-deploy/docs/

# 创建 .nojekyll 文件（GitHub Pages 需要）
touch dist-deploy/.nojekyll

# 部署到 gh-pages
echo "部署到 GitHub Pages..."
cd dist-deploy
git init
git add -A
git commit -m "Deploy to GitHub Pages"
git push -f git@github.com:wh131462/react-file-preview.git main:gh-pages

cd ..
rm -rf dist-deploy

echo "部署完成！"
echo "示例站点: https://wh131462.github.io/react-file-preview/"
echo "文档站点: https://wh131462.github.io/react-file-preview/docs/"

