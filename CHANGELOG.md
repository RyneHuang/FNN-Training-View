# Changelog

All notable changes to FNN Training View will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-03-02

### 🎉 Major Release - Multi-User Session Isolation

This release introduces complete multi-user support for classroom deployment scenarios.

### ✨ Added

#### Multi-User Support
- **Session Isolation**: Complete data isolation between users via HTTP-Only cookies
- **Parallel Training**: Multiple users can train different models simultaneously
- **Inference Isolation**: Users can only access their own trained models
- **Automatic Session Management**: No login required, auto-generated session IDs

#### Backend Architecture
- `backend/app/middleware/session.py` - Session middleware for automatic session generation
- `backend/app/api/dependencies.py` - FastAPI dependency injection for session_id
- Modified `backend/app/utils/model.py` - Nested dictionary structure for session-scoped models
- All API endpoints now support session isolation

#### Frontend Updates
- Modified `frontend/src/lib/api.ts` - Added `credentials: 'include'` for cookie support
- All API calls now automatically include session cookies

#### Offline Deployment
- Pre-generated all 16 datasets as .npz cache files
- Modified data loaders to prioritize cache, fall back to sklearn
- Complete offline operation support for air-gapped servers

#### Documentation
- `README_EN.md` - Complete English documentation
- `README_部署.md` - Comprehensive deployment guide (Chinese)
- `CONTRIBUTING.md` - Contribution guidelines
- `PUSH_TO_GITHUB.md` - GitHub publishing guide
- GitHub Issue and PR templates

#### Datasets
- Added **breast_cancer** dataset (30 features, 569 samples, 2 classes)
- Added **wine** dataset (13 features, 178 samples, 3 classes)
- Added **california_housing** dataset (8 features, 20640 samples)
- Added **diabetes** dataset (10 features, 442 samples)

### 🔧 Changed
- **Regression Evaluation**: Removed accuracy metric for regression problems (now loss-only)
- **Frontend Display**: Accuracy only shown for classification datasets
- **All Regression Datasets**: Added MinMaxScaler normalization for better training
- **Network Configuration**: Auto-sync to store when layers change

### 🎨 Improved
- **TrainingAdvice Component**: Real-time training guidance with context-aware suggestions
- **Overfitting Detection**: Automatic warnings when validation loss increases
- **Dataset Descriptions**: Added background information and feature meanings
- **API Documentation**: Enhanced OpenAPI docs with session parameters

### 📦 Files Added
- 88 source files (Python + React)
- 16 dataset cache files (.npz format)
- 6 documentation files
- 4 GitHub template files

### 📊 Statistics
- **Total Lines of Code**: ~8,000
- **Languages**: Python (50%), TypeScript (40%), Other (10%)
- **Supported Datasets**: 16 (9 classification + 7 regression)

---

## [1.0.0] - 2025-02-XX

### ✨ Initial Release

#### Core Features
- **16 Built-in Datasets**: Logic gates, Iris, MNIST simple, moons, circles
- **Real-time Training**: Live Loss/Accuracy visualization
- **Network Visualization**: Vertical layout with configurable layers
- **Inference Analysis**: Layer-wise activation display
- **Dataset Table View**: Excel-style data browsing
- **Recommended Configurations**: Pre-configured optimal networks per dataset

#### Technology Stack
- **Backend**: Python 3.9+, FastAPI, TensorFlow/Keras 2.15, scikit-learn
- **Frontend**: React 18, TypeScript, Vite, Zustand, Recharts, Tailwind CSS

#### Supported Configurations
- Hidden layers: 0-5
- Neurons per layer: 1-128
- Activations: ReLU, Sigmoid, Tanh, Linear, Softmax, Leaky ReLU
- Optimizers: Adam, SGD, RMSprop, Adamax
- Loss functions: MSE, Binary/Categorical Crossentropy

---

## 🔄 Version History Summary

| Version | Date | Major Changes |
|---------|------|---------------|
| 2.0.0 | 2025-03-02 | Multi-user session isolation, offline deployment |
| 1.0.0 | 2025-02-XX | Initial release with single-user support |

---

## 📝 Notes

### Version Numbering
- **Major** (X.0.0): Breaking changes, major features
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, small improvements

### Upcoming Features
- [ ] User authentication (optional, for classroom management)
- [ ] Model sharing between students
- [ ] Training history and comparison
- [ ] Additional activation functions (ELU, SELU, Swish)
- [ ] Dropout regularization support
- [ ] Batch normalization visualization
- [ ] Export trained models
- [ ] Import custom datasets

---

## 🙏 Contributing

Want to contribute? Check out [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines!
