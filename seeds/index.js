const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors } = require('./seedHelpers');
const Aptground = require('../models/aptground');

mongoose.connect('mongodb://localhost:27017/yelp-apt', {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

// const p = new Aptground({
//     "title": "36 West End Avenue",
//     "price": 3115,
//     "type": "Studio",
//     "img": "https://source.unsplash.com/collection/2283835/1600x900",
//     "description": "Here is your dream apartment!",
//     "location": "Upper West side"

// })

// p.save().then(p => {
//     console.log(p)
// })
//   .catch(e => {
//       console.log(e)
//   })


// const db = mongoose.connection;

// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database connected");
// });


const seedDB = async () => {
    await Aptground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 500) + 2200;
        const apt = new Aptground({
            author: '6233691ada287ad95ce167ad',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)}`,
            // image: 'https://source.unsplash.com/collection/2283835/1600x900',
            description: 'Hey there! This is your dream apartment!!!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/deson8lht/image/upload/v1647568364/YelpCamp/pv7o6jtmuxshjh2jonmd.jpg',
                    filename: 'YelpCamp/pv7o6jtmuxshjh2jonmd'
                },
                {
                    url: 'https://res.cloudinary.com/deson8lht/image/upload/v1647568071/YelpCamp/ptaspqrasqmplxitc9t0.jpg',
                    filename: 'YelpCamp/ptaspqrasqmplxitc9t0'
                }
            ]
        })
        await apt.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})