import pandas as pd
def TechnicalAnalysisAgent(history_prices):
    history_prices.fillna(value=0, inplace=True)
    history_prices["SMA_20"] = history_prices["Close"].rolling(window=20).mean()
    history_prices['EMA_20'] = history_prices['Close'].ewm(span=20, adjust=False).mean()
    delta = history_prices['Close'].diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)

    avg_gain = gain.rolling(window=20).mean()
    avg_loss = loss.rolling(window=20).mean()

    rs = avg_gain / avg_loss
    history_prices['RSI'] = 100 - (100 / (1 + rs))

    ema12 = history_prices['Close'].ewm(span=12, adjust=False).mean()
    ema26 = history_prices['Close'].ewm(span=26, adjust=False).mean()

    history_prices['MACD'] = ema12 - ema26
    history_prices['MACD_Signal'] = history_prices['MACD'].ewm(span=9, adjust=False).mean()
    history_prices['MACD_Hist'] = history_prices['MACD'] - history_prices['MACD_Signal']


    sma = history_prices['Close'].rolling(window=20).mean()
    std = history_prices['Close'].rolling(window=20).std()

    history_prices['BB_Middle'] = sma
    history_prices['BB_Upper'] = sma + 2 * std
    history_prices['BB_Lower'] = sma - 2 * std

    low_min = history_prices['Low'].rolling(window=20).min()
    high_max = history_prices['High'].rolling(window=20).max()

    history_prices['Stoch_%K'] = 100 * ((history_prices['Close'] - low_min) / (high_max - low_min))
    history_prices['Stoch_%D'] = history_prices['Stoch_%K'].rolling(window=3).mean()
    
    high_low = history_prices['High'] - history_prices['Low']
    high_close = (history_prices['High'] - history_prices['Close'].shift()).abs()
    low_close = (history_prices['Low'] - history_prices['Close'].shift()).abs()

    tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
    history_prices['ATR'] = tr.rolling(window=20).mean()