#!/bin/bash

# 验证构建脚本
# 用于在发布前验证所有构建是否正常

set -e  # 遇到错误立即退出

echo "🔍 开始验证构建..."
echo ""

# 清理旧的构建
echo "📦 清理旧的构建..."
rm -rf lib dist
echo "✅ 清理完成"
echo ""

# 构建库
echo "🏗️  构建库..."
npm run build:lib
echo "✅ 库构建完成"
echo ""

# 检查库文件
echo "🔍 检查库文件..."
required_files=(
  "lib/index.mjs"
  "lib/index.cjs"
  "lib/index.css"
  "lib/index.d.ts"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file 不存在"
    exit 1
  fi
done
echo ""

# 检查类型定义文件
echo "🔍 检查类型定义文件..."
d_ts_count=$(find lib -name "*.d.ts" | wc -l)
echo "  找到 $d_ts_count 个类型定义文件"
if [ "$d_ts_count" -lt 5 ]; then
  echo "  ❌ 类型定义文件数量不足"
  exit 1
fi
echo "  ✅ 类型定义文件完整"
echo ""

# 构建演示应用
echo "🏗️  构建演示应用..."
npm run build:demo
echo "✅ 演示应用构建完成"
echo ""

# 检查演示应用文件
echo "🔍 检查演示应用文件..."
if [ -f "dist/index.html" ]; then
  echo "  ✅ dist/index.html"
else
  echo "  ❌ dist/index.html 不存在"
  exit 1
fi
echo ""

# 测试打包
echo "📦 测试 npm 打包..."
npm pack --dry-run > /tmp/npm-pack-output.txt 2>&1
total_files=$(grep "total files:" /tmp/npm-pack-output.txt | awk '{print $NF}')
echo "  包含 $total_files 个文件"
if [ "$total_files" -lt 30 ]; then
  echo "  ❌ 打包文件数量不足"
  exit 1
fi
echo "  ✅ 打包测试通过"
echo ""

# 显示包大小
echo "📊 包大小信息:"
package_size=$(grep "package size:" /tmp/npm-pack-output.txt | awk '{print $4, $5}')
unpacked_size=$(grep "unpacked size:" /tmp/npm-pack-output.txt | awk '{print $4, $5}')
echo "  打包后: $package_size"
echo "  解压后: $unpacked_size"
echo ""

# 检查 package.json 配置
echo "🔍 检查 package.json 配置..."
if grep -q '"main": "./lib/index.cjs"' package.json; then
  echo "  ✅ main 字段正确"
else
  echo "  ❌ main 字段不正确"
  exit 1
fi

if grep -q '"module": "./lib/index.mjs"' package.json; then
  echo "  ✅ module 字段正确"
else
  echo "  ❌ module 字段不正确"
  exit 1
fi

if grep -q '"types": "./lib/index.d.ts"' package.json; then
  echo "  ✅ types 字段正确"
else
  echo "  ❌ types 字段不正确"
  exit 1
fi
echo ""

echo "✅ 所有验证通过！"
echo ""
echo "📝 下一步:"
echo "  1. 更新版本号: npm version patch|minor|major"
echo "  2. 发布到 npm: pnpm pub"
echo "  3. 部署演示应用: pnpm deploy"
echo ""

