import yfinance as yf
company_to_ticker = {
    "Apple Inc.": "AAPL",
    "Microsoft Corporation": "MSFT",
    "Amazon.com Inc.": "AMZN",
    "Alphabet Inc. (Google)": "GOOGL",
    "Meta Platforms Inc. (Facebook)": "META",
    "Tesla Inc.": "TSLA",
    "NVIDIA Corporation": "NVDA",
    "JPMorgan Chase & Co.": "JPM",
    "Visa Inc.": "V",
    "Mastercard Incorporated": "MA",
    "Walmart Inc.": "WMT",
    "Procter & Gamble Company": "PG",
    "UnitedHealth Group Inc.": "UNH",
    "The Home Depot Inc.": "HD",
    "Bristol-Myers Squibb Company": "BMY",
    "Pfizer Inc.": "PFE",
    "Merck & Co. Inc.": "MRK",
    "Eli Lilly and Company": "LLY",
    "Gilead Sciences Inc.": "GILD",
    "AbbVie Inc.": "ABBV",
    "Cisco Systems Inc.": "CSCO",
    "Comcast Corporation": "CMCSA",
    "PepsiCo Inc.": "PEP",
    "The Coca-Cola Company": "KO",
    "Oracle Corporation": "ORCL",
    "SAP SE (ADR)": "SAP",
    "Salesforce Inc.": "CRM",
    "Adobe Inc.": "ADBE",
    "Intuit Inc.": "INTU",
    "Advanced Micro Devices Inc.": "AMD",
    "Netflix Inc.": "NFLX",
    "PayPal Holdings Inc.": "PYPL",
    "Airbnb Inc.": "ABNB",
    "Uber Technologies Inc.": "UBER",
    "Lyft Inc.": "LYFT",
    "Block Inc. (Square)": "SQ",
    "Zoom Video Communications Inc.": "ZM",
    "Shopify Inc.": "SHOP",
    "Snowflake Inc.": "SNOW",
    "Deutsche Bank AG": "DB",
    "HSBC Holdings plc": "HSBC",
    "Roblox Corporation": "RBLX",
    "DocuSign Inc.": "DOCU",
    "Fastly Inc.": "FSLY",
    "Okta Inc.": "OKTA",
    "CrowdStrike Holdings Inc.": "CRWD",
    "Datadog Inc.": "DDOG",
    "Pinterest Inc.": "PINS",
    "DraftKings Inc.": "DKNG",
    "MongoDB Inc.": "MDB"
}


def DataFetcherAgent(company_name: str, period:str = "2y",interval: str = "1d"):
    ticker_symbol = company_to_ticker[company_name]
    print(f"Fetching historical prices for {ticker_symbol} (Period: {period}, Interval: {interval})...")
    data = {}
    ticker = yf.Ticker(ticker_symbol)
    try:
        hist_data = ticker.history(period=period, interval=interval)
        if hist_data.empty:
            print(f"No historical data found for {ticker_symbol}")
        data["historical_prices"] = hist_data
    except Exception as e:
        print(f"Error fetching historical prices for {ticker_symbol}: {e}")
    
    quarterly = False
    print(f"Fetching {'quarterly' if quarterly else 'annual'} financial statements for {ticker_symbol}...")
    financials = {}
    try:
        financials["income_stmt"] = ticker.income_stmt
        financials['balance_sheet'] = ticker.balance_sheet
        financials['cash_flow'] = ticker.cash_flow

        if all(history_prices.empty for history_prices in financials.values()):
            print(f"No financial statements found for {ticker_symbol}.")
        data["financials statement"] = financials
    except Exception as e:
        print(f"Error fetching financial statements for {ticker_symbol}: {e}")
    
    print(f"Fetching company info for {ticker_symbol}...")
    try:
        data["company_info"] = ticker.info
    except Exception as e:
        print(f"Error fetching company info for {ticker_symbol}: {e}")

    print(f"Fetching analyst recommendations for {ticker_symbol}...")
    try:
        recs = ticker.recommendations
        data["analyst_recommendations"] = recs
    except Exception as e:
        print(f"Error fetching analyst recommendations for {ticker_symbol}: {e}")
    

    print(f"Fetching news for {ticker_symbol}...")
    try:
        news = ticker.news
        data["news"] = news
    except Exception as e:
        print(f"Error fetching news for {ticker_symbol}: {e}")
           
    return data