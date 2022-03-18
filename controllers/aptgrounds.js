const Aptground = require('../models/aptground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const aptgrounds = await Aptground.find({});
    res.render('aptgrounds/index', { aptgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('aptgrounds/new');
}

module.exports.createAptground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.aptground.location,
        limit: 1
    }).send()
    const aptground = new Aptground(req.body.aptground);
    aptground.geometry = geoData.body.features[0].geometry;
    aptground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    aptground.author = req.user._id;
    await aptground.save();
    console.log(aptground);
    req.flash('success', 'Successfully made a new aptground!');
    res.redirect(`/aptgrounds/${aptground._id}`)
}

module.exports.showAptground = async (req, res,) => {
    const aptground = await Aptground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!aptground) {
        req.flash('error', 'Cannot find that aptground!');
        return res.redirect('/aptgrounds');
    }
    res.render('aptgrounds/show', { aptground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const aptground = await Aptground.findById(id)
    if (!aptground) {
        req.flash('error', 'Cannot find that aptground!');
        return res.redirect('/aptgrounds');
    }
    res.render('aptgrounds/edit', { aptground });
}

module.exports.updateAptground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const aptground = await Aptground.findByIdAndUpdate(id, { ...req.body.aptground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    aptground.images.push(...imgs);
    await aptground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await aptground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated aptground!');
    res.redirect(`/aptgrounds/${aptground._id}`)
}

module.exports.deleteAptground = async (req, res) => {
    const { id } = req.params;
    await Aptground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted aptground')
    res.redirect('/aptgrounds');
}