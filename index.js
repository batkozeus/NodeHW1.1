// const app = require("express")();
const express = require("express");
const app = express();
const config = require("./config/development");
const bodyParser = require('body-parser');
const slug = require('slug');
const {merge} = require('lodash');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use((req, res, next) => {
    console.log(`${req.url} --> ${req.method} --> ${Date.now()}`);
    next();
})

// endpoint = url + method

const USERS = require("./mock-data/users");

// Controller
const getUsers = (req, res, next) => {
    req.users = USERS;
    next();
};

const addUser = (req, res, next) => {
    const user = req.body;
    USERS.push(user);
    req.users = USERS;
    next();
};

const deleteUser = (req, res, next) => {
    const index = req.params.index;
    USERS.splice(index, 1);
    req.users = USERS;
    next();
};

const changeUser = (req, res, next) => {
    const index = req.params.index;
    const user = req.body;
    USERS.splice(index, 1, user);
    req.users = USERS;
    next();
};

const sendUsers = (req, res, next) => {
    res.status(200);
    res.json(req.users);
};

const getBooks = (req, res, next) => {
    const index = req.params.index;
    req.books = USERS[index].books;
    next();
};

const addBook = (req, res, next) => {
    const index = req.params.index;
    const book = req.body;
    USERS[index].books.push(book);
    req.books = USERS[index].books;
    next();
};

const deleteBook = (req, res, next) => {
    const index = req.params.index;
    const title = req.params.title;
    USERS[index].books.splice(title, 1);
    req.books = USERS[index].books;
    next();
};

const changeBook = (req, res, next) => {
    const index = req.params.index;
    const title = req.params.title;
    const book = req.body;
    USERS[index].books.splice(title, 1, book);
    req.books = USERS[index].books;
    next();
};

const sendBooks = (req, res, next) => {
    res.status(200);
    res.json(req.books);
};

const getBooksTitle = (req, res, next) => {
    const index = req.params.index;
    const title = req.params.title;
    const searchedBook = USERS[index].books.find(book =>
        slug(book.title) == title
    );
    req.books = searchedBook;
    next();
};

const deleteBookTitle = (req, res, next) => {
    const index = req.params.index;
    const title = req.params.title;
    const changedBookList = USERS[index].books.filter(book =>
        slug(book.title).toLowerCase() !== title.toLowerCase()
    );
    USERS[index].books = changedBookList;
    req.books = USERS[index].books;
    next();
};

const changeBookTitleWithoutLodash = (req, res, next) => {
    const index = req.params.index;
    const title = req.params.title;
    const newBook = req.body;
    const changedBookList = USERS[index].books.map(oldBook =>
        slug(oldBook.title) == title ? newBook : oldBook
    );
    USERS[index].books = changedBookList;
    req.books = USERS[index].books;
    next();
};

const changeBookTitleWithLodash = (req, res, next) => {
    const index = req.params.index;
    const title = req.params.title;
    const newBook = req.body;
    const changedBook = USERS[index].books.find((oldBook) => {
        return slug(oldBook.title).toLowerCase() === title.toLowerCase();
    });
    merge(changedBook, newBook);
    req.books = changedBook;
    next();
};

// Users
app.get("/users/", getUsers, sendUsers);
app.post("/users/", addUser, sendUsers);
app.delete("/users/:index/", deleteUser, sendUsers);
app.put("/users/:index/", changeUser, sendUsers); // (Lodash) _.merge

// Books
app.get("/users/:index/books", getBooks, sendBooks);
app.post("/users/:index/books", addBook, sendBooks);
// app.put("/users/:index/books/:title", changeBook, sendBooks);
// app.delete("/users/:index/books/:title", deleteBook, sendBooks);

// *
app.get("/users/:index/books/:title", getBooksTitle, sendBooks);
app.put("/users/:index/books/:title", changeBookTitleWithLodash, sendBooks);
app.delete("/users/:index/books/:title", deleteBookTitle, sendBooks);

// app.post("/users/")
// app.put("/users/")
// app.delete("/users/")
// app.all("/users/")

// Not Found Error
app.use((req, res, next) => {
    const error = new Error("Not Found!");
    next(error);
})

// All errors
app.use((err, req, res, next) => {
    res.status(500);
    res.json({
        error: err.message,
        stack: err.stack
    })
})

app.listen(config.port);