from fastapi import FastAPI, HTTPException
from MyAgents.DataFetcher import DataFetcherAgent
from MyAgents.Analyst import AnalysisAgent
from MyAgents.TechnicalAnalyst import TechnicalAnalysisAgent
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any,List
from langgraph.graph import StateGraph
from pydantic import BaseModel
import uvicorn
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from MyAgents.predictionAgent import PredictionAgent

app = FastAPI()

class StockAnalysisState(BaseModel):
    company_name: str
    symbol: str
    raw_data: Optional[Dict[str, Any]] = Field(default=None)
    financial_analysis: Optional[Dict[str, Any]] = Field(default=None)
    technical_analysis: Optional[Dict[str, Any]] = Field(default=None)
    summary: Optional[str] = Field(default=None)

def fetch_data(state: StockAnalysisState) -> StockAnalysisState:
    raw = DataFetcherAgent(state.company_name)
    return state.copy(update={"raw_data":raw})

def run_financial_analysis(state: StockAnalysisState) -> StockAnalysisState:
    # print("retrieved data is : ",state.raw_data)
    latest_price = state.raw_data["historical_prices"]["Close"].iloc[-1]
    print("Latest Close Price:", latest_price)

    result = AnalysisAgent(state.raw_data["financials statement"],latest_price)
    return state.copy(update={"financial_analysis": result})

def run_technical_analysis(state: StockAnalysisState) -> StockAnalysisState:
    TechnicalAnalysisAgent(state.raw_data["historical_prices"])
    
    df = state.raw_data["historical_prices"].tail(10)
    df.index = df.index.strftime("%Y-%m-%d")  # convert datetime index to string for JSON
    reshaped = df.to_dict()  # current format: {col: {date: value}}

    # Reformat: transpose it to a list of {name: date, ...}
    dates = list(next(iter(reshaped.values())).keys())
    result = []
    for date in dates:
        row = {"name": date}
        for indicator, values in reshaped.items():
            row[indicator] = values[date]
        result.append(row)
    return state.copy(update={"technical_analysis": result})

graph = StateGraph(StockAnalysisState)

graph.add_node("fetch_data", fetch_data)
graph.add_node("financial_analyst", run_financial_analysis)
graph.add_node("technical_analyst", run_technical_analysis)

graph.set_entry_point("fetch_data")

graph.add_edge("fetch_data", "financial_analyst")
graph.add_edge("financial_analyst", "technical_analyst")

graph.set_finish_point("technical_analyst")

stock_graph = graph.compile()

class AnalysisRequest(BaseModel):
    company_name:str
    symbol:str

import numpy as np
import pandas as pd

def convert_to_json_safe(obj):
    if isinstance(obj, dict):
        return {k: convert_to_json_safe(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_json_safe(i) for i in obj]
    elif isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64)):
        return float(obj)
    elif isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    elif isinstance(obj, (pd.Timestamp, pd.DatetimeIndex)):
        return str(obj)
    elif isinstance(obj, pd.DataFrame):
        return convert_to_json_safe(obj.to_dict())
    elif isinstance(obj, pd.Series):
        return convert_to_json_safe(obj.to_dict())
    return obj


class PredictionRequest(BaseModel):
    symbol: str
    days: int = Field(default=7, ge=1, le=30)

# --- NEW: Define the response model for prediction ---
class PredictionResponse(BaseModel):
    ticker: str
    predictions: List[Dict[str, Any]]

prediction_agent = PredictionAgent()

@app.post("/predict-prices", response_model=PredictionResponse)
async def predict_prices(request: PredictionRequest):
    try:
        predicted_prices_list = prediction_agent.predict_future(
            ticker=request.symbol,
            days_to_predict=request.days
        )

        predictions_with_dates = []
        today = datetime.now()
        for i, price in enumerate(predicted_prices_list):
            prediction_date = today + timedelta(days=i + 1)
            predictions_with_dates.append({
                "date": prediction_date.strftime("%Y-%m-%d"),
                "predicted_close": float(price)
            })

        return PredictionResponse(
            ticker=request.symbol,
            predictions=predictions_with_dates
        )
    except (FileNotFoundError, ValueError) as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.post("/run-stock-analysis")
async def run_stock_analysis(request: AnalysisRequest):
    try:
        state = StockAnalysisState(company_name=request.company_name, symbol=request.symbol)
        final_state = stock_graph.invoke(state)
        return convert_to_json_safe({
            "financial_analysis": final_state["financial_analysis"],
            "technical_indicators": final_state["technical_analysis"],
            "company_info": final_state["raw_data"].get("company_info", {}),
            "analyst_recommendations": final_state["raw_data"].get("analyst_recommendations", []),
            "news": final_state["raw_data"].get("news", [])
        })

        # return {
        # "financial_analysis": {
        #     "financial_ratios": {
        #         "EPS": 5.23,
        #         "P/E Ratio": 28.3,
        #         "ROE": 0.19,
        #         "Current Ratio": 1.8,
        #         "Debt-to-Equity": 0.6
        #     },
        #     "summary": {
        #         "Profitability": "Strong",
        #         "Liquidity": "Healthy",
        #         "Solvency": "Stable"
        #     }
        # },
        # "technical_indicators": {
        #     "Day 1": {
        #         "Close": 192.15,
        #         "SMA_20": 190.3,
        #         "EMA_20": 191.1,
        #         "RSI": 58.2
        #     },
        #     "Day 2": {
        #         "Close": 194.52,
        #         "SMA_20": 191.1,
        #         "EMA_20": 192.0,
        #         "RSI": 60.4
        #     },
        #     "Day 3": {
        #         "Close": 196.34,
        #         "SMA_20": 192.2,
        #         "EMA_20": 193.1,
        #         "RSI": 63.7
        #     },
        #     "Day 4": {
        #         "Close": 195.80,
        #         "SMA_20": 193.1,
        #         "EMA_20": 194.0,
        #         "RSI": 61.5
        #     },
        #     "Day 5": {
        #         "Close": 197.21,
        #         "SMA_20": 194.2,
        #         "EMA_20": 195.2,
        #         "RSI": 65.9
        #     }
        # }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

