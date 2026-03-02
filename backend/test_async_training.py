"""测试异步训练功能"""
import requests
import time

BASE_URL = "http://localhost:8000"

print("🧪 测试异步训练功能\n")

# 1. 创建模型
print("1. 创建模型...")
create_request = {
    "config": {
        "layers": [
            {"units": 8, "activation": "relu", "use_bias": True},
            {"units": 8, "activation": "relu", "use_bias": True},
            {"units": 1, "activation": "sigmoid", "use_bias": True}
        ],
        "optimizer": "adam",
        "learning_rate": 0.01,
        "loss_function": "binaryCrossentropy"
    },
    "dataset_name": "xor"
}

response = requests.post(f"{BASE_URL}/api/training/create", json=create_request)
if response.status_code != 200:
    print(f"✗ 创建模型失败: {response.text}")
    exit(1)

model_id = response.json()['model_id']
print(f"✓ 模型创建成功: {model_id[:8]}...")

# 2. 启动异步训练
print("\n2. 启动异步训练...")
train_request = {
    "model_id": model_id,
    "epochs": 5,
    "batch_size": 32,
    "validation_split": 0.2
}

start_time = time.time()
response = requests.post(f"{BASE_URL}/api/training/start", json=train_request)

if response.status_code != 200:
    print(f"✗ 启动训练失败: {response.text}")
    exit(1)

result = response.json()
print(f"✓ 训练已启动")
print(f"   响应时间: {(time.time() - start_time)*1000:.0f}ms (应该很快，因为是异步)")
print(f"   状态: {result['status']}")

# 3. 轮询获取进度
print("\n3. 轮询训练进度...")
max_wait = 60
start_time = time.time()
last_epoch = 0

while time.time() - start_time < max_wait:
    response = requests.get(f"{BASE_URL}/api/training/status/{model_id}")
    if response.status_code != 200:
        print(f"✗ 获取状态失败: {response.text}")
        break

    data = response.json()
    status = data['status']
    history = data.get('history')

    if history and history['loss']:
        current_epoch = len(history['loss'])
        if current_epoch > last_epoch:
            print(f"   Epoch {current_epoch}/{5} - Loss: {history['loss'][-1]:.4f}", end='')
            if history['accuracy']:
                print(f", Acc: {history['accuracy'][-1]*100:.1f}%")
            else:
                print()
            last_epoch = current_epoch

    if status == 'completed':
        print(f"\n✓ 训练完成!")
        break
    elif status == 'error':
        print(f"\n✗ 训练出错: {data.get('message', 'Unknown error')}")
        break
    elif status == 'stopped':
        print(f"\n⚠ 训练已停止")
        break

    time.sleep(0.5)

# 4. 清理
requests.delete(f"{BASE_URL}/api/training/model/{model_id}")
print("\n✓ 测试完成!")
