import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom';



import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, CartesianGrid, Legend, ComposedChart
  } from 'recharts';

const AnimatedNumber = ({ value }) => {
    const ref = useRef(null);
    const [displayValue, setDisplayValue] = useState(0);
    const isNumber = !isNaN(parseFloat(value));
    const targetValue = isNumber ? parseFloat(value) : 0;

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                let start = 0;
                const duration = 1500;
                const startTime = performance.now();
                const animate = (currentTime) => {
                    const elapsedTime = currentTime - startTime;
                    const progress = Math.min(elapsedTime / duration, 1);
                    const currentVal = start + progress * (targetValue - start);
                    setDisplayValue(currentVal);
                    if (progress < 1) requestAnimationFrame(animate);
                    else setDisplayValue(targetValue);
                };
                requestAnimationFrame(animate);
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [targetValue]);

    if (!isNumber) return <span ref={ref}>{value}</span>;
    return <span ref={ref}>{displayValue.toFixed(2)}</span>;
};
const StockAnalysisPage = () => {
    const location = useLocation();
    const { name, symbol, data } = location.state || {};
    const [companyName] = useState(name);
    const [ticker] = useState(symbol);
    const [analysisData] = useState(data);
    const [showFullSummary, setShowFullSummary] = useState(false);
    const navigate = useNavigate();
    if (!analysisData) {
        return <div className="flex justify-center items-center h-screen text-xl">Loading analysis...</div>;
    }
    // console.log("fetched Data :",data);
    const indicators = Object.entries(data.financial_analysis.financial_ratios || {});
    const summary = data.financial_analysis.summary;
    const techData = Object.entries(data.technical_indicators || {}).map(([key, value]) => ({ name: key, ...value }));

    const latestRecommendations = {
        StrongBuy: data.analyst_recommendations.strongBuy["0"],
        Buy: data.analyst_recommendations.buy["0"],  
        Hold: data.analyst_recommendations.hold["0"],
        Sell: data.analyst_recommendations.sell["0"],
        StrongSell: data.analyst_recommendations.strongSell["0"]
    }
    const summaryText = data.company_info?.longBusinessSummary || "";
    const shortSummary = summaryText.length > 250
    ? summaryText.slice(0, summaryText.indexOf('.', 250)) + '.'
    : summaryText;
  
      
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-gray-900 p-6">
            <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-lg py-6 px-6 relative text-center">
                <button
                    onClick={() => navigate(-1)}  // Go back one page in history
                    className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 font-medium transition-colors bg-gradient-to-b"
                >
                    ← Back
                </button>
                <motion.h1 
                    initial={{ opacity: 0, y: -30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6 }}
                    className="text-4xl sm:text-5xl font-bold mb-6 text-blue-900 tracking-tight text-center drop-shadow-sm"
                >
                    Financial Dashboard for {companyName}
                </motion.h1>
                {data.company_info && (
                    <div className="flex items-center space-x-4">
                        {/* {data.company_info.logo_url && (
                            <img src={data.company_info.logo_url} alt="Logo" className="w-12 h-12 rounded" />
                        )} */}
                        <div>
                            <a href={data.company_info.website} className="text-blue-500 underline text-sm">
                                {data.company_info.website}
                            </a>
                        </div>
                    </div>
                )}
            </div>
            <div className="bg-[#2e241f] text-[#fef3c7] rounded-xl shadow-xl p-6 flex items-start gap-4">
                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-yellow-200 mb-2">Company Summary</h2>
                    <p className={`text-sm leading-relaxed transition-all duration-300 ${showFullSummary ? '' : 'line-clamp-4'} text-yellow-100`}>
                        {showFullSummary ? summaryText : shortSummary}
                    </p>
                    {summaryText.length > 200 && (
                        <button onClick={() => setShowFullSummary(!showFullSummary)} className="mt-3 inline-flex items-center gap-1 px-4 py-1.5 bg-yellow-400 text-yellow-900 text-sm font-semibold rounded-full shadow hover:bg-yellow-300 transition">
                            {showFullSummary ? 'Show less' : 'Read more'}{' '}
                            {showFullSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    )}
                </div>
            </div>
            <div className="mt-6 text-center">
                <button
                    onClick={() => navigate('/prediction',{
                        state:{
                            name: name,
                            symbol: symbol,
                        }
                    })}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md"
                >
                    Go to Prediction Page
                </button>
            </div>

            <motion.section 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
                className="mt-4 bg-white rounded-xl p-6 shadow-xl border border-blue-100"
            >
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Financial Ratios</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {indicators.map(([key, val]) => (
                                <div key={key} className="bg-blue-50 rounded-lg p-4 shadow hover:shadow-md transition-all duration-200">
                                    <p className="text-sm text-gray-600">{key}</p>
                                    <p className="text-xl font-bold text-blue-800"><AnimatedNumber value={val} /></p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Summary</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(summary).map(([key, val]) => (
                            <div key={key} className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md shadow-sm">
                            <p className="text-gray-500 text-sm">{key}</p>
                            <p className="font-bold text-green-800 text-lg">{val}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Candlestick + Volume */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }}
                className="mt-6 bg-white rounded-xl p-6 shadow-xl border border-gray-200"
            >
                <h2 className="text-2xl font-semibold mb-4">Candlestick + Volume</h2>
                <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={techData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="right" dataKey="Volume" fill="#a5b4fc" barSize={30} opacity={0.4} />
                    <Line yAxisId="left" type="monotone" dataKey="Close" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </ComposedChart>
                </ResponsiveContainer>
            </motion.section>

            {/* Technical Indicators */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.5 }}
                className="mt-6 bg-white rounded-xl p-6 shadow-xl border border-yellow-100"
            >
                <h2 className="text-2xl font-semibold mb-4">SMA, EMA, RSI</h2>
                <ResponsiveContainer width="100%" height={300}>
                <LineChart data={techData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="SMA_20" stroke="#10b981" />
                    <Line type="monotone" dataKey="EMA_20" stroke="#f59e0b" />
                    <Line type="monotone" dataKey="RSI" stroke="#ef4444" />
                </LineChart>
                </ResponsiveContainer>
            </motion.section>
            {/* MACD Chart */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.6 }}
                className="mt-6 bg-white rounded-xl p-6 shadow-xl border border-indigo-100"
            >
                <h2 className="text-2xl font-semibold mb-4">MACD</h2>
                <ResponsiveContainer width="100%" height={300}>
                <LineChart data={techData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="MACD" stroke="#6366f1" />
                    <Line type="monotone" dataKey="MACD_Signal" stroke="#f97316" />
                    <Line type="monotone" dataKey="MACD_Hist" stroke="#22d3ee" />
                </LineChart>
                </ResponsiveContainer>
            </motion.section>
            {/* Analyst Recommendations */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.7 }}
                className="mt-6 bg-white rounded-xl p-6 shadow-xl border border-purple-100"
            >
                <h2 className="text-2xl font-semibold mb-4">Analyst Recommendations</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(latestRecommendations).map(([label, count]) => (
                        <div key={label} className="p-4 bg-purple-50 text-center rounded shadow-md">
                            <p className="text-sm text-gray-500 font-medium">{label}</p>
                            <p className="text-xl font-bold text-purple-700">{count}</p>
                        </div>
                    ))}
                </div>
            </motion.section>

             {/* News Section */}
             <motion.section 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.8 }}
                className="mt-6 bg-white rounded-xl p-6 shadow-xl border border-orange-100"
            >
                <h2 className="text-2xl font-semibold mb-4">Latest News</h2>
                <div className="space-y-4">
                    {data.news.slice(0, 5).map((item, i) => {
                        const news = item.content;
                        return (
                            <a
                                key={i}
                                href={news?.clickThroughUrl?.url || news?.canonicalUrl?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex gap-4 hover:bg-orange-50 rounded-lg transition p-3"
                            >
                                {news.thumbnail?.originalUrl && (
                                    <img
                                        src={news.thumbnail.originalUrl}
                                        alt="thumbnail"
                                        className="w-24 h-16 object-cover rounded-lg"
                                    />
                                )}
                                <div className="flex flex-col justify-between">
                                    <p className="font-medium text-blue-900 leading-tight line-clamp-2">{news.title}</p>
                                    <p className="text-xs text-gray-500">
                                        {news.provider?.displayName} • {new Date(news.pubDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </motion.section>
        </div>
    );
}

export default StockAnalysisPage; 
