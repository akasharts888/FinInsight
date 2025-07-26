import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import myVideo from "../assets/Video_Script_Stock_Analysis_App.mp4"

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col justify-center items-center px-6 py-12 text-center">
            <motion.h1
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl md:text-6xl font-extrabold text-indigo-700 drop-shadow-lg"
            >
                Predict the Future of Stocks with AI
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-lg text-gray-600 max-w-2xl"
            >
                Our intelligent platform uses advanced machine learning to forecast stock prices,
                helping you invest smarter and faster.
            </motion.p>
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, duration: 0.4, type: "spring" }}
                className="mt-10"
            >
                <Link to="/signup">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lg transition-all">
                    Start Analyzing
                </button>
                </Link>
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-16 text-gray-500 animate-bounce"
            >
               
            </motion.div>
            <div className="bg-white py-20 px-6">
                <h2 className="text-4xl font-bold text-indigo-700 mb-12">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    <motion.div whileHover={{ scale: 1.05 }} className="bg-indigo-50 p-6 rounded-2xl shadow-md">
                        <h3 className="text-xl font-semibold text-indigo-800 mb-2">🔍 Smart Stock Search</h3>
                        <p className="text-gray-600">Quickly search and explore companies with predictive insights.</p>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} className="bg-purple-50 p-6 rounded-2xl shadow-md">
                        <h3 className="text-xl font-semibold text-purple-800 mb-2">📊 Interactive Predictions</h3>
                        <p className="text-gray-600">Visualize future price trends using charts and sparklines.</p>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} className="bg-pink-50 p-6 rounded-2xl shadow-md">
                        <h3 className="text-xl font-semibold text-pink-800 mb-2">💡 AI-Driven Insights</h3>
                        <p className="text-gray-600">Our ML backend analyzes market behavior and signals.</p>
                    </motion.div>
                </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-indigo-100 py-24 px-6 text-center">
                <h2 className="text-4xl font-bold text-indigo-700 mb-8">Live Prediction Preview</h2>
                <p className="max-w-2xl mx-auto text-gray-600 mb-10">
                    Here's a glimpse of how predictions and technical indicators are beautifully displayed in our dashboard.
                </p>
                <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-black ring-opacity-5">
                    <video
                        className="w-full h-full object-cover"
                        src={myVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        </div>
    )
}

export default LandingPage;
