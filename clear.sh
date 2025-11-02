#!/bin/bash

# npm 清理脚本
# 清理 npm install 产生的所有产物和缓存

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 计算目录大小
get_size() {
    if [ -d "$1" ] || [ -f "$1" ]; then
        du -sh "$1" 2>/dev/null | cut -f1
    else
        echo "0"
    fi
}

# 清理函数
clean_directory() {
    local dir_path=$1
    local dir_name=$2
    
    if [ -d "$dir_path" ]; then
        local size=$(get_size "$dir_path")
        print_step "正在删除 $dir_name ($size)..."
        rm -rf "$dir_path"
        print_info "✓ 已删除 $dir_name"
        return 0
    else
        print_warning "✗ $dir_name 不存在，跳过"
        return 1
    fi
}

clean_file() {
    local file_path=$1
    local file_name=$2
    
    if [ -f "$file_path" ]; then
        local size=$(get_size "$file_path")
        print_step "正在删除 $file_name ($size)..."
        rm -f "$file_path"
        print_info "✓ 已删除 $file_name"
        return 0
    else
        print_warning "✗ $file_name 不存在，跳过"
        return 1
    fi
}

# 清理 node_modules
clean_node_modules() {
    clean_directory "node_modules" "node_modules 目录"
}

# 清理 package-lock.json
clean_package_lock() {
    clean_file "package-lock.json" "package-lock.json"
}

# 清理 yarn.lock
clean_yarn_lock() {
    clean_file "yarn.lock" "yarn.lock"
}

# 清理 pnpm-lock.yaml
clean_pnpm_lock() {
    clean_file "pnpm-lock.yaml" "pnpm-lock.yaml"
}

# 清理构建产物
clean_dist() {
    clean_directory "dist" "dist 构建目录"
}

# 清理 Vite 缓存
clean_vite_cache() {
    clean_directory ".vite" ".vite 缓存目录"
    clean_directory "node_modules/.vite" "node_modules/.vite 缓存目录"
}

# 清理其他缓存和临时文件
clean_other() {
    print_step "清理其他缓存和临时文件..."
    
    # .cache 目录
    clean_directory ".cache" ".cache 目录"
    
    # .temp 目录
    clean_directory ".temp" ".temp 目录"
    
    # .turbo 目录 (Turborepo)
    clean_directory ".turbo" ".turbo 目录"
    
    # .next 目录 (Next.js)
    clean_directory ".next" ".next 目录"
    
    # .nuxt 目录 (Nuxt.js)
    clean_directory ".nuxt" ".nuxt 目录"
    
    # coverage 目录 (测试覆盖率)
    clean_directory "coverage" "coverage 目录"
    
    # .nyc_output 目录
    clean_directory ".nyc_output" ".nyc_output 目录"
    
    # npm 缓存清理（可选，需要确认）
    # print_step "清理 npm 全局缓存..."
    # npm cache clean --force 2>/dev/null || true
}

# 显示清理统计
show_summary() {
    echo ""
    print_info "================================================"
    print_info "清理完成！"
    print_info "================================================"
    echo ""
    print_info "已清理的内容："
    echo "  - node_modules/ 目录"
    echo "  - package-lock.json / yarn.lock / pnpm-lock.yaml"
    echo "  - dist/ 构建目录"
    echo "  - .vite/ 缓存目录"
    echo "  - 其他缓存和临时文件"
    echo ""
    print_warning "提示："
    print_warning "  运行 'npm install' 可以重新安装依赖"
    echo ""
}

# 主函数
main() {
    echo "======================================"
    echo "  npm 清理脚本"
    echo "======================================"
    echo ""
    print_warning "此脚本将清理以下内容："
    echo "  - node_modules/ 目录"
    echo "  - package-lock.json"
    echo "  - dist/ 构建目录"
    echo "  - .vite/ 缓存目录"
    echo "  - 其他缓存和临时文件"
    echo ""
    
    read -p "确定要继续吗？(y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "已取消清理操作"
        exit 0
    fi
    
    echo ""
    
    # 显示清理前的总大小
    if [ -d "node_modules" ]; then
        total_size=$(du -sh . 2>/dev/null | cut -f1)
        print_info "当前项目大小: $total_size"
        echo ""
    fi
    
    # 执行清理
    clean_node_modules
    clean_package_lock
    clean_yarn_lock
    clean_pnpm_lock
    clean_dist
    clean_vite_cache
    clean_other
    
    show_summary
}

# 运行主函数
main

