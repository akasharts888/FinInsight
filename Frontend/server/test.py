import yfinance as yf
from datetime import datetime
import pandas as pd

ticker = "MSFT"
end_date = datetime.now()
start_date = end_date - pd.DateOffset(years=5)
data = yf.download(ticker, start=start_date.date(), end=end_date.date())
print(data.columns)
stock_ticker = yf.Ticker(ticker)
news_data = stock_ticker.news

news_df = pd.DataFrame(news_data)
print(news_df.columns)
# print(news_df)