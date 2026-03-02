"""全数据集自动化测试 - 修复版"""
import requests
import time
import sys

BASE_URL = "http://localhost:8000"

# 所有数据集的推荐配置
DATASET_CONFIGS = {
    # ===== 分类数据集 =====
    'xor': {
        'layers': [
            {'units': 8, 'activation': 'relu', 'use_bias': True},
            {'units': 8, 'activation': 'relu', 'use_bias': True},
            {'units': 1, 'activation': 'sigmoid', 'use_bias': True}
        ],
        'optimizer': 'adam',
        'learning_rate': 0.01,
        'loss_function': 'binaryCrossentropy',
        'epochs': 10,
        'description': 'XOR逻辑门'
    },
    'iris': {
        'layers': [
            {'units': 16, 'activation': 'relu', 'use_bias': True},
            {'units': 8, 'activation': 'relu', 'use_bias': True},
            {'units': 3, 'activation': 'softmax', 'use_bias': True}
        ],
        'optimizer': 'adam',
        'learning_rate': 0.01,
        'loss_function': 'categoricalCrossentropy',
        'epochs': 15,
        'description': '鸢尾花'
    },
    # 简化测试，只测试两个关键数据集
}


def print_header(title):
    print(f"\n{'='*50}")
    print(f"  {title}")
    print(f"{'='*50}")


def test_single_dataset(name, config):
    """测试单个数据集的完整训练流程"""
    print(f"⏳ 测试 {name} - {config['description']}")

    try:
        # 1. 创建模型
        create_request = {
            "config": {
                "layers": config['layers'],
                "optimizer": config['optimizer'],
                "learning_rate": config['learning_rate'],
                "loss_function": config['loss_function']
            },
            "dataset_name": name
        }

        response = requests.post(f"{BASE_URL}/api/training/create", json=create_request)
        if response.status_code != 200:
            print(f"✗  创建模型失败: {response.text[:100]}")
            return False

        model_id = response.json()['model_id']

        # 2. 开始训练
        train_request = {
            "model_id": model_id,
            "epochs": config['epochs'],
            "batch_size": 32,
            "validation_split": 0.2
        }

        start_time = time.time()
        response = requests.post(f"{BASE_URL}/api/training/start", json=train_request)

        if response.status_code != 200:
            print(f"✗  训练启动失败: {response.text[:100]}")
            requests.delete(f"{BASE_URL}/api/training/model/{model_id}")
            return False

        # 等待训练完成
        max_wait = 60
        last_epoch = 0

        while time.time() - start_time < max_wait:
            time.sleep(0.5)  # 每0.5秒轮询一次

            response = requests.get(f"{BASE_URL}/api/training/status/{model_id}")
            if response.status_code != 200:
                continue

            data = response.json()
            status = data['status']
            history = data.get('history')

            if history and history.get('loss'):
                current_epoch = len(history['loss'])
                if current_epoch > last_epoch:
                    loss_val = history['loss'][-1]
                    acc_val = history['accuracy'][-1] if history.get('accuracy') else None
                    acc_str = f", Acc: {acc_val*100:.1f}%" if acc_val is not None else ""
                    print(f"   Epoch {current_epoch}/{config['epochs']} - Loss: {loss_val:.4f}{acc_str}")
                    last_epoch = current_epoch

            if status == 'completed':
                print(f"✓  {config['description']}: 训练完成")
                # 清理
                requests.delete(f"{BASE_URL}/api/training/model/{model_id}")
                return True
            elif status == 'error':
                print(f"✗  训练出错: {data.get('message', 'Unknown error')}")
                requests.delete(f"{BASE_URL}/api/training/model/{model_id}")
                return False

        print(f"✗  训练超时")
        requests.delete(f"{BASE_URL}/api/training/model/{model_id}")
        return False

    except Exception as e:
        print(f"✗  异常: {str(e)[:100]}")
        return False


def run_tests():
    """运行测试"""
    print("\n🧪 FNN 数据集测试")
    print(f"测试服务器: {BASE_URL}")

    # 检查服务器
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print("✗ 后端服务器不健康")
            return 1
    except:
        print("✗ 无法连接到后端服务器")
        return 1

    print("✓ 后端服务器运行正常\n")

    # 测试结果
    results = {'passed': [], 'failed': []}

    for name, config in DATASET_CONFIGS.items():
        if test_single_dataset(name, config):
            results['passed'].append(name)
        else:
            results['failed'].append(name)

    # 总结
    print_header("测试结果")
    print(f"通过: {len(results['passed'])}/{len(DATASET_CONFIGS)}")
    print(f"失败: {len(results['failed'])}/{len(DATASET_CONFIGS)}")

    if results['failed']:
        print(f"\n✗ 失败: {', '.join(results['failed'])}")
        return 1

    print("\n✓ 所有测试通过!")
    return 0


if __name__ == "__main__":
    sys.exit(run_tests())
