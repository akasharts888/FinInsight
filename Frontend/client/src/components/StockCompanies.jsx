import { AnimatePresence, motion } from 'framer-motion';
import React, { useState ,useEffect} from 'react';
// import { FaSearch } from "react-icons/fa";
import { Search, ArrowUp, ArrowDown, TrendingUp, BarChart2, Newspaper, BrainCircuit, Activity, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const companies = [
  { name: "Apple Inc.", symbol: "AAPL" },
  { name: "Microsoft Corporation", symbol: "MSFT" },
  { name: "Amazon.com Inc.", symbol: "AMZN" },
  { name: "Alphabet Inc. (Google)", symbol: "GOOGL" },
  { name: "Meta Platforms Inc. (Facebook)", symbol: "META" },
  { name: "Tesla Inc.", symbol: "TSLA" },
  { name: "NVIDIA Corporation", symbol: "NVDA" },
  { name: "JPMorgan Chase & Co.", symbol: "JPM" },
  { name: "Visa Inc.", symbol: "V" },
  { name: "Mastercard Incorporated", symbol: "MA" },
  { name: "Walmart Inc.", symbol: "WMT" },
  { name: "Procter & Gamble Company", symbol: "PG" },
  { name: "UnitedHealth Group Inc.", symbol: "UNH" },
  { name: "The Home Depot Inc.", symbol: "HD" },
  { name: "Bristol-Myers Squibb Company", symbol: "BMY" },
  { name: "Pfizer Inc.", symbol: "PFE" },
  { name: "Merck & Co. Inc.", symbol: "MRK" },
  { name: "Eli Lilly and Company", symbol: "LLY" },
  { name: "Gilead Sciences Inc.", symbol: "GILD" },
  { name: "AbbVie Inc.", symbol: "ABBV" },
  { name: "Cisco Systems Inc.", symbol: "CSCO" },
  { name: "Comcast Corporation", symbol: "CMCSA" },
  { name: "PepsiCo Inc.", symbol: "PEP" },
  { name: "The Coca-Cola Company", symbol: "KO" },
  { name: "Oracle Corporation", symbol: "ORCL" },
  { name: "SAP SE (ADR)", symbol: "SAP" },
  { name: "Salesforce Inc.", symbol: "CRM" },
  { name: "Adobe Inc.", symbol: "ADBE" },
  { name: "Intuit Inc.", symbol: "INTU" },
  { name: "Advanced Micro Devices Inc.", symbol: "AMD" },
  { name: "Netflix Inc.", symbol: "NFLX" },
  { name: "PayPal Holdings Inc.", symbol: "PYPL" },
  { name: "Airbnb Inc.", symbol: "ABNB" },
  { name: "Uber Technologies Inc.", symbol: "UBER" },
  { name: "Lyft Inc.", symbol: "LYFT" },
  { name: "Block Inc. (Square)", symbol: "SQ" },
  { name: "Zoom Video Communications Inc.", symbol: "ZM" },
  { name: "Shopify Inc.", symbol: "SHOP" },
  { name: "Snowflake Inc.", symbol: "SNOW" },
  { name: "Deutsche Bank AG", symbol: "DB" },
  { name: "HSBC Holdings plc", symbol: "HSBC" },
  { name: "Roblox Corporation", symbol: "RBLX" },
  { name: "DocuSign Inc.", symbol: "DOCU" },
  { name: "Fastly Inc.", symbol: "FSLY" },
  { name: "Okta Inc.", symbol: "OKTA" },
  { name: "CrowdStrike Holdings Inc.", symbol: "CRWD" },
  { name: "Datadog Inc.", symbol: "DDOG" },
  { name: "Pinterest Inc.", symbol: "PINS" },
  { name: "DraftKings Inc.", symbol: "DKNG" },
  { name: "MongoDB Inc.", symbol: "MDB" }
];

const StockCompanies = () => {
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDropdown, setShowDropdown] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (company) => {
    setSelectedCompany(company);
    setSearch(company.name);
    setShowDropdown(false);
    setShowConfirmation(true);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAnalyze = async () => {
    try{
      const response = await fetch("http://localhost:5000/api/stock/companystock",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: selectedCompany.name,
          symbol: selectedCompany.symbol,
        }),
      });

      const data = await response.json();
      console.log("Server response:", data);

      navigate('/analysis', {
        state: {
          name: selectedCompany.name,
          symbol: selectedCompany.symbol,
          data: data
        }
      });
      // alert(`Server analyzed: ${data.message || selectedCompany.name}`);
    } catch (error) {
      console.error("Error sending data:", error);
      alert("Something went wrong.");
    }
  }
  
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 px-4">
        <div className="flex flex-col items-center space-y-8 animate-fade-in-up">
          <AnimatePresence>
                {!showConfirmation && (
                  <motion.div 
                    key="searchTitle" 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center"
                  >
                    <h1 className="text-5xl md:text-6xl font-bold text-indigo-800">Search Any Stock Instantly</h1>
                  </motion.div>
                )}
                {showConfirmation && (
                    <motion.div 
                      key="unlockTitle" 
                      initial={{ opacity: 0, y: -20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -20 }}
                      className="text-center"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold text-indigo-800">Unlock Powerful Insights</h1>
                    </motion.div>
                )}
          </AnimatePresence>
          <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative w-full max-w-lg"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />     
              <input
                type="text"
                placeholder="Search company..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                  setShowConfirmation(false);
                  setSelectedCompany(null);
                }}
                className="w-full pl-12 pr-4 py-4 text-lg text-black bg-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onFocus={() => setShowDropdown(true)}
              />
            </div>
            {showDropdown && search && filteredCompanies.length > 0 && (
              <motion.ul 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 w-full mt-2 bg-white rounded-lg max-h-60 shadow-xl overflow-y-auto shadow-lg">
                {filteredCompanies.map((company) => (
                  <li
                  key={company.symbol}
                  onClick={() => handleSelect(company)}
                  className="px-6 py-4 hover:bg-indigo-50 cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-gray-800">{company.name}</span>
                    <span className="ml-2 text-gray-500">{company.symbol}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </motion.div>
          <AnimatePresence>
            {showConfirmation && selectedCompany && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="text-center mt-8">
                <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-md mb-6">
                    <p className="text-lg text-gray-800">You have selected <span className="font-bold text-indigo-600">{selectedCompany.name} ({selectedCompany.symbol})</span></p>
                </div>
                <motion.button whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(46, 213, 115, 0.8)" }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleAnalyze(selectedCompany)} className="px-10 py-4 bg-green-500 text-white text-xl font-bold rounded-full shadow-lg transition-all">
                    Analyze
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    </div>
  );
};

export default StockCompanies; 