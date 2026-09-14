/**************************************************
 * @bootstrap
 */
const bootstrap = require('./config/bootstrap')
bootstrap()

/**************************************************
 * @App
 */
const path = require("path")


/**************************************************
 * @Colors
 */
require("colors")

/**************************************************
 * @Express App
 */
const express = require('express')
const app = express()

app.use(express.json({
    limit: '2gb'
}));
app.use(express.urlencoded({
    extended: true,
    limit: '2gb'
}));


// cookie parser
const cookieParser = require('cookie-parser')
app.use(cookieParser())


// Sanitize data
const mongoSanitize = require('express-mongo-sanitize')
app.use(mongoSanitize())

// Set security headers
// const helmet = require('helmet')
// app.use(helmet())

// Prevent XSS attacks
const xss = require('xss-clean')
app.use(xss())

/**************************************************
 * @Cors 
 */
require('./config/cors')(app);

// Rate limiting
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 mins
    max: 1000, // 1000 request per 5 mins
})

app.use(limiter)

// Prevent http param pollution
const hpp = require('hpp')
app.use(hpp())

/**************************************************
 * @Public Folder Middleware
 */
app.use("/public", express.static("public"));

/**************************************************
 * @NJUNCKS
 */
const nunjucks = require('nunjucks');
nunjucks.configure(path.join(__dirname, 'shared/snippets/email_markup'), {
    autoescape: true,
    express: app,
    noCache: true
});


/**************************************************
 * @Morgan middelware
 */
const morgan = require('morgan')
const morganMiddleware = require('./config/logger/morgan.logger');
app.use(morganMiddleware);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}


/**************************************************
 * @Directory (create important directory)
 */
require("./config/directory");

/**************************************************
 * @Global Config
 */
require('./config/global/index');

/**************************************************
 * @Request Context handler
 */
const requestContext = new(require('./shared/middlewares/request.context.handler.middlewares'))()

app.use(requestContext.handler.bind(requestContext))


/**************************************************
 * @Router
 */
require('./routes/router')(app)

/**************************************************
 * @Swagger Docs
 */
require('./config/swagger')(app);


/**************************************************
 * @Cron Manager
 */
const CronManager = require('./crons/CronManager');
const cronManager = new CronManager();
cronManager.initialize();

/**************************************************
 * @Error handler
 */
const errorHandler = new(require('./shared/middlewares/error.handler.middlewares'))()

app.use(errorHandler.handler.bind(errorHandler))


module.exports = app