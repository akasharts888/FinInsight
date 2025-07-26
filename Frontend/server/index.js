const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require("cors");
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/auth');
const PORT = process.env.PORT || 5000;
const cookieParser = require('cookie-parser');
const companyStockRouter = require('./routes/stockRoute'); 
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,          
}));

mongoose.connect('mongodb://localhost:27017/fininsight');

app.use(express.json());
app.use(cookieParser());
app.use('/api', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stock', companyStockRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 