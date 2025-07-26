import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  } from "recharts";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

const PredictionPage = () => {
    const location = useLocation();
    const { name, symbol } = location.state || {};

    const [days, setDays] = useState(null);
    const [loading, setLoading] = useState(false);
    const [predictions, setPredictions] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    
    const handleFetchPrediction = async () => {
        setLoading(true);
        setError("");
    
        try {
            const response = await fetch("http://localhost:5000/api/stock/predict", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ symbol, days }),
            });

            const data = await response.json();
            if (data.error || !data.predictions) {
                throw new Error(data.error || "No prediction data received");
            }
            setPredictions(data.predictions);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch predictions.");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 to-indigo-100 p-6 relative">
            <button
                onClick={() => navigate(-1)}  // Go back one page in history
                className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 font-medium transition-colors bg-gradient-to-b"
            >
                ← Back
            </button>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-10"
            >
                <h1 className="text-4xl font-bold text-indigo-700 mb-2 text-center">{name} ({symbol}) Prediction</h1>
                <p className="text-gray-600 text-center mb-8">
                    Predicting next <strong>{days}</strong> days for <strong>{name} ({symbol})</strong>
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
                    <input
                        type="number"
                        min="1"
                        max="30"
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value))}
                        className="w-24 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-400"
                        placeholder="Days"
                    />
                    <button
                        onClick={handleFetchPrediction}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all"
                    >
                        Predict
                    </button>
                </div>
                {loading && (
                    <p className="text-center text-lg text-indigo-600 my-6 animate-pulse">Fetching prediction data...</p>
                )}
                {error && (
                    <p className="text-red-600 text-center font-medium mt-4">{error}</p>
                )}

                {predictions.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-10"
                    >
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Price Forecast Chart</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={predictions}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={['auto', 'auto']} />
                                <Tooltip />
                                <Line 
                                    type="monotone" 
                                    dataKey="predicted_close" 
                                    stroke="#4f46e5" 
                                    strokeWidth={3}
                                    dot={{r:4}}
                                    activeDot={{ r: 6 }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        <h2 className="text-xl font-semibold mt-10 mb-4 text-gray-800">Forecasted Data</h2>
                        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg mt-8">
                            <motion.table 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="min-w-full text-sm text-gray-800"
                            >
                                <thead className="bg-indigo-50 border-b border-gray-200 text-indigo-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold tracking-wide uppercase">Date</th>
                                        <th className="px-6 py-4 text-left font-semibold tracking-wide uppercase">Predicted Close</th>
                                        <th className="px-6 py-4 text-left font-semibold tracking-wide uppercase">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {predictions.map((item, index) => {
                                        const sparkData = predictions.slice(Math.max(index - 6, 0), index + 1);
                                        const trendLabel = (() => {
                                            if (sparkData.length < 2) return "→ Stable";
                                            const last = sparkData[sparkData.length - 1].predicted_close;
                                            const prev = sparkData[sparkData.length - 2].predicted_close;
                                            const diff = last - prev;
                                        
                                            if (diff > 0.1) return "↑ Rising";
                                            if (diff < -0.1) return "↓ Falling";
                                            return "→ Stable";
                                        })();
                                        const trendColor = trendLabel === "↑ Rising" ? "#10B981" // green
                                                        : trendLabel === "↓ Falling" ? "#EF4444" // red
                                                        : "#6B7280";
                                        return (
                                            <motion.tr
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-indigo-50 transition-colors"
                                            >
                                                <td className="px-6 py-3 whitespace-nowrap font-medium">{item.date}</td>
                                                <td className="px-6 py-3 font-semibold text-gray-700">${item.predicted_close.toFixed(2)}</td>
                                                <td className="px-6 py-3 w-[120px">
                                                    <ResponsiveContainer width="100%" height={40}>
                                                        <LineChart data={sparkData}>
                                                            <Tooltip
                                                                wrapperStyle={{ outline: "none" }}
                                                                contentStyle={{ backgroundColor: "white", borderRadius: "6px", fontSize: "12px" }}
                                                                labelStyle={{ color: "#4B5563" }}
                                                                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
                                                            />
                                                            <Line
                                                                type="monotone"
                                                                dataKey="predicted_close"
                                                                stroke={trendColor}
                                                                strokeWidth={2}
                                                                dot={false}
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                    <span
                                                        className={`block text-xs mt-1 font-medium ${
                                                            trendColor === "#10B981" ? "text-green-600" :
                                                            trendColor === "#EF4444" ? "text-red-600" :
                                                            "text-gray-500"
                                                        }`}
                                                    >
                                                        {trendLabel}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        )
                                    })}
                                </tbody>
                            </motion.table>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    )
}
export default PredictionPage;