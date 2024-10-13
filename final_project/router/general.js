const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();
const fs = require('fs');

public_users.post("/register", (req, res) => {
  //Write your code here'
  const { username, email, password } = req.body;

  // Basic validation (consider more thorough validation)
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Check for existing user (replace with actual user existence check)
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(409).json({
      message: "Email already registered"
    });
  }

  // (For real applications, hash the password before storing)
  const newUser = { username, email, password };
  users.push(newUser);

  return res.status(201).json({
    message: "User registered successfully"
  });

});



// Get the book list available in the shop using Promise callbacks
public_users.get('/', function (req, res) {
  axios.get('http://localhost:5000/booksdb.js')
    .then(response => {
      books = response.data;
      res.status(200).json(books);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Error fetching book list' });
    });
})

// Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  axios.get(`http://localhost:5000/booksdb.js/${isbn}`)
    .then(response => {
      const book = response.data;
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: 'Book not found' });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({
        message:
          'Error fetching book details'
      });
    });
});


// Get book details based on Author using Async/Await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/booksdb.js?author=${author}`);
    // Replace with your book API endpoint (may require search parameter)
    const matchingBooks = response.data.filter(book => book.author.toLowerCase().includes(author.toLowerCase()));

    if (matchingBooks.length > 0) {
      res.status(200).json(matchingBooks);
    } else {
      res.status(404).json({ message: 'No books found by that author' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching book details' });
  }
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  //Write your code here
  const title = req.params.title;
  const matchingBooks = books.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: 'No books found by that title' });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books.find(book => book.isbn === isbn);

  if (book && book.reviews) { // Check if reviews exist for the book
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: 'No reviews found for this book' });
  }
});

module.exports.general = public_users;
