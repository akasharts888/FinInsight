import StockCompanies from "./components/StockCompanies";
import './App.css'
import { React , useState, useEffect} from "react";
import {  Routes, Route,useNavigate } from 'react-router-dom';
import Navbar from "./components/Navbar";
import StockAnalysisPage from './pages/analysisPage'
import PredictionPage from "./pages/PredictionPage";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import Footer from "./components/Footer";
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return(
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:bg-gray-900 text-blue-900 dark:text-white transition-colors duration-300">
        <div className="fixed w-full top-0 left-0 z-50">
        <Navbar
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
        <div className="mt-16 flex-1 overflow-y-auto">
          <Routes>
              <Route path="/signup" element={<SignupPage setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="/" element={<LandingPage />} />
              <Route path="/stock" element={<StockCompanies />} />
              <Route path="/analysis" element={<StockAnalysisPage />} />
              <Route path="/prediction" element={<PredictionPage />} />
          </Routes>
        </div>
        <Footer />
      </div> 
    </div>
  )
}

export default App
