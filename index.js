require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const express = require('express');
const cors = require('cors');
const requestLogger = require('./src/modules/follow-parts/middlewares/loggerMiddleware'); 

require('./src/modules/follow-parts/cronjobs/updatearrivaldays');
require('./src/modules/follow-parts/cronjobs/updatesubscription');

const authRoutes = require('./src/modules/follow-parts/routes/AuthCentralRoute');
const orderRoutes = require('./src/modules/follow-parts/routes/OrdersCentralRoute');
const adminRoutes = require('./src/modules/follow-parts/routes/AdminCentralRoute');
const settingRoute = require('./src/modules/follow-parts/routes/SettingCentralRoute');
const reportsroute = require('./src/modules/follow-parts/routes/ReportsCentralRoute');
const dealersroute = require('./src/modules/follow-parts/routes/DealersCentralRoute');
const systemroute = require('./src/modules/follow-parts/routes/SystemCentralRoute');
const dateroute = require('./src/modules/follow-parts/routes/DateCentralRoutes');

const app = express();

app.set('trust proxy', true);

const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use(requestLogger); 

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/setting', settingRoute);
app.use('/api/reports', reportsroute);
app.use('/api/dealers', dealersroute);
app.use('/api/system', systemroute);
app.use('/api/date', dateroute);

app.listen(port, () => {
  console.log(`Server is running ✅`);
});
