/** 数据集详细简介信息 */
export interface DatasetDescription {
  name: string;
  chineseName: string;
  background: string;      // 背景/来源
  purpose: string;         // 用途/应用场景
  features: {
    name: string;          // 特征名称
    description: string;   // 特征说明
    unit?: string;         // 单位
  }[];
  classes?: {
    value: number;
    label: string;
    description?: string;
  }[];
  notes?: string;          // 额外说明
}

export const DATASET_DESCRIPTIONS: Record<string, DatasetDescription> = {
  // ===== 分类数据集 =====
  'xor': {
    name: 'xor',
    chineseName: '异或逻辑门',
    background: 'XOR（Exclusive OR，异或）是数字逻辑中的基本运算，是神经网络经典的学习问题。XOR 函数的输出在两个输入不同时为 1，相同时为 0。',
    purpose: '用于测试神经网络处理非线性问题的能力。单层感知器无法解决 XOR 问题，需要至少一个隐藏层。',
    features: [
      { name: 'X1', description: '第一个二进制输入', unit: '0或1' },
      { name: 'X2', description: '第二个二进制输入', unit: '0或1' }
    ],
    classes: [
      { value: 0, label: '0', description: '输入相同（0,0或1,1）' },
      { value: 1, label: '1', description: '输入不同（0,1或1,0）' }
    ],
    notes: '最简单的非线性分类问题，是神经网络的"Hello World"'
  },

  'and': {
    name: 'and',
    chineseName: '与逻辑门',
    background: 'AND 是基本逻辑运算之一，只有当所有输入都为 1 时，输出才为 1。',
    purpose: '线性可分问题，用于演示基本的逻辑运算学习。',
    features: [
      { name: 'X1', description: '第一个二进制输入', unit: '0或1' },
      { name: 'X2', description: '第二个二进制输入', unit: '0或1' }
    ],
    classes: [
      { value: 0, label: '0', description: '至少一个输入为0' },
      { value: 1, label: '1', description: '所有输入为1' }
    ],
    notes: '最简单的逻辑运算，单层感知器即可解决'
  },

  'or': {
    name: 'or',
    chineseName: '或逻辑门',
    background: 'OR 是基本逻辑运算之一，只要有一个输入为 1，输出就为 1。',
    purpose: '线性可分问题，用于演示基本的逻辑运算学习。',
    features: [
      { name: 'X1', description: '第一个二进制输入', unit: '0或1' },
      { name: 'X2', description: '第二个二进制输入', unit: '0或1' }
    ],
    classes: [
      { value: 0, label: '0', description: '所有输入为0' },
      { value: 1, label: '1', description: '至少一个输入为1' }
    ],
    notes: '最简单的逻辑运算之一，单层感知器即可解决'
  },

  'iris': {
    name: 'iris',
    chineseName: '鸢尾花数据集',
    background: '由英国统计学家 Ronald Fisher 于 1936 年引入，是模式识别和机器学习领域最著名的数据集之一。数据来源于 Edgar Anderson 测量的三种鸢尾花的形态特征。',
    purpose: '用于多分类问题的基准测试，广泛用于统计分类和机器学习算法的比较研究。',
    features: [
      { name: 'sepal_length', description: '萼片长度', unit: 'cm' },
      { name: 'sepal_width', description: '萼片宽度', unit: 'cm' },
      { name: 'petal_length', description: '花瓣长度', unit: 'cm' },
      { name: 'petal_width', description: '花瓣宽度', unit: 'cm' }
    ],
    classes: [
      { value: 0, label: '山鸢尾 (Setosa)', description: '花朵较小，花瓣分离' },
      { value: 1, label: '变色鸢尾 (Versicolor)', description: '中等大小，花瓣部分重叠' },
      { value: 2, label: '维吉尼亚鸢尾 (Virginica)', description: '花朵最大，花瓣最长' }
    ],
    notes: '共150个样本，每类50个。Setosa 与其他两类完全线性可分，但 Versicolor 和 Virginica 有部分重叠。'
  },

  'mnist_simple': {
    name: 'mnist_simple',
    chineseName: '简化手写数字数据集',
    background: '基于著名的 MNIST 数据集（Mixed National Institute of Standards and Technology），包含 0-9 的手写数字图像。原始 MNIST 包含 60,000 个训练样本和 10,000 个测试样本，每个图像为 28×28 像素。',
    purpose: '计算机视觉和深度学习的基准数据集，用于图像识别和分类任务。',
    features: Array.from({ length: 64 }, (_, i) => ({
      name: `pixel_${i}`,
      description: `图像像素位置 ${Math.floor(i / 8)}×${i % 8}`,
      unit: '灰度值 (0-255)'
    })),
    classes: Array.from({ length: 10 }, (_, i) => ({
      value: i,
      label: `数字 ${i}`,
      description: `手写数字 "${i}"`
    })),
    notes: '简化版本使用 8×8 像素图像，共 1797 个样本。实际应用中通常使用卷积神经网络(CNN)。'
  },

  'moons': {
    name: 'moons',
    chineseName: '月亮数据集',
    background: '合成数据集，生成两个交织的月牙形状分布的点。使用 sklearn 的 make_moons 函数生成，添加少量噪声使其更接近真实情况。',
    purpose: '用于测试非线性分类算法，展示神经网络如何学习非线性决策边界。',
    features: [
      { name: 'X', description: '横坐标', unit: '任意单位' },
      { name: 'Y', description: '纵坐标', unit: '任意单位' }
    ],
    classes: [
      { value: 0, label: '上弯月', description: '上方月牙形状的数据点' },
      { value: 1, label: '下弯月', description: '下方月牙形状的数据点' }
    ],
    notes: '经典的非线性分类问题，需要至少 2 个隐藏层或适当的激活函数来正确分类。'
  },

  'circles': {
    name: 'circles',
    chineseName: '同心圆数据集',
    background: '合成数据集，生成两个同心圆分布的点。外圆是一个类别，内圆是另一个类别。使用 sklearn 的 make_circles 函数生成。',
    purpose: '用于测试神经网络处理复杂非线性边界的能力，展示深度学习的优势。',
    features: [
      { name: 'X', description: '横坐标', unit: '任意单位' },
      { name: 'Y', description: '纵坐标', unit: '任意单位' }
    ],
    classes: [
      { value: 0, label: '外圆', description: '外圆区域的数据点' },
      { value: 1, label: '内圆', description: '内圆区域的数据点' }
    ],
    notes: '比月亮数据集更复杂的非线性问题，通常需要更深的网络或特殊的激活函数（如 tanh）。'
  },

  // ===== 回归数据集 =====
  'linear': {
    name: 'linear',
    chineseName: '线性回归数据集',
    background: '合成数据集，模拟简单的线性关系 y = ax + b，添加少量随机噪声。',
    purpose: '用于演示神经网络学习简单线性关系的能力，以及过拟合问题。',
    features: [
      { name: 'x', description: '输入变量', unit: '任意数值' }
    ],
    notes: '最简单的回归问题，单神经元即可拟合。适合作为回归问题的入门示例。'
  },

  'sine': {
    name: 'sine',
    chineseName: '正弦波数据集',
    background: '合成数据集，基于正弦函数 y = sin(x) 生成，添加少量噪声。',
    purpose: '用于测试神经网络拟合周期性非线性函数的能力。',
    features: [
      { name: 'x', description: '角度/位置', unit: '弧度' }
    ],
    notes: '平滑的非线性函数，需要足够的隐藏神经元和适当的激活函数来拟合。'
  },

  'polynomial': {
    name: 'polynomial',
    chineseName: '多项式回归数据集',
    background: '合成数据集，基于高阶多项式生成，如 y = ax³ + bx² + cx + d。',
    purpose: '用于测试神经网络学习复杂多项式关系的能力。',
    features: [
      { name: 'x', description: '输入变量', unit: '任意数值' }
    ],
    notes: '多项式有多个极值点，需要足够的网络容量来拟合。'
  },

  'exponential': {
    name: 'exponential',
    chineseName: '指数增长数据集',
    background: '合成数据集，基于指数函数 y = a·e^(bx) 生成。',
    purpose: '用于演示神经网络学习快速增长的非线性关系。',
    features: [
      { name: 'x', description: '时间/迭代次数', unit: '任意单位' }
    ],
    notes: '指数增长函数变化剧烈，对网络初始化和学习率敏感。'
  },

  'multilinear': {
    name: 'multilinear',
    chineseName: '多元线性回归数据集',
    background: '合成数据集，模拟多个输入变量与输出的线性关系，如 y = a₁x₁ + a₂x₂ + ... + b。',
    purpose: '用于测试多变量回归问题，演示神经网络处理多维输入的能力。',
    features: [
      { name: 'x1', description: '第一个输入变量', unit: '任意数值' },
      { name: 'x2', description: '第二个输入变量', unit: '任意数值' },
      { name: 'x3', description: '第三个输入变量', unit: '任意数值' }
    ],
    notes: '多变量问题是实际应用中最常见的情况，特征之间的相互作用增加了复杂性。'
  },

  // ===== 新增现实数据集 =====
  'breast_cancer': {
    name: 'breast_cancer',
    chineseName: '乳腺癌数据集',
    background: '来源于威斯康星州临床科学中心，包含 569 个良性或恶性乳腺肿块的细胞特征。这些特征是从数字化图像的细针穿刺（FNA）中计算得出的，描述了细胞核的形态特性。',
    purpose: '经典的医学诊断数据集，用于二分类问题。是机器学习在医学领域应用的基准数据集。',
    features: [
      { name: 'mean_radius', description: '细胞核平均半径', unit: '微米' },
      { name: 'mean_texture', description: '细胞核平均纹理', unit: '灰度值标准差' },
      { name: 'mean_perimeter', description: '细胞核平均周长', unit: '微米' },
      { name: 'mean_area', description: '细胞核平均面积', unit: '平方微米' },
      { name: 'mean_smoothness', description: '细胞核平均平滑度', unit: '局部变化系数' },
      { name: 'mean_compactness', description: '细胞核平均紧密度', unit: '周长²/面积-1' },
      { name: 'mean_concavity', description: '细胞核平均凹度', unit: '凹度严重程度' },
      { name: 'mean_concave_points', description: '细胞核平均凹点', unit: '轮廓凹点数量' },
      { name: 'mean_symmetry', description: '细胞核平均对称性', unit: '对称性指标' },
      { name: 'mean_fractal_dimension', description: '细胞核平均分形维数', unit: '海岸线近似-1' },
      { name: 'radius_se', description: '半径标准误差', unit: '多个测量值的标准差' },
      { name: 'texture_se', description: '纹理标准误差', unit: '灰度值标准差的标准差' },
      { name: 'perimeter_se', description: '周长标准误差', unit: '多个测量值的标准差' },
      { name: 'area_se', description: '面积标准误差', unit: '多个测量值的标准差' },
      { name: 'smoothness_se', description: '平滑度标准误差', unit: '多个测量值的标准差' },
      { name: 'compactness_se', description: '紧密度标准误差', unit: '多个测量值的标准差' },
      { name: 'concavity_se', description: '凹度标准误差', unit: '多个测量值的标准差' },
      { name: 'concave_points_se', description: '凹点标准误差', unit: '多个测量值的标准差' },
      { name: 'symmetry_se', description: '对称性标准误差', unit: '多个测量值的标准差' },
      { name: 'fractal_dimension_se', description: '分形维数标准误差', unit: '多个测量值的标准差' },
      { name: 'worst_radius', description: '最差半径', unit: '最大三个值的平均' },
      { name: 'worst_texture', description: '最差纹理', unit: '最大三个值的平均' },
      { name: 'worst_perimeter', description: '最差周长', unit: '最大三个值的平均' },
      { name: 'worst_area', description: '最差面积', unit: '最大三个值的平均' },
      { name: 'worst_smoothness', description: '最差平滑度', unit: '最大三个值的平均' },
      { name: 'worst_compactness', description: '最差紧密度', unit: '最大三个值的平均' },
      { name: 'worst_concavity', description: '最差凹度', unit: '最大三个值的平均' },
      { name: 'worst_concave_points', description: '最差凹点', unit: '最大三个值的平均' },
      { name: 'worst_symmetry', description: '最差对称性', unit: '最大三个值的平均' },
      { name: 'worst_fractal_dimension', description: '最差分形维数', unit: '最大三个值的平均' }
    ],
    classes: [
      { value: 0, label: '恶性 (Malignant)', description: '癌细胞，需要及时治疗' },
      { value: 1, label: '良性 (Benign)', description: '非癌细胞，健康组织' }
    ],
    notes: '共569个样本（357个良性，212个恶性），30个特征。特征已经过归一化处理到[0,1]范围。这是一个平衡性较好的数据集，准确率可达95%以上。'
  },

  'wine': {
    name: 'wine',
    chineseName: '葡萄酒数据集',
    background: '来源于意大利同一地区但由三个不同种植者生产的葡萄酒的化学分析结果。这些葡萄酒通过13种化学成分的测量结果进行分类。',
    purpose: '用于多分类问题和化学成分分析，展示神经网络在化学数据分析中的应用。',
    features: [
      { name: 'alcohol', description: '酒精含量', unit: '%' },
      { name: 'malic_acid', description: '苹果酸含量', unit: 'g/L' },
      { name: 'ash', description: '灰分含量', unit: 'g/L' },
      { name: 'alcalinity_of_ash', description: '灰分碱度', unit: 'ml' },
      { name: 'magnesium', description: '镁含量', unit: 'mg/L' },
      { name: 'total_phenols', description: '总酚含量', unit: 'mg/L' },
      { name: 'flavanoids', description: '类黄酮含量', unit: 'mg/L' },
      { name: 'nonflavanoid_phenols', description: '非类黄酮酚含量', unit: 'mg/L' },
      { name: 'proanthocyanins', description: '原花青素含量', unit: 'mg/L' },
      { name: 'color_intensity', description: '颜色强度', unit: '吸光度' },
      { name: 'hue', description: '色调', unit: '比色值' },
      { name: 'od280/od315', description: 'OD280/OD315稀释葡萄酒比值', unit: '吸光度比' },
      { name: 'proline', description: '脯氨酸含量', unit: 'mg/L' }
    ],
    classes: [
      { value: 0, label: '类别 1 (Cultivar 1)', description: '来自第一个种植者' },
      { value: 1, label: '类别 2 (Cultivar 2)', description: '来自第二个种植者' },
      { value: 2, label: '类别 3 (Cultivar 3)', description: '来自第三个种植者' }
    ],
    notes: '共178个样本，每类59、71、48个。特征已经过归一化处理到[0,1]范围。这是一个类别相对平衡的多分类数据集。'
  },

  'california_housing': {
    name: 'california_housing',
    chineseName: '加利福尼亚房价数据集',
    background: '来源于 1990 年美国加州人口普查数据，包含加州各地区房屋的中位数。目标是预测房屋价值，基于房屋的地理位置、人口统计和房屋特征。',
    purpose: '经典的房价预测回归问题，用于展示神经网络在房地产估价等实际应用中的能力。',
    features: [
      { name: 'MedInc', description: '地区收入中位数', unit: '万美元' },
      { name: 'HouseAge', description: '房龄中位数', unit: '年' },
      { name: 'AveRooms', description: '平均房间数', unit: '间' },
      { name: 'AveBedrms', description: '平均卧室数', unit: '间' },
      { name: 'Population', description: '人口数量', unit: '人' },
      { name: 'AveOccup', description: '平均入住率', unit: '人/ household' },
      { name: 'Latitude', description: '纬度', unit: '度' },
      { name: 'Longitude', description: '经度', unit: '度' }
    ],
    notes: '共20640个样本，8个特征。目标变量已归一化到[0,1]范围。这是一个大规模的实际数据集，适合测试回归模型的性能。注意：波士顿房价数据集因伦理问题已被 sklearn 替换为此数据集。'
  },

  'diabetes': {
    name: 'diabetes',
    chineseName: '糖尿病数据集',
    background: '来源于糖尿病研究，包含 442 位糖尿病患者的基线数据。目标是预测在一年后疾病进展的定量测量，这是一个经典的基础疾病进展指标。',
    purpose: '医学领域的回归问题，用于演示神经网络在疾病预测和医疗分析中的应用。',
    features: [
      { name: 'age', description: '年龄', unit: '岁' },
      { name: 'sex', description: '性别', unit: '编码值' },
      { name: 'bmi', description: '体重指数', unit: 'kg/m²' },
      { name: 'blood_pressure', description: '平均血压', unit: 'mm Hg' },
      { name: 's1', description: 'TC总胆固醇', unit: 'mg/dl' },
      { name: 's2', description: 'LDL低密度脂蛋白', unit: 'mg/dl' },
      { name: 's3', description: 'HDL高密度脂蛋白', unit: 'mg/dl' },
      { name: 's4', description: 'TCH总胆固醇/_hdl', unit: '比值' },
      { name: 's5', description: 'LTG空腹血清甘油三酯', unit: 'mg/dl' },
      { name: 's6', description: 'GLU血糖水平', unit: 'mg/dl' }
    ],
    notes: '共442个样本，10个特征。所有特征已归一化到[0,1]范围，目标变量也经过归一化处理。这是一个小规模但信息丰富的医学回归数据集。'
  }
};
