"""自动化测试脚本 - 验证训练和推理流程"""
import requests
import time
import json

BASE_URL = "http://localhost:8000"

def print_section(title):
    print(f"\n{'='*50}")
    print(f"  {title}")
    print(f"{'='*50}")

def test_datasets_api():
    """测试数据集API"""
    print_section("1. 测试数据集API")

    # 获取数据集列表
    response = requests.get(f"{BASE_URL}/api/datasets")
    assert response.status_code == 200, f"Failed: {response.text}"
    data = response.json()
    assert 'datasets' in data
    datasets = data['datasets']

    print(f"✓ 获取到 {len(datasets)} 个数据集")
    for ds in datasets[:3]:
        print(f"  - {ds['name']}: {ds['description']}")

    # 测试获取具体数据集
    dataset_name = datasets[0]['name']
    response = requests.get(f"{BASE_URL}/api/datasets/{dataset_name}")
    assert response.status_code == 200
    dataset = response.json()

    print(f"\n✓ 加载数据集 {dataset_name}:")
    print(f"  训练样本: {len(dataset['train_inputs'])}")
    print(f"  测试样本: {len(dataset['test_inputs'])}")
    print(f"  特征数: {dataset['metadata']['features']}")

    return dataset_name

def test_create_model(dataset_name):
    """测试创建模型"""
    print_section("2. 测试创建模型")

    request_data = {
        "config": {
            "layers": [
                {"units": 8, "activation": "relu", "use_bias": True},
                {"units": 4, "activation": "relu", "use_bias": True},
                {"units": 1, "activation": "sigmoid", "use_bias": True}
            ],
            "optimizer": "adam",
            "learning_rate": 0.01,
            "loss_function": "binaryCrossentropy"
        },
        "dataset_name": dataset_name
    }

    response = requests.post(f"{BASE_URL}/api/training/create", json=request_data)

    if response.status_code != 200:
        print(f"✗ 创建模型失败: {response.text}")
        return None

    data = response.json()
    model_id = data['model_id']
    print(f"✓ 模型创建成功")
    print(f"  模型ID: {model_id}")
    print(f"  输入形状: {data['input_shape']}")

    return model_id

def test_training(model_id):
    """测试训练流程"""
    print_section("3. 测试训练流程")

    # 开始训练（使用少量epoch快速测试）
    request_data = {
        "model_id": model_id,
        "epochs": 5,
        "batch_size": 16,
        "validation_split": 0.2
    }

    print("启动训练...")
    response = requests.post(f"{BASE_URL}/api/training/start", json=request_data)

    if response.status_code != 200:
        print(f"✗ 训练启动失败: {response.text}")
        return False

    print("✓ 训练启动成功，等待完成...")

    # 轮询训练状态
    max_wait = 60  # 最多等待60秒
    start_time = time.time()

    while time.time() - start_time < max_wait:
        response = requests.get(f"{BASE_URL}/api/training/status/{model_id}")
        if response.status_code != 200:
            print(f"✗ 获取状态失败: {response.text}")
            return False

        data = response.json()
        status = data['status']

        if status == 'completed':
            print("✓ 训练完成!")
            history = data.get('history')
            if history:
                print(f"  最终Loss: {history['loss'][-1]:.4f}")
                if history['accuracy']:
                    print(f"  最终Accuracy: {history['accuracy'][-1]*100:.2f}%")
            return True

        elif status == 'error':
            print("✗ 训练出错")
            return False

        elif status == 'training':
            # 显示进度
            history = data.get('history')
            if history and history['loss']:
                current_epoch = len(history['loss'])
                print(f"  训练中... Epoch {current_epoch}, Loss: {history['loss'][-1]:.4f}")

        time.sleep(1)

    print("✗ 训练超时")
    return False

def test_inference(model_id):
    """测试推理"""
    print_section("4. 测试推理")

    request_data = {
        "model_id": model_id,
        "inputs": [0.5, 0.5]
    }

    response = requests.post(f"{BASE_URL}/api/inference/predict", json=request_data)

    if response.status_code != 200:
        print(f"✗ 推理失败: {response.text}")
        return False

    data = response.json()
    print("✓ 推理成功")
    print(f"  预测结果: {data['prediction']}")
    print(f"  中间层数: {len(data['intermediate_outputs'])}")

    for layer_out in data['intermediate_outputs']:
        print(f"  - {layer_out['layer_name']}: shape={layer_out['shape']}, "
              f"样本值=[{', '.join(f'{v:.2f}' for v in layer_out['values'][:3])}]")

    return True

def test_model_info(model_id):
    """测试获取模型信息"""
    print_section("5. 测试获取模型信息")

    response = requests.get(f"{BASE_URL}/api/inference/model/{model_id}")

    if response.status_code != 200:
        print(f"✗ 获取模型信息失败: {response.text}")
        return False

    data = response.json()
    print("✓ 模型信息获取成功")
    print(f"  层数: {len(data['layers'])}")
    for layer in data['layers']:
        print(f"  - {layer['name']}: {layer.get('units', 'N/A')} units, "
              f"activation={layer.get('activation', 'N/A')}")

    return True

def cleanup(model_id):
    """清理测试数据"""
    print_section("6. 清理测试数据")

    response = requests.delete(f"{BASE_URL}/api/training/model/{model_id}")
    if response.status_code == 200:
        print("✓ 模型已删除")
    else:
        print(f"✗ 删除模型失败: {response.text}")

def run_full_test():
    """运行完整测试"""
    print("\n🧪 FNN 训练与推理 API 自动化测试")
    print(f"测试服务器: {BASE_URL}")

    try:
        # 首先检查服务器是否运行
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print("✗ 后端服务器未运行或不健康")
            return
        print("✓ 后端服务器运行正常")
    except requests.exceptions.RequestException:
        print("✗ 无法连接到后端服务器，请确保后端正在运行")
        print("  启动命令: cd backend && uvicorn app.main:app --reload --port 8000")
        return

    model_id = None

    try:
        # 1. 测试数据集API
        dataset_name = test_datasets_api()

        # 2. 测试创建模型
        model_id = test_create_model(dataset_name)
        if not model_id:
            return

        # 3. 测试训练
        if not test_training(model_id):
            return

        # 4. 测试推理
        if not test_inference(model_id):
            return

        # 5. 测试获取模型信息
        test_model_info(model_id)

        print_section("✅ 所有测试通过!")

    except AssertionError as e:
        print(f"\n✗ 测试失败: {e}")
    except Exception as e:
        print(f"\n✗ 测试出错: {e}")
    finally:
        # 清理
        if model_id:
            cleanup(model_id)

if __name__ == "__main__":
    run_full_test()
