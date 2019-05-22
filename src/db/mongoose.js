
// const MongoClient = require('mongodb').MongoClient;
// var uri = "mongodb://andresmweber:p5GxnG3AzEgrTV@taskmanager-shard-00-00-lvzkv.mongodb.net:27017,taskmanager-shard-00-01-lvzkv.mongodb.net:27017,taskmanager-shard-00-02-lvzkv.mongodb.net:27017/test?ssl=true&replicaSet=taskmanager-shard-0&authSource=admin&retryWrites=true";
// MongoClient.connect(uri, {useNewUrlParser: true}, function (err, client) {
//     console.log(err)
//     const collection = client.db("test").collection("devices");
//     client.close();
// });

const mongoose = require('mongoose');

console.log('Attempting to connect to server...');
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})

var connection = mongoose.connection;

connection.on('connected', () => console.log('connected to db'));
connection.on('disconnected', () => console.log('disconnected from db'));

connection.on('SIGINT', () => {
    connection.close(() => {
        console.log('Lost connection to db due to process termination');
        process.exit();
    });
});

module.exports = connection;