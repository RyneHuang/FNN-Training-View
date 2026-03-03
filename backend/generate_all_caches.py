#!/usr/bin/env python3
"""
生成所有数据集缓存文件

用法：
    python generate_all_caches.py

此脚本会生成所有 16 个数据集的缓存文件，用于离线部署。
"""
import os
import sys
import numpy as np
from typing import Dict

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 临时禁用离线模式以生成缓存
os.environ['FNN_OFFLINE_MODE'] = 'false'

from app.data.classification import (
    get_all_classification_datasets, load_classification_dataset,
    CACHE_DIR as CLF_CACHE_DIR
)
from app.data.regression import (
    get_all_regression_datasets, load_regression_dataset,
    CACHE_DIR as REG_CACHE_DIR
)


def ensure_cache_dir():
    """确保缓存目录存在"""
    os.makedirs(CLF_CACHE_DIR, exist_ok=True)
    os.makedirs(REG_CACHE_DIR, exist_ok=True)


def save_cache(dataset_name: str, data: Dict, cache_dir: str):
    """保存数据集到缓存文件"""
    cache_file = os.path.join(cache_dir, f"{dataset_name}.npz")

    # 准备保存的数据
    save_data = {
        'train_inputs': np.array(data['train_inputs']),
        'train_labels': np.array(data['train_labels']),
        'test_inputs': np.array(data['test_inputs']),
        'test_labels': np.array(data['test_labels']),
        'metadata_name': data['metadata']['name'],
        'metadata_type': data['metadata']['type'],
        'metadata_description': data['metadata']['description'],
        'metadata_features': data['metadata']['features'],
        'metadata_samples': data['metadata']['samples'],
        'metadata_featureNames': np.array(data['metadata']['feature_names'])
    }

    # 添加 classes 字段（仅分类数据集）
    if 'classes' in data['metadata']:
        save_data['metadata_classes'] = data['metadata']['classes']

    # 保存到文件
    np.savez_compressed(cache_file, **save_data)

    file_size = os.path.getsize(cache_file)
    return file_size


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
    print("FNN Training View - 生成所有数据集缓存")
    print("=" * 70)
    print()

    ensure_cache_dir()

    total_size = 0
    success_count = 0
    fail_count = 0

    # 获取所有数据集
    clf_datasets = get_all_classification_datasets()
    reg_datasets = get_all_regression_datasets()

    print(f"预期生成 {len(clf_datasets)} 个分类数据集 + {len(reg_datasets)} 个回归数据集")
    print()

    # 生成分类数据集缓存
    print("-" * 70)
    print("【分类数据集】")
    print("-" * 70)

    for name, info in sorted(clf_datasets.items()):
        try:
            print(f"生成 {name:20s} ... ", end='', flush=True)

            # 加载数据集（这会触发生成逻辑）
            data = load_classification_dataset(name)

            # 保存到缓存
            cache_dir = CLF_CACHE_DIR
            file_size = save_cache(name, data, cache_dir)

            size_str = format_size(file_size)
            print(f"✅ {size_str}")

            total_size += file_size
            success_count += 1

        except Exception as e:
            print(f"❌ 失败: {e}")
            fail_count += 1

    # 生成回归数据集缓存
    print()
    print("-" * 70)
    print("【回归数据集】")
    print("-" * 70)

    for name, info in sorted(reg_datasets.items()):
        try:
            print(f"生成 {name:20s} ... ", end='', flush=True)

            # 加载数据集（这会触发生成逻辑）
            data = load_regression_dataset(name)

            # 保存到缓存
            cache_dir = REG_CACHE_DIR
            file_size = save_cache(name, data, cache_dir)

            size_str = format_size(file_size)
            print(f"✅ {size_str}")

            total_size += file_size
            success_count += 1

        except Exception as e:
            print(f"❌ 失败: {e}")
            fail_count += 1

    print()
    print("=" * 70)
    print(f"完成！成功: {success_count}, 失败: {fail_count}")
    print(f"总缓存大小: {format_size(total_size)}")
    print(f"分类缓存目录: {CLF_CACHE_DIR}")
    print(f"回归缓存目录: {REG_CACHE_DIR}")
    print("=" * 70)

    if fail_count == 0:
        print()
        print("✅ 所有缓存文件生成成功！")
        print()
        print("部署步骤：")
        print("1. 运行 python verify_cache.py 验证缓存")
        print("2. 将整个项目目录复制到服务器")
        print("3. 确保服务器设置了环境变量 FNN_OFFLINE_MODE=true")
        return 0
    else:
        print()
        print("❌ 部分缓存文件生成失败，请检查错误信息")
        return 1


if __name__ == '__main__':
    sys.exit(main())
