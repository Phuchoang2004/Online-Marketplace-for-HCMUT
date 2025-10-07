require('dotenv').config({ path: `.env` });
const express = require('express');
const connectDB = require('./config/db')
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors')

//connect db
connectDB();

app.use(cors({origin:'http://localhost:3000'}));
app.use(express.json({extended : false}));
const auth = require('./middlewares/authMiddleware');
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.listen(PORT, ()=> console.log(`server started on port ${PORT}!`));
