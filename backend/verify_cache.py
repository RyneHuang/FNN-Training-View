#!/usr/bin/env python3
"""
缓存验证脚本 - 检查所有数据集缓存文件是否存在

用法：
    python verify_cache.py

在部署到离线服务器前运行此脚本以确保所有缓存文件都已生成。
"""
import os
import sys
import numpy as np

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.data.classification import CACHE_DIR as CLF_CACHE_DIR
from app.data.regression import CACHE_DIR as REG_CACHE_DIR

# 所有预期的数据集
EXPECTED_DATASETS = {
    'classification': [
        'xor', 'and', 'or',
        'iris', 'mnist_simple', 'moons', 'circles',
        'breast_cancer', 'wine'
    ],
    'regression': [
        'linear', 'sine', 'polynomial', 'exponential', 'multilinear',
        'california_housing', 'diabetes'
    ]
}


def check_cache_file(cache_dir: str, dataset_name: str) -> dict:
    """检查单个缓存文件"""
    cache_file = os.path.join(cache_dir, f"{dataset_name}.npz")

    if not os.path.exists(cache_file):
        return {
            'exists': False,
            'size': 0,
            'error': 'File not found'
        }

    try:
        # 尝试加载文件验证完整性
        data = np.load(cache_file, allow_pickle=True)

        # 检查必需的键
        required_keys = ['train_inputs', 'train_labels', 'test_inputs', 'test_labels',
                         'metadata_name', 'metadata_type', 'metadata_description',
                         'metadata_features', 'metadata_samples', 'metadata_featureNames']

        missing_keys = [key for key in required_keys if key not in data]
        if missing_keys:
            return {
                'exists': True,
                'size': os.path.getsize(cache_file),
                'error': f'Missing keys: {missing_keys}'
            }

        file_size = os.path.getsize(cache_file)

        return {
            'exists': True,
            'size': file_size,
            'train_samples': len(data['train_inputs']),
            'test_samples': len(data['test_inputs']),
            'error': None
        }

    except Exception as e:
        return {
            'exists': True,
            'size': os.path.getsize(cache_file),
            'error': str(e)
        }


def format_size(size_bytes: int) -> str:
    """格式化文件大小"""
    for unit in ['B', 'KB', 'MB']:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} GB"


def main():
    """主函数"""
    print("=" * 70)
    print("FNN Training View - 缓存文件验证")
    print("=" * 70)
    print()

    all_ok = True
    total_size = 0

    # 检查缓存目录是否存在
    if not os.path.exists(CLF_CACHE_DIR):
        print(f"❌ 错误：分类数据集缓存目录不存在: {CLF_CACHE_DIR}")
        all_ok = False
    else:
        print(f"✓ 分类缓存目录: {CLF_CACHE_DIR}")

    if not os.path.exists(REG_CACHE_DIR):
        print(f"❌ 错误：回归数据集缓存目录不存在: {REG_CACHE_DIR}")
        all_ok = False
    else:
        print(f"✓ 回归缓存目录: {REG_CACHE_DIR}")

    print()
    print("-" * 70)
    print("数据集缓存检查:")
    print("-" * 70)

    # 检查分类数据集
    print("\n【分类数据集】")
    for dataset_name in EXPECTED_DATASETS['classification']:
        result = check_cache_file(CLF_CACHE_DIR, dataset_name)

        if result['error']:
            print(f"  ❌ {dataset_name:20s} - {result['error']}")
            all_ok = False
        else:
            size_str = format_size(result['size'])
            print(f"  ✅ {dataset_name:20s} - {size_str:10s} "
                  f"(训练: {result['train_samples']}, 测试: {result['test_samples']})")
            total_size += result['size']

    # 检查回归数据集
    print("\n【回归数据集】")
    for dataset_name in EXPECTED_DATASETS['regression']:
        result = check_cache_file(REG_CACHE_DIR, dataset_name)

        if result['error']:
            print(f"  ❌ {dataset_name:20s} - {result['error']}")
            all_ok = False
        else:
            size_str = format_size(result['size'])
            print(f"  ✅ {dataset_name:20s} - {size_str:10s} "
                  f"(训练: {result['train_samples']}, 测试: {result['test_samples']})")
            total_size += result['size']

    print()
    print("-" * 70)
    print(f"总缓存大小: {format_size(total_size)}")
    print(f"预期数据集数量: {len(EXPECTED_DATASETS['classification'] + EXPECTED_DATASETS['regression'])}")
    print()

    if all_ok:
        print("=" * 70)
        print("✅ 所有缓存文件验证通过！可以安全部署到离线服务器。")
        print("=" * 70)
        return 0
    else:
        print("=" * 70)
        print("❌ 缓存文件验证失败！请重新生成缺失的缓存文件。")
        print("=" * 70)
        print()
        print("提示：运行 python generate_all_caches.py 重新生成所有缓存")
        return 1


if __name__ == '__main__':
    sys.exit(main())
