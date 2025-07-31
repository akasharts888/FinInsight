from langchain_groq import ChatGroq
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage,AIMessage
import os
import pandas as pd
from langchain_core.prompts import ChatPromptTemplate
import json

load_dotenv()

GROQ_MODEL = os.getenv("GROQ_MODEL")
GROQ_API = os.getenv("GROQ_API")

llm = ChatGroq(
    groq_api_key=GROQ_API,
    model_name=GROQ_MODEL
)
# Add this constant at the top of your Python file
CHART_CONTEXT_TYPES = ['price_chart', 'macd_chart', 'rsi_chart']


def create_data_summary(context_data: list, context_type: str) -> dict:
    if not context_data:
        return {"error": "No data provided to analyze."}
    try:
        df = pd.DataFrame(context_data)
        df['time'] = pd.to_datetime(df['time'])
        df = df.set_index('time').sort_index()
    except (KeyError, TypeError) as e:
        return {"error": f"Data formatting error: {e}"}
    
    summary = {
        "data_range": {
            "start_date": df.index.min().strftime('%Y-%m-%d'),
            "end_date": df.index.max().strftime('%Y-%m-%d'),
            "total_periods": len(df)
        },
        "most_recent_data": df.tail(3).to_dict('records')
    }


    if 'Close' in df.columns:
        summary['price_analysis'] = {
            "overall_change_percent": round(((df['Close'].iloc[-1] - df['Close'].iloc[0]) / df['Close'].iloc[0]) * 100, 2),
            "average_price": round(df['Close'].mean(), 2),
            # --- NEW: Add the specific dates for high and low points ---
            "highest_price": round(df['Close'].max(), 2),
            "highest_price_date": df['Close'].idxmax().strftime('%Y-%m-%d'),
            "lowest_price": round(df['Close'].min(), 2),
            "lowest_price_date": df['Close'].idxmin().strftime('%Y-%m-%d'),
        }
    summary['event_detection'] = {}
    if 'Close' in df.columns:
        # Find the longest period of consecutive price increases (uptrend)
        price_change = df['Close'].diff()
        # Create a grouper that changes value each time the price change sign flips
        group = (price_change.gt(0) != price_change.gt(0).shift()).cumsum()
        # Calculate the length of each consecutive streak
        df['streak'] = price_change.gt(0).groupby(group).transform('size')
        
        # Find the longest positive streak
        longest_streak_df = df[df['streak'] == df[df['Close'].diff().gt(0)]['streak'].max()]
        if not longest_streak_df.empty:
            summary['event_detection']['longest_uptrend_period'] = {
                "start_date": longest_streak_df.index.min().strftime('%Y-%m-%d'),
                "end_date": longest_streak_df.index.max().strftime('%Y-%m-%d'),
                "duration_days": len(longest_streak_df)
            }
        
        # Find the day with the single biggest price jump
        summary['event_detection']['biggest_single_day_hike'] = {
            "date": price_change.idxmax().strftime('%Y-%m-%d'),
            "price_increase": round(price_change.max(), 2)
        }
    if 'Volume' in df.columns:
        summary['event_detection']['highest_volume_day'] = {
            "date": df['Volume'].idxmax().strftime('%Y-%m-%d'),
            "volume": f"{int(df['Volume'].max()):,}"
        }
    if 'MACD' in df.columns and 'MACD_Signal' in df.columns:
        # Detect crossovers
        bullish_crossover = (df['MACD'] > df['MACD_Signal']) & (df['MACD'].shift(1) < df['MACD_Signal'].shift(1))
        bearish_crossover = (df['MACD'] < df['MACD_Signal']) & (df['MACD'].shift(1) > df['MACD_Signal'].shift(1))
        
        summary['macd_analysis'] = {
            "current_macd": round(df['MACD'].iloc[-1], 2),
            "current_signal": round(df['MACD_Signal'].iloc[-1], 2),
            "recent_bullish_crossover_date": bullish_crossover[bullish_crossover].index.max().strftime('%Y-%m-%d') if bullish_crossover.any() else None,
            "recent_bearish_crossover_date": bearish_crossover[bearish_crossover].index.max().strftime('%Y-%m-%d') if bearish_crossover.any() else None
        }
    if 'RSI' in df.columns:
        # Detect when RSI enters overbought/oversold territory
        overbought = (df['RSI'] > 70) & (df['RSI'].shift(1) <= 70)
        oversold = (df['RSI'] < 30) & (df['RSI'].shift(1) >= 30)

        summary['rsi_analysis'] = {
            "current_rsi": round(df['RSI'].iloc[-1], 2),
            "average_rsi": round(df['RSI'].mean(), 2),
            "last_overbought_signal": overbought[overbought].index.max().strftime('%Y-%m-%d') if overbought.any() else None,
            "last_oversold_signal": oversold[oversold].index.max().strftime('%Y-%m-%d') if oversold.any() else None
        }
    return summary
    
def queryAgent(query: str,context,context_type: str):

    if context_type in CHART_CONTEXT_TYPES:
        print(f"Context type '{context_type}' requires summarization. Processing...")
        processed_context = create_data_summary(context, context_type)
    else:
        print(f"Context type '{context_type}' does not require summarization. Using data directly.")
        # For simple data like ratios, use the data as it is
        processed_context = context

    template = """
    stem: You are FinInsight, an expert AI assistant. Your goal is to explain financial data insights to a beginner.
    Analyze the provided data to answer the user's question clearly and simply.
    
    Instructions:
    - Use simple language and avoid financial jargon.
    - If helpful, use analogies or examples from daily life to explain complex ideas.
    - If the user asks about a financial term or concept (e.g., "What is MACD?"), provide a clear, concise definition with context.
    - If the user asks for insights based on the given data (e.g., "Should I invest based on MACD?"), analyze the data logically and offer helpful insights using beginner-friendly reasoning.
    - Do not provide definitive investment advice. Instead, guide the user with what the data suggests and help them understand the implications.
    - Focus only on the user's question and the provided context. Be specific and avoid general or vague answers.

    Context:
    The user is asking about a '{context_type}' analysis.
    Here is the relevant data they are viewing:
    ```json
    {context_json}

    User Question: {user_question}

    Answer:
    """
    prompt_template = ChatPromptTemplate.from_template(template)

    context_json_string = json.dumps(processed_context, indent=2)
    
    final_prompt = prompt_template.format(
        context_type=context_type,
        context_json=context_json_string,
        user_question=query
    )

    res = llm.invoke(final_prompt)

    return res
