import mongoose from "mongoose";

mongoose.connect(process.env.MONGODB_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
if (connection) {
  console.log("Successfully connected to database.");
} else {
  console.log("A problem occured while connecting to the database.");
}
