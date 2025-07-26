import yfinance as yf
from datetime import datetime
import pandas as pd

ticker = 'MSFT'
end_date = datetime.now()
start_date = end_date - pd.DateOffset(years=5)
price_data = yf.download(ticker, start=start_date.date(), end=end_date.date())
ticker = yf.Ticker(ticker)
print(price_data)

print("---------------")
print(ticker.news)