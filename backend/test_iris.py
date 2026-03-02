"""测试鸢尾花数据集训练"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("🧪 测试鸢尾花数据集训练")

# 1. 加载鸢尾花数据集
print("\n1. 加载鸢尾花数据集...")
response = requests.get(f"{BASE_URL}/api/datasets/iris")
dataset = response.json()
print(f"   训练样本: {len(dataset['train_inputs'])}")
print(f"   标签格式: {type(dataset['train_labels'][0])}")
print(f"   第一个标签: {dataset['train_labels'][0]}")
print(f"   输出类数: {dataset['metadata']['classes']}")

# 2. 创建适合鸢尾花的模型配置
print("\n2. 创建模型...")
request_data = {
    "config": {
        "layers": [
            {"units": 16, "activation": "relu", "use_bias": True},
            {"units": 8, "activation": "relu", "use_bias": True},
            {"units": 3, "activation": "softmax", "use_bias": True}  # 3类输出
        ],
        "optimizer": "adam",
        "learning_rate": 0.01,
        "loss_function": "categoricalCrossentropy"  # 多分类损失
    },
    "dataset_name": "iris"
}

response = requests.post(f"{BASE_URL}/api/training/create", json=request_data)
if response.status_code != 200:
    print(f"   ✗ 创建模型失败: {response.text}")
    exit(1)

data = response.json()
model_id = data['model_id']
print(f"   ✓ 模型创建成功: {model_id}")

# 3. 开始训练
print("\n3. 开始训练...")
train_request = {
    "model_id": model_id,
    "epochs": 10,
    "batch_size": 16,
    "validation_split": 0.2
}

response = requests.post(f"{BASE_URL}/api/training/start", json=train_request)
if response.status_code != 200:
    print(f"   ✗ 训练失败!")
    print(f"   状态码: {response.status_code}")
    print(f"   错误详情: {response.text}")
    exit(1)

data = response.json()
print(f"   ✓ 训练完成!")
print(f"   最终Loss: {data['history']['loss'][-1]:.4f}")
print(f"   最终Accuracy: {data['history']['accuracy'][-1]*100:.2f}%")

# 4. 清理
requests.delete(f"{BASE_URL}/api/training/model/{model_id}")
print("\n✅ 测试完成!")
