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
app.use("/", require("./routes/api/users"));
app.use("/", auth, require("./routes/api/vendors"));
app.use("/", auth, require("./routes/api/categories"));
const productsRoute = require('./routes/api/products');
app.use(productsRoute);
app.listen(PORT, ()=> console.log(`server started on port ${PORT}!`));
