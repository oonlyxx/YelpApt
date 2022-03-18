if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');

// const { aptgroundSchema } = require('./schemas.js')
// const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
//authentication
const passport = require('passport');
const LocalStrategy = require('passport-local');
//model
const User = require('./models/user');
// const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
// const Aptground = require('./models/aptground');
// const Review = require('./models/review');
//routes
const userRoutes = require('./routes/users');
const aptgroundRoutes = require('./routes/aptgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoDBStore = require("connect-mongo")(session);
//const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-apt';
//connect to database
// mongoose.connect(dbUrl, {
//     // useNewUrlParser: true,
//     // useCreateIndex: true,
//     // useUnifiedTopology: trues,
//     //useFindAndModify: false
// });
const dbUrl =  'mongodb://localhost:27017/yelp-apt';
mongoose.connect(dbUrl, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: trues,
    //useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
//config for app
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
//middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))

const store = new MongoDBStore({
    url: dbUrl,
    secret: 'thisshouldbeabettersecret!',
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})



//session
const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
         // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());
// app.use(helmet());

// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/deson8lht/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );




//use middleware(session before passort.session)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



// const validateAptground = (req, res, next) => {
//     const { error } = aptgroundSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }
// }
// // const validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }
// }


app.use('/', userRoutes);
app.use('/aptgrounds', aptgroundRoutes)
app.use('/aptgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})


// app.get('/', (req, res) => {
//     res.render('home')
// });
// //home
// app.get('/aptgrounds', catchAsync(async (req, res) => {
//     const aptgrounds = await Aptground.find({});
//     res.render('aptgrounds/index', { aptgrounds })
// }));
// //create
// app.get('/aptgrounds/new', (req, res) => {
//     res.render('aptgrounds/new');
// });

// app.post('/aptgrounds', validateAptground, catchAsync(async (req, res) => {
//     const aptground = new Aptground(req.body.aptground);
//     await aptground.save();
//     res.redirect(`/aptgrounds/${aptground._id}`)
// }));
// //show
// app.get('/aptgrounds/:id', catchAsync(async (req, res,) => {

//     const aptground = await Aptground.findById(req.params.id).populate('reviews');
//     res.render('aptgrounds/show', { aptground });
// }));

// //edit
// app.get('/aptgrounds/:id/edit', catchAsync(async (req, res) => {
//     const aptground = await Aptground.findById(req.params.id)
//     res.render('aptgrounds/edit', { aptground });
// }));

// app.put('/aptgrounds/:id', validateAptground, catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const aptground= await Aptground.findByIdAndUpdate(id, { ...req.body.aptground });
//     res.redirect(`/aptgrounds/${aptground._id}`)
// }));

// //delete
// app.delete('/aptgrounds/:id', catchAsync(async (req, res) => {
//     const { id } = req.params;
//     await Aptground.findByIdAndDelete(id);
//     res.redirect('/aptgrounds');
// }));

// //review
// app.post('/aptgrounds/:id/reviews',  catchAsync(async (req, res) => {
//     const aptground = await Aptground.findById(req.params.id);
//     const review = new Review(req.body.review);
//     aptground.reviews.push(review);
//     await review.save();
//     await aptground.save();
//     res.redirect(`/aptgrounds/${aptground._id}`);
// }))


// app.delete('/aptgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
//     const { id, reviewId } = req.params;
//     await Aptground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/aptgrounds/${id}`);
// }))


// app.all('*', (req, res, next) => {
//     next(new ExpressError('Page Not Found', 404))
// })


// //error handle
// app.use((err, req, res, next) => {
//     const { statusCode = 500 } = err;
//     if (!err.message) err.message = 'Oh No, Something Went Wrong!'
//     res.status(statusCode).render('error', { err })
// })



// app.listen(3000, () => {
//     console.log('Serving on port 3000')
// })