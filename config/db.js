const mongoose = require('mongoose');
function connectDB() {
    // Database connection 🥳
    mongoose.connect("mongodb+srv://arpitdobariya23:Arpit123@cluster0.jz6lcpo.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true});
    const connection = mongoose.connection;
    connection.on("error", console.error.bind(console, "connection error: "));
    connection.once('open', () => {
        console.log('Database connected 🥳🥳🥳🥳');
    });
}

// mIAY0a6u1ByJsWWZ

module.exports = connectDB;