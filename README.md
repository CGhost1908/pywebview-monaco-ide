# 💻 PyWebview Monaco IDE - AI-Powered Code Editor & Machine Learning Studio

A desktop IDE combining Microsoft's **Monaco Editor** (the engine behind VS Code) with a lightweight **Python pywebview** backend. Features intelligent Gemini AI code completion, an embedded WebSocket terminal, and an interactive AutoML training suite.

---

## 🌟 Key Features

- **Monaco Code Editor**: Full-featured code editor with syntax highlighting, code folding, multi-tab support, and custom themes.
- **Gemini AI Coding Assistant**:
  - Code completion and suggestion generation (`gemini-1.5-flash-8b`).
  - Interactive AI coding assistant panel for debugging and answering questions.
- **Integrated Terminal**: Embedded, real-time command-line terminal powered by asynchronous WebSockets.
- **Live File Explorer**: Tree view of your workspace with real-time file synchronization via `watchdog` and `QFileSystemWatcher`.
- **Built-in Machine Learning Studio (AutoML)**:
  - Train regression and classification models directly on uploaded CSV datasets.
  - Supported algorithms: Linear Regression, Logistic Regression, Decision Trees, Random Forest, K-Nearest Neighbors (KNN), and K-Means Clustering.
  - Automatically evaluate accuracy/loss and export trained model weights (`.pkl`).

---

## 🛠️ Tech Stack

- **Desktop Framework**: `pywebview` (native webview wrapper)
- **Backend**: Python 3.10+, `asyncio`, `websockets`, `watchdog`
- **AI Engine**: Google GenAI SDK (`google-genai` / `gemini-1.5-flash-8b`)
- **Machine Learning**: `scikit-learn`, `pandas`, `numpy`, `joblib`
- **Frontend**: Microsoft Monaco Editor, HTML5, CSS3, JavaScript

---

## 📁 Repository Structure

```text
pywebview-monaco-ide/
├── main.py                 # Core application entrypoint & pywebview JS-API bridge
├── code.js                 # Monaco editor lifecycle & tab management
├── script.js               # UI events, terminal streaming & workspace actions
├── style.css               # Modern dark-mode IDE styles
├── index.html              # Primary application layout
├── models/                 # AutoML training implementations
│   ├── linear_regression.py
│   ├── logistic_regression.py
│   ├── decision_tree.py
│   ├── random_forest.py
│   ├── knn.py
│   └── kmeans.py
├── .env.example            # Environment variable template
└── .gitignore              # Ignored files (build, cache, .env)
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10 or higher
- (Optional) Google Gemini API Key for AI features

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CGhost1908/pywebview-monaco-ide.git
   cd pywebview-monaco-ide
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv
   # Windows:
   .\.venv\Scripts\activate
   # Linux / macOS:
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install pywebview google-genai pandas numpy scikit-learn websockets watchdog PyQt5 chardet requests
   ```

4. **Configure Environment Variables:**
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```
   Set your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. **Start the IDE:**
   ```bash
   python main.py
   ```

---

## 📄 License

This project is licensed under the MIT License.
