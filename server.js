const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handle uncaught exception
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION 🎇 Shutting down...');
  console.log(err);
  process.exit(1);
});

// Configure environment variable
dotenv.config({ path: './.env' });
const app = require('./app');

// Connect to Atlas Database
const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose.set({ strictQuery: true });
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successfull!'));

// Set the port for the connection
const port = process.env.PORT || 3000;

// Starting the express server
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handling unhandled rejection
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 🎇 Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
