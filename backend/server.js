require('dotenv').config({ path: `.env` });
const express = require('express');
const connectDB = require('./config/db')
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors')
const bodyParser = require('body-parser')

//connect db
connectDB();

app.use(cors({origin:'http://localhost:3000'}));
app.use(express.json({extended : false}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
const auth = require('./middlewares/authMiddleware');
app.use("/", require("./routes/api/users"));
app.use("/", auth, require("./routes/api/vendors"));
app.use("/", auth, require("./routes/api/categories"))
app.use("/", auth, require("./routes/api/cart"))
app.use("/", auth, require("./routes/api/review"))
const productsRoute = require('./routes/api/products');
app.use('/api/orders', auth, require('./routes/api/order'));
app.use(productsRoute);
app.listen(PORT, ()=> console.log(`server started on port ${PORT}!`));
