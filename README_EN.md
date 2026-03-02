# FNN Training & Inference Visualization v2.0

A web-based educational application for AI introductory courses, enabling students to intuitively understand the training and inference process of Feedforward Neural Networks (FNN).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18%2B-blue)](https://react.dev/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15-orange)](https://www.tensorflow.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)](https://fastapi.tiangolo.com/)
[![GitHub Stars](https://img.shields.io/github/stars/RyneHuang/FNN-Training-View?style=social)](https://github.com/RyneHuang/FNN-Training-View/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/RyneHuang/FNN-Training-View)](https://github.com/RyneHuang/FNN-Training-View/issues)

[English](README_EN.md) | [简体中文](README.md) | [Deployment Guide](README_部署.md) | [Contributing](CONTRIBUTING.md)

---

## 🎯 Features

### Core Features
- **16 Built-in Datasets**: 9 classification + 7 regression datasets including real-world data
- **Real-time Training Visualization**: Live Loss/Accuracy curves during training
- **Network Architecture Visualization**: Vertical layout showing input → hidden → output layers
- **Layer-wise Inference**: Display activation values and weights for each layer
- **Dataset Table View**: Excel-style data browsing with detailed descriptions

### v2.0 Multi-user Support
- **Session Isolation**: Complete data isolation between users via HTTP-Only cookies
- **Parallel Training**: Multiple users can train simultaneously without interference
- **Offline Deployment**: Pre-generated dataset cache for servers without internet

### Training Guidance
- **Real-time Training Advice**: Context-aware suggestions during training
- **Overfitting Detection**: Automatic warning when validation loss increases
- **Problem-specific Metrics**: Accuracy for classification, Loss for regression

---

## 🛠 Tech Stack

### Backend
- **Python** 3.9+
- **FastAPI** - High-performance async web framework
- **TensorFlow/Keras** 2.15 - Deep learning framework
- **scikit-learn** 1.3.2 - Dataset generation and preprocessing

### Frontend
- **React** 18 with TypeScript
- **Vite** - Lightning-fast build tool
- **Zustand** - Lightweight state management
- **Recharts** - Training curve visualization
- **Tailwind CSS** + **shadcn/ui** - Modern UI components

---

## 📦 Project Structure

```
FNN-Training-View/
├── backend/
│   ├── app/
│   │   ├── api/              # REST API endpoints
│   │   │   ├── datasets.py   # Dataset API
│   │   │   ├── training.py   # Training API (with session isolation)
│   │   │   ├── inference.py  # Inference API
│   │   │   └── dependencies.py # Session injection
│   │   ├── data/
│   │   │   ├── classification.py  # 9 classification datasets
│   │   │   ├── regression.py      # 7 regression datasets
│   │   │   └── cache/             # Pre-generated .npz files
│   │   ├── middleware/
│   │   │   └── session.py     # Session middleware for multi-user
│   │   └── utils/
│   │       └── model.py       # Model manager with nested dictionaries
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DatasetSelector/  # Dataset selection with table view
│   │   │   ├── NeuralNetwork/    # Network configuration panel
│   │   │   ├── Training/         # Training panel with advice
│   │   │   ├── Inference/        # Inference visualization
│   │   │   └── Visualization/    # Charts and network graph
│   │   ├── store/            # Zustand state management
│   │   ├── types/            # TypeScript definitions
│   │   └── pages/            # Main pages
│   └── package.json
│
├── .github/                    # GitHub configuration
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md
├── README.md                   # (Chinese) Project description
├── README_EN.md                # (English) This file
├── README_部署.md              # (Chinese) Deployment guide
├── CONTRIBUTING.md             # Contribution guidelines
├── CHANGELOG.md                # Version history
├── LICENSE                     # MIT License
└── start.sh / start.bat # Startup scripts
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- (Optional) GPU with CUDA support for faster training

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend runs at http://localhost:8000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

### Using Startup Scripts

```bash
# macOS/Linux
./start.sh

# Windows
start.bat
```

---

## 📚 Datasets

### Classification Datasets

| Dataset | Features | Classes | Samples | Difficulty | Description |
|---------|----------|---------|---------|------------|-------------|
| xor | 2 | 2 | 500 | Medium | XOR logic gate |
| and | 2 | 2 | 500 | Easy | AND logic gate |
| or | 2 | 2 | 500 | Easy | OR logic gate |
| iris | 4 | 3 | 150 | Medium | Iris flower classification |
| mnist_simple | 64 | 10 | 1797 | Hard | 8x8 handwritten digits |
| moons | 2 | 2 | 500 | Medium | Two moons dataset |
| circles | 2 | 2 | 500 | Medium | Concentric circles |
| breast_cancer | 30 | 2 | 569 | Hard | Breast cancer diagnosis |
| wine | 13 | 3 | 178 | Medium | Wine classification |

### Regression Datasets

| Dataset | Features | Samples | Difficulty | Description |
|---------|----------|---------|------------|-------------|
| linear | 1 | 500 | Easy | Linear regression y=2x+3 |
| sine | 1 | 500 | Medium | Sine wave fitting |
| polynomial | 1 | 500 | Medium | Polynomial y=0.5x²-2x+1 |
| exponential | 1 | 500 | Medium | Exponential y=e^(0.5x) |
| multilinear | 3 | 500 | Medium | Multiple linear regression |
| california_housing | 8 | 20640 | Hard | California house price prediction |
| diabetes | 10 | 442 | Medium | Diabetes progression prediction |

---

## 🔧 Network Configuration

### Supported Options
- **Hidden Layers**: 0-5 layers
- **Neurons per Layer**: 1-128
- **Activation Functions**: ReLU, Sigmoid, Tanh, Linear, Softmax, Leaky ReLU
- **Optimizers**: Adam, SGD, RMSprop, Adamax
- **Loss Functions**: MSE, Binary Crossentropy, Categorical Crossentropy
- **Learning Rate**: 0.0001 - 0.1
- **Batch Size**: 1 - 128
- **Epochs**: 1 - 1000

### Recommended Configurations

Each dataset has an optimal pre-configured network. Students can modify based on:
- **Underfitting**: Increase layers/neurons, adjust learning rate
- **Overfitting**: Reduce network size, add regularization
- **Slow convergence**: Increase learning rate, change optimizer

---

## 📡 API Endpoints

### Dataset API
- `GET /api/datasets` - List all available datasets
- `GET /api/datasets/{name}` - Get specific dataset

### Training API
- `POST /api/training/create` - Create a new model
- `POST /api/training/start` - Start training
- `POST /api/training/stop` - Stop training
- `GET /api/training/status/{model_id}` - Get training status
- `DELETE /api/training/model/{model_id}` - Delete model

### Inference API
- `POST /api/inference/predict` - Execute inference
- `GET /api/inference/model/{model_id}` - Get model info

Visit http://localhost:8000/docs for interactive API documentation.

---

## 🎓 Usage Workflow

1. **Select Dataset** - Choose from 16 built-in datasets
2. **Configure Network** - Set layers, neurons, activation functions
3. **Apply Config** - Save network configuration
4. **Start Training** - Begin training with real-time visualization
5. **Monitor Progress** - Watch Loss/Accuracy curves, receive advice
6. **Inference** - Test trained model with layer-wise visualization

---

## 🚢 Production Deployment

### Backend (Gunicorn)

```bash
cd backend
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

### Frontend Build

```bash
cd frontend
npm run build
```

Deploy `frontend/dist/` with Nginx or Apache.

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-server.edu;

    # Frontend static files
    location / {
        root /path/to/FNN-Training-View/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cookie_path / /;
    }
}
```

For detailed deployment instructions, see [README_部署.md](README_部署.md).

---

## 🎓 Educational Use Cases

### Classroom Scenarios
- **Lecture Demonstrations**: Live training to show neural network behavior
- **Student Labs**: Individual experimentation with network configurations
- **Comparative Studies**: Compare different architectures on same dataset
- **Debugging Skills**: Learn to diagnose underfitting/overfitting

### Key Learning Outcomes
- Understanding network architecture impact
- Observing training dynamics (loss convergence, overfitting)
- Comparing different activation functions and optimizers
- Relationship between model complexity and generalization

---

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FRyneHuang%2FFNN-Training-View.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FRyneHuang%2FFNN-Training-View?ref=badge_large)

---

## 🙏 Acknowledgments

- TensorFlow and Keras teams for the deep learning framework
- scikit-learn for the excellent dataset collection
- React and Vite communities for modern frontend tools

---

## 📧 Contact

- **GitHub Issues**: [Report a bug](https://github.com/RyneHuang/FNN-Training-View/issues)
- **GitHub Discussions**: [Join discussions](https://github.com/RyneHuang/FNN-Training-View/discussions)

---

## ⭐ Star History

If you find this project helpful, please give us a star!

[![Star History Chart](https://api.star-history.com/svg?repos=RyneHuang/FNN-Training-View&type=Date)](https://star-history.com/#RyneHuang/FNN-Training-View&Date)

---

**Version**: 2.0.0 (Multi-user Support)
**Last Updated**: March 2025
