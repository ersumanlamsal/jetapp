const mongoose = require('mongoose');

const conn = async () =>  {
    await mongoose.connect(process.env.ATLAS_URI)
    console.log("Database Connected")
}

module.exports = conn;