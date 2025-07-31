from edgar import Company
import re
from bs4 import BeautifulSoup

def clean_number(text: str) -> float:
    text = text.strip()
    # Handle parentheses for negative numbers e.g., (1,234) -> -1234
    is_negative = text.startswith('(') and text.endswith(')')
    
    # Remove non-numeric characters except for the decimal point
    text = re.sub(r'[^\d.]', '', text)
    
    if not text:
        return 0.0
        
    number = float(text)
    if is_negative:
        number *= -1
        
    return number
# A dictionary to map financial concepts to the text we'll search for in the filings.
# This list needs to be expanded over time to be more robust.
FINANCIAL_CONCEPTS = {
    'revenues': ['revenues', 'total revenues', 'total net sales'],
    'net_income': ['net income', 'net loss', 'net income (loss)'],
    'total_assets': ['total assets'],
    'total_liabilities': ['total liabilities'],
    'stockholders_equity': ["total stockholders' equity", "total equity"]
}

class FilingFetcherAgent:
    """Agent responsible for fetching filing documents from SEC EDGAR."""
    @staticmethod
    def fetcher_agent(company_name: str) -> dict:
        print(f"[{company_name}] FilingFetcherAgent: Starting process...")
        try:
            company = Company(company_name, "0000051143")

            tree_10k = company.get_all_filings(filing_type="10-K", no_of_entries=5)
            
            tree_10q = company.get_all_filings(filing_type="10-Q", no_of_entries=5)
            
            def get_first_html_doc(tree, filing_type):
                try:
                    all_docs = Company.get_documents(tree, no_of_documents=5)
                    for doc in all_docs:
                        if hasattr(doc, "url") and (doc.url.endswith(".htm") or doc.url.endswith(".html")):
                            return doc.text_content()
                except Exception as e:
                    print(f"[{company_name}] Error in {filing_type} parsing: {e}")
                return None
            text_10k = get_first_html_doc(tree_10k, "10-K")
            text_10q = get_first_html_doc(tree_10q, "10-Q")

            if not text_10k or not text_10q:
                print(f"[{company_name}] FilingFetcherAgent: Could not find valid .htm/.html document for 10‑K or 10‑Q.")
                return {"company_name": company_name, "status": "Failed", "error": "Valid HTML documents not found"}

            # (Optional) Save raw files
            with open(f"{company_name}_10K.txt", "w", encoding="utf-8") as f:
                f.write(text_10k)
            with open(f"{company_name}_10Q.txt", "w", encoding="utf-8") as f:
                f.write(text_10q)

            print(f"[{company_name}] Saved latest 10‑K and 10‑Q to files.")

            return {
                "data_10k_text": text_10k,
                "data_10q_text": text_10q,
            }
        
        except Exception as e:
            print(f"[{company_name}] FilingFetcherAgent: An error occurred: {e}")
            return {"company_name": company_name, "status": "Failed", "error": str(e)}
        
            
class FilingParserAgent:
    """Agent responsible for parsing HTML filings into structured data."""
    @staticmethod
    def _parse_document(html_content:  str) -> dict:
        print(f"FilingParserAgent: Starting process...")

        if not html_content:
            print(f"FilingParserAgent: No HTML content found.")
            return {"parsed_data": {}, "status": "Failed", "error": "No HTML content"}

        soup = BeautifulSoup(html_content, 'html.parser')
        extracted_data = {}

        # Find all tables, as financial data is typically in them
        tables = soup.find_all('table')
        print(f"FilingParserAgent: Found {len(tables)} tables in the document.")

        for concept, keywords in FINANCIAL_CONCEPTS.items():
            if concept in extracted_data: continue # Skip if already found

            for table in tables:
                for row in table.find_all('tr'):
                    cells = row.find_all(['td', 'th'])
                    if not cells: continue

                    # Check if any keyword for the concept is in the row's text
                    row_text = row.get_text(strip=True).lower()
                    if any(keyword in row_text for keyword in keywords):
                        # Keyword found, now find the first valid number in the row
                        for cell in cells:
                            # We are looking for a cell that contains a number, often in the second column
                            cell_text = cell.get_text(strip=True)
                            if re.search(r'\d', cell_text): # If the cell contains any digit
                                value = clean_number(cell_text)
                                # A simple check to avoid grabbing tiny numbers from footnote links
                                if abs(value) > 1000:
                                    extracted_data[concept] = value
                                    print(f"Extracted {concept}: {value}")
                                    break # Move to the next concept
                        if concept in extracted_data: break
                if concept in extracted_data: break
        if not extracted_data:
            print("FilingParserAgent: No financial data extracted.")
        else:
            print(f"FilingParserAgent: Extracted data - {extracted_data}")
  
        return extracted_data
    def parse_filings(self, fetched_data: dict) -> dict:
        text_10k = fetched_data.get("data_10k_text")
        text_10q = fetched_data.get("data_10q_text")

        if not text_10k:
            print("Warning: 10-K text is missing.")
        else:
            print(f"10-K content length: {len(text_10k)}")

        if not text_10q:
            print("Warning: 10-Q text is missing.")
        else:
            print(f"10-Q content length: {len(text_10q)}")

        # Parse each document using the internal helper method
        parsed_10k = self._parse_document(text_10k)
        parsed_10q = self._parse_document(text_10q)

        print("FilingParserAgent: Finished parsing filings.")
        print(f"Parsed 10-K Data: {parsed_10k}")
        print(f"Parsed 10-Q Data: {parsed_10q}")

        return {
            "parsed_10k": parsed_10k,
            "parsed_10q": parsed_10q
        }
    
class FinancialAnalysisAgentSEC:
    @staticmethod
    def _calculate_ratios(parsed_data: dict) -> dict:
        """
        Calculates key financial ratios from parsed SEC filing data.
        Ratios include: net profit margin, debt-to-equity, return on assets (ROA).
        """
        try:
            if not parsed_data:
                return {}
            # Extract values with default of 0 to avoid errors
            revenues = parsed_data.get('revenues', 1)
            net_income = parsed_data.get('net_income', 0)
            assets = parsed_data.get('total_assets', 1)
            liabilities = parsed_data.get('total_liabilities', 0)
            equity = parsed_data.get('stockholders_equity', 1)

            print("[_calculate_ratios] Inputs -",
              f"Revenues: {revenues}, Net Income: {net_income},",
              f"Assets: {assets}, Liabilities: {liabilities}, Equity: {equity}")

            ratios = {}
            
            # --- Calculate Ratios ---
            # Profitability
            try:
                ratios['net_profit_margin'] = (net_income / revenues) * 100 if revenues != 0 else 0
            except ZeroDivisionError:
                ratios['net_profit_margin'] = 0

            # Leverage
            try:
                ratios['debt_to_equity'] = liabilities / equity if equity != 0 else 0
            except ZeroDivisionError:
                ratios['debt_to_equity'] = 0

            # Efficiency / Return
            try:
                ratios['return_on_assets_roa'] = (net_income / assets) * 100 if assets != 0 else 0
            except ZeroDivisionError:
                ratios['return_on_assets_roa'] = 0
            return ratios
        except Exception as e:
            print(f"[Error in _calculate_ratios]: {e}")
            return {}
     
    def analyze_filings(self, all_parsed_data: dict) -> dict:
        """
        Analyzes both 10-K and 10-Q filings by computing financial ratios.
        """
        try:
            print("FinancialAnalysisAgentSEC: Starting analysis for both periods...")

            # Get the parsed data for both filings
            data_10k = all_parsed_data.get("parsed_10k", {})
            data_10q = all_parsed_data.get("parsed_10q", {})

            print("[10-K Parsed Data]:", data_10k)
            print("[10-Q Parsed Data]:", data_10q)

            # Calculate ratios for each data set
            ratios_10k = self._calculate_ratios(data_10k)
            ratios_10q = self._calculate_ratios(data_10q)

            print("[10-K Calculated Data]:", ratios_10k)
            print("[10-Q Calculated Data]:", ratios_10q)

            return {
                "annual_ratios (10-K)": ratios_10k,
                "quarterly_ratios (10-Q)": ratios_10q
            }
        except Exception as e:
            print(f"[Error in analyze_filings]: {e}")
            return {}