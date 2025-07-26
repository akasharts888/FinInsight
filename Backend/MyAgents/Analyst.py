def AnalysisAgent(financial_data,stock_price):
    ratios = {}
    try:
        income_stmt = financial_data["income_stmt"]
        balance_sheet = financial_data["balance_sheet"]

        latest_col = income_stmt.columns[0]
        def safe_get(history_prices, row, col):
            return history_prices.loc[row, col] if row in history_prices.index and col in history_prices.columns else None

        # --- Extract Values Safely ---
        net_income = safe_get(income_stmt, "Net Income", latest_col)
        total_liabilities = safe_get(balance_sheet, "Total Liabilities Net Minority Interest", latest_col)
        shareholder_equity = safe_get(balance_sheet, "Stockholders Equity", latest_col)
        current_assets = safe_get(balance_sheet, "Current Assets", latest_col)
        current_liabilities = safe_get(balance_sheet, "Current Liabilities", latest_col)
        outstanding_shares = safe_get(balance_sheet, "Ordinary Shares Number", latest_col)

        required_fields = [net_income, total_liabilities, shareholder_equity, current_assets, current_liabilities, outstanding_shares]
        if any(v is None for v in required_fields):
            print("One or more required fields are missing.")
            return {}
        if stock_price is None:
            stock_price = 250

        eps = net_income / outstanding_shares if outstanding_shares is not None and outstanding_shares != 0 else None
        pe_ratio = stock_price / eps if eps is not None and eps != 0 else None
        roe = net_income / shareholder_equity if shareholder_equity else None
        current_ratio = current_assets / current_liabilities if current_liabilities else None
        debt_to_equity = total_liabilities / shareholder_equity if shareholder_equity else None

        ratios.update({
            "EPS": round(eps, 2) if eps is not None else None,
            "P/E Ratio": round(pe_ratio, 2) if pe_ratio else None,
            "ROE": round(roe, 2) if roe else None,
            "Current Ratio": round(current_ratio, 2) if current_ratio else None,
            "Debt-to-Equity": round(debt_to_equity, 2) if debt_to_equity else None
        })
        summary = {
            "Profitability": "Strong" if roe and roe > 0.15 else "Weak",
            "Liquidity": "Healthy" if current_ratio and current_ratio >= 1.5 else "At Risk",
            "Solvency": "Stable" if debt_to_equity and debt_to_equity < 1 else "Leveraged"
        }

        return {
            "financial_ratios": ratios,
            "summary": summary
        }
    except KeyError as e:
        print(f"Missing field: {e}") 