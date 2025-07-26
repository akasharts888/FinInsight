# FinInsight Agent 📈

FinInsight Agent is an AI-powered financial analysis and prediction tool built with a modern, agentic workflow. This application provides comprehensive stock analysis, including financial ratios, technical indicators, and predictive price forecasting using pre-trained LSTM models.

## ✨ Key Features

  * **Comprehensive Financial Analysis**: Automatically calculates key financial ratios (P/E, ROE, etc.) and provides a summary of a company's profitability, liquidity, and solvency.
  * **Technical Indicator Analysis**: Generates essential technical indicators like Simple Moving Averages (SMA), Exponential Moving Averages (EMA), Relative Strength Index (RSI), and MACD.
  * **AI-Powered Price Prediction**: Uses company-specific, pre-trained LSTM (Long Short-Term Memory) models to forecast future stock prices.
  * **Agentic Workflow**: Built using **LangGraph** to create a robust, multi-agent system where different agents handle data fetching, financial analysis, and technical analysis.
  * **API-First Design**: exposes all functionality through a clean, easy-to-use **FastAPI** backend.

-----

## 🛠️ Tech Stack & Architecture

This project uses a combination of modern data science and backend technologies to deliver its insights.

  * **Backend**: FastAPI
  * **Workflow Orchestration**: LangGraph
  * **Machine Learning**: TensorFlow (Keras) for LSTM models
  * **Data Analysis**: Pandas, NumPy
  * **Data Sourcing**: `yfinance` for price data, `newsapi-python` for news data
  * **Sentiment Analysis**: NLTK (VADER)
  * **API Server**: Uvicorn

-----

## 🚀 Getting Started

Follow these steps to set up and run the FinInsight Agent on your local machine.

### **1. Prerequisites**

  * Python 3.9, 3.10, or 3.11 (**64-bit version is required for TensorFlow**)
  * A free API key from [NewsAPI.org](https://newsapi.org/) for fetching news data.

### **2. Installation**

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/FinInsight-Agent.git
    cd FinInsight-Agent
    ```

2.  **Create and activate a virtual environment:**

      * On Windows:
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```
      * On macOS/Linux:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

3.  **Install the required packages:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Download NLTK VADER Lexicon:**
    Run this command in a Python interpreter once to download the necessary sentiment analysis data:

    ```python
    import nltk
    nltk.download('vader_lexicon')
    ```

### **3. Configuration**

You need to provide your NewsAPI key for the sentiment analysis feature to work.

1.  Create a file named `.env` in the root of the project.
2.  Add your API key to this file like so:
    ```
    NEWS_API_KEY="your_actual_api_key_here"
    ```

### **4. Train the Prediction Models**

Before you can use the prediction endpoint, you need to train the LSTM models for the companies you want to analyze.

  * Open the `train_models.py` script.
  * Update the `company_to_ticker` dictionary with the 50 companies you want to support.
  * Run the script from your terminal:
    ```bash
    python train_models.py
    ```

This will fetch 5 years of data, train a model for each company, and save the `.h5` model and its corresponding scaler file into the `Stock_Prediction_Models/` directory.

### **5. Run the FastAPI Server**

Once the models are trained, you can start the application.

```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

-----

## 📋 API Endpoints

You can interact with the application using the following endpoints.

### **1. Get Stock Analysis**

  * **Endpoint**: `POST /run-stock-analysis`
  * **Description**: Fetches and provides a full financial and technical analysis for a given company.
  * **Request Body**:
    ```json
    {
      "company_name": "Reliance Industries",
      "symbol": "RELIANCE.NS"
    }
    ```
  * **Response**: A JSON object containing financial ratios, summaries, recent technical indicators, company info, and the latest news.

### **2. Predict Future Stock Prices**

  * **Endpoint**: `POST /predict-prices`
  * **Description**: Uses a pre-trained LSTM model to forecast the closing price for a specified number of future days.
  * **Request Body**:
    ```json
    {
      "symbol": "RELIANCE.NS",
      "days": 7
    }
    ```
  * **Response**: A JSON object containing a list of dates and their corresponding predicted closing prices.
    ```json
    {
      "ticker": "RELIANCE.NS",
      "predictions": [
        {
          "date": "2025-07-27",
          "predicted_close": 2985.50
        },
        {
          "date": "2025-07-28",
          "predicted_close": 2991.20
        }
      ]
    }
    ```

-----

## 📂 Project Structure

```
FinInsight Agent/
├── MyAgents/
│   ├── __init__.py
│   ├── Analyst.py
│   ├── DataFetcher.py
│   ├── PredictionAgent.py
│   └── TechnicalAnalyst.py
├── Stock_Prediction_Models/
│   └── (Trained models and scalers will be saved here)
├── main.py
├── train_models.py
├── requirements.txt
├── .env
└── README.md
```

-----

## 🔮 Future Enhancements

  * **Full Sentiment Integration**: Fully integrate the sentiment analysis as a feature in the LSTM models to improve prediction accuracy.
  * **Frontend Interface**: Build a web-based user interface (e.g., using React or Vue.js) to interact with the API.
  * **Database Integration**: Use a database (like PostgreSQL or MongoDB) to store historical data and analysis results, reducing reliance on live API calls.
  * **Dockerization**: Containerize the application with Docker for easier deployment and scalability.
