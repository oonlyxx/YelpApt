const Aptground = require('../models/aptground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const aptground = await Aptground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    aptground.reviews.push(review);
    await review.save();
    await aptground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/aptgrounds/${aptground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Aptground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/aptgrounds/${id}`);
}