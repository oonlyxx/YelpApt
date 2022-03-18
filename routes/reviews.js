const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

const Aptground = require('../models/aptground');
const Review = require('../models/review');

const reviews = require('../controllers/reviews');
// const { reviewSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;

// const validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }
// }



// router.post('/', validateReview, catchAsync(async (req, res) => {
//     const aptground = await Aptground.findById(req.params.id);
//     const review = new Review(req.body.review);
//     aptground.reviews.push(review);
//     await review.save();
//     await aptground.save();
//     req.flash('success', 'Created new review!');
//     res.redirect(`/aptgrounds/${aptground._id}`);
// }))

// router.delete('/:reviewId', catchAsync(async (req, res) => {
//     const { id, reviewId } = req.params;
//     await Aptground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);
//     req.flash('success', 'Successfully deleted review')
//     res.redirect(`/aptgrounds/${id}`);
// }))

module.exports = router;