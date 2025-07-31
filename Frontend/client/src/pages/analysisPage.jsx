import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp,Info,X, MessageCircle, Send, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

import { createChart, CandlestickSeries ,HistogramSeries, LineSeries} from 'lightweight-charts';


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

const InfoModal = ({ isOpen, onClose, title, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative"
                    >
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">{title}</h3>
                        <div className="text-gray-600 leading-relaxed space-y-4">
                            {children}
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                        >
                            <X size={24} />
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const ChatModal = ({ isOpen, onClose, onSendMessage, messages, isLoading, title }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full h-[70vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
                                <X size={24} />
                            </button>
                        </div>
                        
                        {/* Messages Area */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                     <div className="rounded-lg px-4 py-2 bg-gray-200 text-gray-800 flex items-center">
                                        <Loader className="animate-spin mr-2" size={16} />
                                        <span>FinInsight is thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask a question..."
                                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <button onClick={handleSend} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300" disabled={isLoading}>
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const StockAnalysisPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { name, symbol, data } = location.state || {};

    // console.log("name is : ",name);
    const priceChartContainerRef = useRef(null);
    const macdChartContainerRef = useRef(null);
    const rsiChartContainerRef = useRef(null);

    // const [ticker] = useState(symbol);
    const [companyName] = useState(name);
    const [analysisData] = useState(data);
    const [showFullSummary, setShowFullSummary] = useState(false);
    
    const [modalState, setModalState] = useState({ isOpen: false, title: '', content: null });

    const [chatState, setChatState] = useState({
        isOpen: false,
        title: '',
        contextData: null,
        contextType: '',
        messages: [],
        isLoading: false,
    });

    const handleAskAnalysis = (contextType, contextData, title) => {
        setChatState({
            isOpen: true,
            title: `Ask about ${title}`,
            contextData,
            contextType,
            messages: [{ sender: 'ai', text: `Hi! How can I help you understand the ${title.toLowerCase()}?` }],
            isLoading: false,
        });
    };

    // --- NEW: Function to send a message to the backend ---
    const handleSendMessage = async (userMessage) => {
        // Add user message to UI immediately
        setChatState(prev => ({
            ...prev,
            messages: [...prev.messages, { sender: 'user', text: userMessage }],
            isLoading: true,
        }));

        try {
            const response = await fetch("http://localhost:5000/api/stock/analysis-query", { // Make sure this port is correct
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: userMessage,
                    context_data: chatState.contextData,
                    context_type: chatState.contextType,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get a response from the AI.");
            }

            const aiResponse = await response.json();
            
            // Add AI response to UI
            setChatState(prev => ({
                ...prev,
                messages: [...prev.messages, { sender: 'ai', text: aiResponse.response }],
                isLoading: false,
            }));

        } catch (error) {
            console.error("Chat API error:", error);
            setChatState(prev => ({
                ...prev,
                messages: [...prev.messages, { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again later." }],
                isLoading: false,
            }));
        }
    };

    const openModal = (term) => {
        const definition = definitions[term] || keyToDefinitionMap[term] && definitions[keyToDefinitionMap[term]];
        if (definition) {
            setModalState({ isOpen: true, title: definition.title, content: definition.content });
        }
    };
    const closeModal = () => setModalState({ isOpen: false, title: '', content: null });

    if (!analysisData) {
        return <div className="flex justify-center items-center h-screen text-xl">Loading analysis...</div>;
    }

    const DeepAnalysis = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/stock/deep-analysis", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });

            const data = await response.json();
            console.log("data from Deep danalysis: ",data);
        } catch (err) {
            console.error("error is :",err);
            setError("Failed to fetch predictions.");
        }
    }
    const chartData = (data.technical_indicators || {}).map(item => ({
        time:item.name,
        ...item
    })).sort((a,b) => new Date(a.time) - new Date(b.time));

    const candlestickSeriesData = chartData.map(d => ({ time: d.time, open: d.Open, high: d.High, low: d.Low, close: d.Close })).filter(d => d.open);
    const volumeSeriesData = chartData.map(d => ({ time: d.time, value: d.Volume, color: d.Close > d.Open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)' }));
    const smaSeriesData = chartData.map(d => ({ time: d.time, value: d.SMA_20 })).filter(d => d.value);
    const emaSeriesData = chartData.map(d => ({ time: d.time, value: d.EMA_20 })).filter(d => d.value);
    const macdLineSeriesData = chartData.map(d => ({ time: d.time, value: d.MACD })).filter(d => d.value);
    const macdSignalSeriesData = chartData.map(d => ({ time: d.time, value: d.MACD_Signal })).filter(d => d.value);
    const macdHistSeriesData = chartData.map(d => ({ time: d.time, value: d.MACD_Hist })).filter(d => d.value);
    const rsiSeriesData = chartData.map(d => ({ time: d.time, value: d.RSI })).filter(d => d.value);
    

    useEffect(() => {
        if (!priceChartContainerRef.current || chartData.length === 0) return;

        const chart = createChart(priceChartContainerRef.current, {
            width: priceChartContainerRef.current.clientWidth,
            height: 400,
            layout: {
                background: { color: '#ffffff' },
                textColor: '#333',
            },
            grid: {
                vertLines: { color: '#f0f0f0' },
                horzLines: { color: '#f0f0f0' },
            },
            crosshair: {
                mode: 'normal',
            },
        });
        const candlestickSeries = chart.addSeries(CandlestickSeries,{
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        candlestickSeries.setData(candlestickSeriesData);

        const volumeSeries = chart.addSeries(HistogramSeries,
            {
                priceFormat: { type: 'volume' },
                priceScaleId: 'volume_scale', // <-- This creates the scale
            }
        );
        volumeSeries.setData(volumeSeriesData);
        chart.priceScale('volume_scale').applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 },
        });
        
        const smaSeries = chart.addSeries(LineSeries,{ color: '#10b981', lineWidth: 2 ,title: 'SMA 20'});
        smaSeries.setData(smaSeriesData);
        
        const emaSeries = chart.addSeries(LineSeries,{ color: '#f59e0b', lineWidth: 2 ,title: 'EMA 20'});
        emaSeries.setData(emaSeriesData);

        chart.timeScale().fitContent();

        // Handle resize
        const resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            chart.applyOptions({ width, height });
        });
        resizeObserver.observe(priceChartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
    }, [candlestickSeriesData, volumeSeriesData, smaSeriesData, emaSeriesData]);


    useEffect(() => {
        if (!macdChartContainerRef.current || chartData.length === 0) return;

        const chart = createChart(macdChartContainerRef.current, {
            width: macdChartContainerRef.current.clientWidth,
            height: 300,
            layout: { background: { color: '#ffffff' }, textColor: '#333' },
            grid: { vertLines: { color: '#f0f0f0' }, horzLines: { color: '#f0f0f0' } },
        });

        const macdSeries = chart.addSeries(LineSeries,{ color: '#6366f1', lineWidth: 2, title: 'MACD' });
        macdSeries.setData(macdLineSeriesData);

        const signalSeries = chart.addSeries(LineSeries,{ color: '#f97316', lineWidth: 2, title: 'Signal' });
        signalSeries.setData(macdSignalSeriesData);

        const histSeries = chart.addSeries(HistogramSeries,{ title: 'Histogram' });
        histSeries.setData(macdHistSeriesData);

        chart.timeScale().fitContent();
        
        // Handle resize
        const resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            chart.applyOptions({ width, height });
        });
        resizeObserver.observe(macdChartContainerRef.current);
        
        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
    }, [macdLineSeriesData, macdSignalSeriesData, macdHistSeriesData]);

    // Effect for RSI Chart
    useEffect(() => {
        if (!rsiChartContainerRef.current || chartData.length === 0) return;

        const chart = createChart(rsiChartContainerRef.current, {
            width: rsiChartContainerRef.current.clientWidth,
            height: 300,
            layout: { background: { color: '#ffffff' }, textColor: '#333' },
            grid: { vertLines: { color: '#f0f0f0' }, horzLines: { color: '#f0f0f0' } },
        });

        const rsiSeries = chart.addSeries(LineSeries,{ color: '#ef4444', lineWidth: 2, title: 'RSI' });
        rsiSeries.setData(rsiSeriesData);

        // Add overbought/oversold lines for context
        rsiSeries.createPriceLine({ price: 70, color: 'red', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'Overbought' });
        rsiSeries.createPriceLine({ price: 30, color: 'green', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'Oversold' });

        chart.timeScale().fitContent();
        
        // Handle resize
        const resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            chart.applyOptions({ width, height });
        });
        resizeObserver.observe(rsiChartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
    }, [rsiSeriesData]);


    // console.log("fetched Data :",data);
    const indicators = Object.entries(data.financial_analysis.financial_ratios || {});
    const summary = data.financial_analysis.summary;
    // console.log("summary : ",summary);
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
        <>
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
                    {/* <button
                        onClick={DeepAnalysis}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md"
                    >
                        Deep Analysis
                    </button> */}
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
                            <button
                                onClick={() => handleAskAnalysis('financial_ratios', data.financial_analysis.financial_ratios, 'Financial Ratios')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full shadow-sm hover:bg-blue-200 transition"
                            >
                                <MessageCircle size={16} />
                                Ask about this analysis
                            </button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {indicators.map(([key, val]) => {
                                    const defKey = keyToDefinitionMap[key];
                                    const displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                                    return (
                                        <div key={key} className="bg-blue-50 rounded-lg p-4 shadow hover:shadow-md transition-all duration-200">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-gray-600">{displayName}</p>
                                                {defKey && (
                                                    <button onClick={() => openModal(defKey)} className="bg-transparent text-black hover:text-indigo-600">
                                                        <Info size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xl font-bold text-blue-800"><AnimatedNumber value={val} /></p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Summary</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(summary).map(([key, val]) => {
                                     const defKey = keyToDefinitionMap[key];
                                     const displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                                     return (
                                        <div key={key} className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <p className="text-gray-500 text-sm">{displayName}</p>
                                                {defKey && (
                                                    <button onClick={() => openModal(defKey)} className="bg-transparent text-black hover:text-green-600">
                                                        <Info size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="font-bold text-green-800 text-lg">{val}</p>
                                        </div>
                                     )
                                })}
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
                    {/* <h2 className="text-2xl font-semibold mb-4">Price, Volume & Moving Averages</h2> */}
                    {/* <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={techData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Bar yAxisId="right" dataKey="Volume" fill="#a5b4fc" barSize={30} opacity={0.4} />
                        <Line yAxisId="left" type="monotone" dataKey="Close" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </ComposedChart>
                    </ResponsiveContainer> */}
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-2xl font-semibold">Price, Volume & Moving Averages</h2>
                        <button onClick={() => openModal('PRICE_VOLUME_MA')} className="bg-transparent text-black hover:text-indigo-600">
                            <Info size={18} />
                        </button>
                        <button
                            onClick={() => {
                                const context = chartData.map(d => ({
                                    time: d.time,
                                    Open: d.Open,
                                    High: d.High,
                                    Low: d.Low,
                                    Close: d.Close,
                                    Volume: d.Volume,
                                    SMA_20: d.SMA_20,
                                    EMA_20: d.EMA_20

                                }))
                                handleAskAnalysis('price_chart', context, 'Price Chart')}}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full shadow-sm hover:bg-gray-200 transition"
                        >
                            <MessageCircle size={16} />
                            Ask about this
                        </button>
                    </div>
                    <div ref ={priceChartContainerRef} />
                </motion.section>

                {/* Technical Indicators */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.5 }}
                    className="mt-6 bg-white rounded-xl p-6 shadow-xl border border-yellow-100"
                >
                    {/* <h2 className="text-2xl font-semibold mb-4">MACD</h2> */}
                    {/* <ResponsiveContainer width="100%" height={300}>
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
                    </ResponsiveContainer> */}
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-2xl font-semibold">MACD</h2>
                        <button onClick={() => openModal('MACD')} className="bg-transparent text-black hover:text-indigo-600">
                            <Info size={18} />
                        </button>
                        <button
                            onClick={() => handleAskAnalysis('macd_chart', chartData.map(d => ({time: d.time, MACD: d.MACD, MACD_Signal: d.MACD_Signal, MACD_Hist: d.MACD_Hist})), 'MACD Chart')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full shadow-sm hover:bg-yellow-200 transition"
                        >
                            <MessageCircle size={16} />
                            Ask about this
                        </button>
                    </div>
                    <div ref={macdChartContainerRef} />
                </motion.section>
                {/* MACD Chart */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.6 }}
                    className="mt-6 bg-white rounded-xl p-6 shadow-xl border border-indigo-100"
                >
                    {/* <h2 className="text-2xl font-semibold mb-4">RSI</h2> */}
                    {/* <ResponsiveContainer width="100%" height={300}>
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
                    </ResponsiveContainer> */}
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-2xl font-semibold">RSI</h2>
                        <button onClick={() => openModal('RSI')} className="bg-transparent text-black hover:text-indigo-600">
                            <Info size={18} />
                        </button>
                        <button
                            onClick={() => handleAskAnalysis('rsi_chart', chartData.map(d => ({time: d.time, RSI: d.RSI})), 'RSI Chart')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full shadow-sm hover:bg-indigo-200 transition"
                        >
                            <MessageCircle size={16} />
                            Ask about this
                        </button>
                    </div>
                    <div ref={rsiChartContainerRef} />
                </motion.section>
                {/* Analyst Recommendations */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.7 }}
                    className="mt-6 bg-white rounded-xl p-6 shadow-xl border border-purple-100"
                >
                    <h2 className="text-2xl font-semibold mb-4">Analyst Recommendations</h2>
                    <button
                        onClick={() => handleAskAnalysis('analyst_recommendations', latestRecommendations, 'Analyst Ratings')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full shadow-sm hover:bg-purple-200 transition"
                    >
                        <MessageCircle size={16} />
                        Ask about this
                    </button>
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
            <InfoModal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.title}>
                {modalState.content}
            </InfoModal>

            <ChatModal
                isOpen={chatState.isOpen}
                onClose={() => setChatState(prev => ({ ...prev, isOpen: false }))}
                onSendMessage={handleSendMessage}
                messages={chatState.messages}
                isLoading={chatState.isLoading}
                title={chatState.title}
            />
        </>
    );
}

const keyToDefinitionMap = {
    'Profitability': 'PROFITABILITY',
    'Liquidity': 'LIQUIDITY',
    'Solvency': 'SOLVENCY',
    'EPS': 'EPS',
    'P/E Ratio': 'P_E_RATIO',
    'ROE': 'ROE',
    'Current Ratio': 'CURRENT_RATIO',
    'Debt-to-Equity': 'DEBT_TO_EQUITY'
};

const definitions = {
    'PROFITABILITY': {
        title: 'Profitability Ratios',
        content: <p>These ratios measure a company's ability to generate earnings relative to its revenue, operating costs, balance sheet assets, or shareholders' equity. High profitability is a sign of a healthy, well-managed company.</p>
    },
    'LIQUIDITY': {
        title: 'Liquidity Ratios',
        content: <p>These ratios measure a company's ability to pay off its short-term debts and obligations without raising external capital. A higher liquidity ratio indicates a company is more capable of covering its short-term liabilities.</p>
    },
    'SOLVENCY': {
        title: 'Solvency Ratios',
        content: <p>Also known as leverage ratios, these measure a company's ability to meet its long-term financial obligations. They show how much of a company's assets are financed through debt versus equity.</p>
    },
    'EPS': {
        title: 'Earnings Per Share (EPS)',
        content: <p>EPS is a company's profit divided by the number of outstanding shares of its common stock. It serves as an indicator of a company's profitability. A higher EPS indicates greater value.</p>
    },
    'P_E_RATIO': {
        title: 'Price-to-Earnings (P/E) Ratio',
        content: <p>The P/E ratio compares a company's share price to its earnings per share. It's used by investors to determine the relative value of a company's shares. A high P/E could mean the stock is overvalued, or that investors are expecting high growth rates in the future.</p>
    },
    'ROE': {
        title: 'Return on Equity (ROE)',
        content: <p>ROE is a measure of financial performance calculated by dividing net income by shareholders' equity. It shows how effectively management is using a company’s assets to create profits.</p>
    },
    'CURRENT_RATIO': {
        title: 'Current Ratio',
        content: <p>A key liquidity ratio that measures whether a firm has enough resources to meet its short-term obligations. It compares a firm's current assets to its current liabilities. A ratio above 1 is generally considered good.</p>
    },
    'DEBT_TO_EQUITY': {
        title: 'Debt-to-Equity (D/E) Ratio',
        content: <p>This solvency ratio is used to evaluate a company's financial leverage. It is calculated by dividing a company’s total liabilities by its shareholder equity. A high D/E ratio generally means a company has been aggressive in financing its growth with debt.</p>
    },
    'PRICE_VOLUME_MA': {
        title: 'Price, Volume & Moving Averages',
        content: (
            <>
                <p><strong>Price (Candlestick):</strong> Shows the open, high, low, and close prices for a specific period. A green candle means the price closed higher than it opened; a red candle means it closed lower.</p>
                <p><strong>Volume:</strong> Represents the total number of shares traded during a period. High volume can indicate strong interest in a price move.</p>
                <p><strong>Moving Average (MA):</strong> A smoothed-out version of price data, used to identify the direction of the trend. We show both a Simple Moving Average (SMA) and an Exponential Moving Average (EMA).</p>
            </>
        )
    },
    'MACD': {
        title: 'Moving Average Convergence Divergence (MACD)',
        content: <p>The MACD is a trend-following momentum indicator that shows the relationship between two moving averages of a security’s price. It consists of the MACD line, the Signal line, and a histogram. Crossovers between the MACD and Signal lines can indicate potential buy or sell signals.</p>
    },
    'RSI': {
        title: 'Relative Strength Index (RSI)',
        content: <p>The RSI is a momentum oscillator that measures the speed and magnitude of price changes. It oscillates between 0 and 100. Traditionally, an RSI above 70 is considered overbought (a potential time to sell), and an RSI below 30 is considered oversold (a potential time to buy).</p>
    }
};
export default StockAnalysisPage; 
