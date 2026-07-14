const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(
        "mongodb://abhijeetpal0307_db_user:1hbrT6ZxQbTqt9dN@ac-u6ezgsi-shard-00-00.ttkhib1.mongodb.net:27017,ac-u6ezgsi-shard-00-01.ttkhib1.mongodb.net:27017,ac-u6ezgsi-shard-00-02.ttkhib1.mongodb.net:27017/?ssl=true&replicaSet=atlas-5qhbe5-shard-0&authSource=admin&appName=Cluster1",
    );
};

module.exports = connectDB;

