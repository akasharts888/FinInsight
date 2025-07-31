from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from MyAgents.Analyst import AnalysisAgent
from MyAgents.TechnicalAnalyst import TechnicalAnalysisAgent
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any,List, Union
from langgraph.graph import StateGraph
from pydantic import BaseModel
import uvicorn
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from MyAgents.DataFetcher import DataFetcherAgent
from MyAgents.predictionAgent import PredictionAgent
from MyAgents.FilingParserAgent import FilingFetcherAgent, FilingParserAgent, FinancialAnalysisAgentSEC
from MyAgents.QueryAgent import queryAgent


app = FastAPI()

class DeepAnalysisState(BaseModel):
    ticker: str
    status: str = "ok"
    error: Optional[str] = None
    fetched_data: Optional[Dict[str, str]] = None
    parsed_data: Optional[Dict[str, Dict[str, float]]] = None
    financial_ratios: Optional[Dict[str, Dict[str, float]]] = None

sec_fetcher = FilingFetcherAgent()
sec_parser = FilingParserAgent()
sec_analyzer = FinancialAnalysisAgentSEC()

def run_sec_fetcher(state: DeepAnalysisState) -> DeepAnalysisState:
    print(f"[{state.ticker}] Running SEC Fetcher Agent...")
    name = state.ticker
    try:
        data = sec_fetcher.fetcher_agent(name)
        if data.get("status") == "Failed":
             return state.copy(update={"status": "Failed", "error": data.get("error")})
        return state.copy(update={"fetched_data": data})
    except Exception as e:
        print("error we get while fetching data : ",e)
        return state.copy(update={"status": "Failed", "error": f"SEC Fetcher failed: {e}"})

def run_sec_parser(state: DeepAnalysisState) -> DeepAnalysisState:
    if state.status == "Failed": return state
    print(f"[{state.ticker}] Running SEC Parser Agent...")
    try:
        parsed_data = sec_parser.parse_filings(state.fetched_data)
        return state.copy(update={"parsed_data": parsed_data})
    except Exception as e:
        print(f"Error during SEC parsing for {state.ticker}: {e}")
        return state.copy(update={"status": "Failed", "error": f"SEC Parser failed: {e}"})

def run_sec_analyzer(state: DeepAnalysisState) -> DeepAnalysisState:
    if state.status == "Failed" or not state.parsed_data: return state
    print(f"[{state.ticker}] Running SEC Analyzer Agent...")
    try:
        ratios = sec_analyzer.analyze_filings(state.parsed_data)
        return state.copy(update={"financial_ratios": ratios})
    except Exception as e:
        print(f"Error during SEC analysis for {state.ticker}: {e}")
        return state.copy(update={"status": "Failed", "error": f"SEC Analyzer failed: {e}"})


deep_analysis_graph = StateGraph(DeepAnalysisState)
deep_analysis_graph.add_node("sec_fetcher", run_sec_fetcher)
deep_analysis_graph.add_node("sec_parser", run_sec_parser)
deep_analysis_graph.add_node("sec_analyzer", run_sec_analyzer)
deep_analysis_graph.set_entry_point("sec_fetcher")
deep_analysis_graph.add_edge("sec_fetcher", "sec_parser")
deep_analysis_graph.add_edge("sec_parser", "sec_analyzer")
deep_analysis_graph.set_finish_point("sec_analyzer")
compiled_deep_graph = deep_analysis_graph.compile()

class DeepAnalysisRequest(BaseModel):
    symbol: str

@app.post("/run-deep-analysis")
async def run_deep_analysis(request: DeepAnalysisRequest):
    # print("data get : ",request)
    try:
        initial_state = DeepAnalysisState(ticker=request.symbol)
        final_state = compiled_deep_graph.invoke(initial_state)

        if final_state.status == "Failed":
            raise HTTPException(status_code=500, detail=final_state.error)

        return {
            "ticker": final_state.ticker,
            "source": "SEC 10-K Filing",
            "extracted_data": final_state.parsed_data,
            "financial_ratios": final_state.financial_ratios
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
    try:
        TechnicalAnalysisAgent(state.raw_data["historical_prices"])
        
        df = state.raw_data["historical_prices"]
        df = df.replace([float('inf'), float('-inf')], float('nan')).fillna(value=0)
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
    except Exception as e:
            print("[run_technical_analysis] An error occurred:", e)
            return state.copy(update={"technical_analysis": []})
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
class ExplanationRequest(BaseModel):
    question: str
    context_data: Union[List[Dict[str, Any]], Dict[str, Any]]  # The JSON data from the frontend
    context_type: str # e.g., "technical_analysis", "financial_ratios"

@app.post('/ask-query')
async def ask_query(request:ExplanationRequest):
    print("Get request for query!!")
    query = request.question
    context = request.context_data
    context_type = request.context_type

    try:
        response = queryAgent(query, context,context_type)
        explanation_text = response.content
        return JSONResponse(content={"response": explanation_text}, status_code=200)
    except Exception as e:
        print("Error we get is : ",e)
        raise HTTPException(status_code=500, detail=str(e))
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

