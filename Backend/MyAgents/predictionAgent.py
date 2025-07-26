import numpy as np
import pandas as pd
import yfinance as yf
from tensorflow.keras.models import load_model
import joblib
import os
from datetime import datetime, timedelta

class PredictionAgent:
    def __init__(self, model_dir="Stock_Prediction_Models"):
        self.model_dir = model_dir

    def predict_future(self, ticker: str, days_to_predict: int):
        try:
            model_path = os.path.join(self.model_dir, f"{ticker}_model.h5")
            scaler_path = os.path.join(self.model_dir, f"{ticker}_scaler.gz")
            
            if not os.path.exists(model_path) or not os.path.exists(scaler_path):
                raise FileNotFoundError(f"Model or scaler for {ticker} not found.")

            model = load_model(model_path)
            scaler = joblib.load(scaler_path)
        except Exception as e:
            raise RuntimeError(f"Error loading model/scaler for {ticker}: {e}")
        

        end_date = datetime.now()
        start_date = end_date - timedelta(days=90)

        hist_data = yf.download(ticker, start=start_date, end=end_date)['Close']
        if len(hist_data) < 60:
            raise ValueError("Not enough historical data to make a prediction (need 60 days).")
            
        recent_data = hist_data.tail(60).values.reshape(-1, 1)

        predictions = []
        current_input = scaler.transform(recent_data)

        for _ in range(days_to_predict):
            # Reshape for LSTM input: (1, 60, 1)
            input_for_pred = np.reshape(current_input, (1, 60, 1))
            
            # Predict the next scaled price
            predicted_scaled = model.predict(input_for_pred)
            
            # Inverse transform to get the actual price
            predicted_price = scaler.inverse_transform(predicted_scaled)
            predictions.append(predicted_price[0][0])
            
            # Update the input sequence: drop the oldest day and append the new prediction
            current_input = np.append(current_input[1:], predicted_scaled, axis=0)

        return predictions
        
