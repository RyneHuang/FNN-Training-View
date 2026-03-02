# Contributing to FNN Training View

Thank you for your interest in contributing to FNN Training View! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please open an issue using the bug report template with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, Python/Node versions)
- Relevant logs or screenshots

### Suggesting Features

We welcome feature suggestions that align with the project's educational mission. Please use the feature request template and explain:
- The educational value of the feature
- How it would help students learn neural networks
- Your proposed implementation approach

### Submitting Pull Requests

1. **Fork the repository** and create your branch from `master`
2. **Install dependencies**:
   ```bash
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Make your changes** following coding standards below
4. **Test thoroughly** (see Testing section)
5. **Commit with clear message** following commit conventions
6. **Push to your fork** and submit a PR

## 📝 Coding Standards

### Python (Backend)

- Follow PEP 8 style guidelines
- Use type hints for function signatures
- Add docstrings for functions and classes
- Keep functions focused and modular

```python
def load_dataset(name: str) -> Dict:
    """
    Load a dataset by name.

    Args:
        name: The dataset identifier

    Returns:
        Dictionary containing train/test splits

    Raises:
        ValueError: If dataset name is not found
    """
```

### TypeScript (Frontend)

- Use functional components with hooks
- Prefer composition over inheritance
- Use TypeScript strict mode
- Follow React best practices

```typescript
interface ComponentProps {
  datasetName: string;
  onTrain: () => void;
}

export function TrainingComponent({ datasetName, onTrain }: ComponentProps) {
  // Component logic
}
```

### Commit Messages

Follow Conventional Commits format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

**Examples**:
```
feat(training): add early stopping callback

Implement Keras EarlyStopping callback to prevent overfitting
when validation loss doesn't improve for 5 consecutive epochs.

Fixes #123
```

```
fix(inference): handle multi-dimensional input arrays

Previously failed when input had more than 2 dimensions.
Now properly flattens and reshapes tensor data.
```

## 🧪 Testing

### Backend Testing

```bash
cd backend
python test_api.py           # Test API endpoints
python test_all_datasets.py  # Test all dataset loaders
```

### Frontend Testing

Manual testing checklist:
- [ ] Test on Chrome, Firefox, Safari
- [ ] Verify dataset loading
- [ ] Test training with various configurations
- [ ] Check inference visualization
- [ ] Verify multi-user session isolation

### Multi-user Testing

To verify session isolation:
1. Open two different browser windows (incognito)
2. Train different models in each window
3. Verify models don't interfere with each other
4. Verify users can't access each other's models

## 📂 Adding New Datasets

### Classification Dataset

Edit `backend/app/data/classification.py`:

```python
def generate_my_dataset() -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate your custom dataset.

    Returns:
        inputs: (samples, features) array
        labels: (samples, classes) one-hot encoded array
    """
    # Your data generation logic
    pass

def get_all_classification_datasets() -> Dict[str, Dict]:
    return {
        # ... existing datasets
        'my_dataset': {
            'name': 'my_dataset',
            'type': 'classification',
            'description': 'Dataset description',
            'feature_names': ['Feature1', 'Feature2'],
            'generator': generate_my_dataset
        }
    }
```

### Regression Dataset

Edit `backend/app/data/regression.py` similarly, with:
- No one-hot encoding (labels are 1D array)
- Include MinMaxScaler normalization
- Update `get_all_regression_datasets()`

## 🎨 UI/UX Guidelines

- Keep the interface simple and educational
- Avoid overwhelming students with too many options
- Provide helpful tooltips and guidance
- Use loading states for long operations
- Show clear error messages with suggestions

## 📖 Documentation

When adding features:
1. Update relevant README files
2. Add API documentation (docstrings for backend)
3. Update type definitions (TypeScript)
4. Consider adding examples to the docs folder

## 🌐 Internationalization

The project primarily uses Chinese for educational content. When adding:
- User-facing text: Use Chinese
- Code comments: Either English or Chinese
- Technical documentation: Prefer Chinese with English terms
- README_EN.md: English translations

## ⚠️ Common Pitfalls

1. **Forgetting session_id**: All API endpoints must inject session_id for multi-user support
2. **Not normalizing data**: Regression datasets should use MinMaxScaler
3. **Blocking the event loop**: Use threading for long-running training
4. **Memory leaks**: Clean up old models and training threads
5. **CORS issues**: Ensure credentials: 'include' is set in frontend fetch calls

## 📧 Getting Help

If you need help contributing:
- Open a discussion on GitHub
- Check existing issues and PRs
- Read the code comments and docstrings

## 📜 Code of Conduct

Be respectful and constructive:
- Welcome newcomers and help them learn
- Provide feedback in a friendly manner
- Focus on what is best for the educational community
- Show empathy towards other community members

## 🎯 Priority Areas for Contribution

We're particularly interested in contributions for:
1. **More datasets**: Real-world educational datasets
2. **Visualizations**: Additional ways to understand network behavior
3. **Performance**: Optimizations for better concurrency
4. **Accessibility**: Making the app more accessible
5. **Testing**: Automated test coverage
6. **Documentation**: Improving guides and examples

---

Thank you for contributing to FNN Training View! 🎓
