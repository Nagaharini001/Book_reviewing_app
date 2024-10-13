const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // For secure password hashing
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
  "username": "Nagaharini",
  "email": "nagaharini@email.com",
  "passwordHash": "your_hashed_password" // Replace with the actual hashed password
}]; // Replace with user data from secure storage

async function createUser() {



  const saltRounds = 10; // Adjust the salt rounds as needed

  const passwordHash = await bcrypt.hash('naga123', saltRounds); // Replace 'naga123' with the actual password

  const user = {
    username: "Nagaharini",
    email: "nagaharini@email.com",
    passwordHash: passwordHash
  };
}
const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
  return username && username.trim().length >= 6;
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  const user = users.find(u => u.username === username);
  if (!user) {
    return false;
  }

  return bcrypt.compare(password, user.passwordHash); // Compare hashed passwords
};

// Function to generate a JWT token
const generateToken = (user) => {
  const payload = {
    username: user.username
  };

  // Replace with a strong secret key and environment variable
  // NEVER store the secret key in the code!
  const secret = process.env.JWT_SECRET || 'your_strong_secret_key';
  const options = { expiresIn: '1h' }; // Token expires in 1 hour

  return jwt.sign(payload, secret, options);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!isValid(username) || !password) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  const authenticated = authenticatedUser(username, password);
  if (!authenticated) {
    return res.status(401).json({ message: "Login not successful" });
  }

  const token = generateToken(users.find(u => u.username === username));
  res.json({ message: "Login successful", token });
});

// Middleware to verify JWT token and extract user data
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request object
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }

  return res.status(300).json({ message: "Yet to be implemented" });
};

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const { isbn, review } = req.body;
  const user = req.user;

  // Find the book by ISBN
  const book = books.find(b => b.isbn === isbn);

  // Check if the book exists
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has already reviewed the book
  const existingReview = book.reviews.find(r => r.user === user.username);

  // If the user has already reviewed the book, update the existing review
  if (existingReview) {
    existingReview.review = review;
    res.json({ message: "Review modified successfully" });
  } else {
    // If the user hasn't reviewed the book yet, add a new review
    book.reviews.push({
      user: user.username,
      review: review
    });

  }
});

regd_users.delete("/auth/review/:isbn", verifyJWT, (req, res) => {
  const { isbn } = req.params;
  const user = req.user;

  // Find the book by ISBN
  const book = books.find(b => b.isbn === isbn);

  // Check if the book exists
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Find the review by user and ISBN
  const reviewIndex = book.reviews.findIndex(r => r.user === user.username && r.isbn === isbn);

  // Check if the review exists
  if (reviewIndex === -1) {
    return res.status(404).json({ message: "Review not found" });
  }

  // Delete the review
  book.reviews.splice(reviewIndex, 1);

  res.json({ message: "Review deleted successfully" });
});

createUser();

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;