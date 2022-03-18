const express = require('express');
const router = express.Router();
const aptgrounds = require('../controllers/aptgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateAptground} = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
// const ExpressError = require('../utils/ExpressError');
const Aptground = require('../models/aptground');
// const { aptgroundSchema } = require('../schemas.js');

router.route('/')
    .get(catchAsync(aptgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateAptground, catchAsync(aptgrounds.createAptground))
    // .post(upload.array('image'), (req, res) =>{
    //     console.log(req.body, req.files);
    //     res.send("It worked!!")
    // })

router.get('/new', isLoggedIn, aptgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(aptgrounds.showAptground))
    .put(isLoggedIn, isAuthor, upload.array('image'),validateAptground, catchAsync(aptgrounds.updateAptground))
    .delete(isLoggedIn, isAuthor, catchAsync(aptgrounds.deleteAptground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(aptgrounds.renderEditForm))

// const validateAptground = (req, res, next) => {
//     const { error } = aptgroundSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }
// }



// router.get('/', catchAsync(async (req, res) => {
//     const aptgrounds = await Aptground.find({});
//     res.render('aptgrounds/index', { aptgrounds })
// }));


// router.get('/new',isLoggedIn, (req, res) => {
//     res.render('aptgrounds/new');
// })


// router.post('/', isLoggedIn, validateAptground, catchAsync(async (req, res, next) => {
//     // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
//     const aptground = new Aptground(req.body.aptground);
//     // aptground.author = req.user._id;
//     await aptground.save();
//     req.flash('success', 'Successfully made a new aptground!');
//     res.redirect(`/aptgrounds/${aptground._id}`)
// }))

// router.get('/:id', catchAsync(async (req, res,) => {
//     // const aptground = await Aptground.findById(req.params.id).populate({
//     //     path: 'reviews',
//     //     populate: {
//     //         path: 'author'
//     //     }

//     // }).populate('author');
//     // console.log(aptground);
//     // if (!aptground) {
//     //     req.flash('error', 'Cannot find that aptground!');
//     //     return res.redirect('/aptgrounds');
//     // }
//     // res.render('aptgrounds/show', { aptground });
//     const aptground = await Aptground.findById(req.params.id).populate('reviews');
//     if (!aptground) {
//         req.flash('error', 'Cannot find that aptground!');
//         return res.redirect('/aptgrounds');
//     }
//     res.render('aptgrounds/show', { aptground });
// }));

// router.get('/:id/edit', isLoggedIn,  catchAsync(async (req, res) => {
//     const aptground = await Aptground.findById(req.params.id)
//     if (!aptground) {
//         req.flash('error', 'Cannot find that aptground!');
//         return res.redirect('/aptgrounds');
//     }
//     res.render('aptgrounds/edit', { aptground });
// }))

// router.put('/:id', isLoggedIn, validateAptground, catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const aptground = await Aptground.findByIdAndUpdate(id, { ...req.body.aptground });
//     req.flash('success', 'Successfully updated aptground!');
//     res.redirect(`/aptgrounds/${aptground._id}`)
// }));

// router.delete('/:id',isLoggedIn, catchAsync(async (req, res) => {
//     const { id } = req.params;
//     await Aptground.findByIdAndDelete(id);
//     req.flash('success', 'Successfully deleted aptground')
//     res.redirect('/aptgrounds');
// }));

module.exports = router;