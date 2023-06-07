require('dotenv').config();

const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const Book = require('./models/books');

mongoose.set('strictQuery', false);

//add this to parse forms in x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());


const connectDB = async () => {
    try {
         const conn = await mongoose.connect(process.env.MONGO_CONNECTION);
         console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error){
        console.log(error);
        process.exit(1);
    }

}

app.get('/', (req, res) =>{
    res.send("Welcome to the simple express Books API!");
});

app.get('/books/generate', async(req, res) => {
    try{
        await Book.insertMany([
            {
                title: "Sons of fire",
                body: "Hi this body",
                category: "Sci-fi"
            },
            {
                title: "Dungeons",
                body: "Hi this yo brotha",
                category: "Drama"
            }
        ]);
        res.status(201)
        res.send("Data successfully generated.");
    } catch (error) {
        console.log("err", + error);
    }

});

app.get('/books', async(req, res) =>{

    const bookTitle = req.query.title;
    const bookCategory = req.query.category;

    if(bookCategory){
        const books = await Book.find({category: bookCategory}).exec();

        if(books.length !== 0){
            res.status(200);
            res.json(books);
            return;
        }else{
            res.status(404);
            res.send("We could not find a match!");
            return;
        }
    }

    if(bookTitle){
        const book = await Book.find({title: bookTitle}).exec();
        if(book.length !== 0){
            res.status(200);
            res.json(book);
            return;
        }else{
            res.status(404);
            res.send("We could not find a match!");
            return;
        }
    } else{
        const book = await Book.find();

        if(book.length !== 0){
            res.status(200);
            res.json(book);
            return;
        } else {
            res.status(404);
            res.send("Something went wrong. No books were found!");
            return;
        }
    }
});

app.post('/books/add', async function (req, res) {
    //Get the parsed information

    const  bookObject = req.body;

    if(bookObject.title == null || bookObject.body == null){
        res.status(400);
        res.send("Malformed book entry. Please provide title and body.")
    }

    await Book.create(bookObject).then((book) =>
        res.json(book)
    ).catch((err) => {
        console.log(err.message);
    });
});

//This is can be seen as PATCH too, not necessary since findByIdAndUpdate accepts partial updates.
app.put('/books/:id',  async (req, res) => {
    const book = await Book.findById(req.params.id);
    if(!book){
        res.status(404);
        res.send("Book does not exist.");
    }

    await Book.findByIdAndUpdate(req.params.id, req.body)
        .then(() => {
            res.status(200);
            res.send("Book successfully updated!");
        })
        .catch(err => {
            console.log(err.message);
        });
});

app.delete('/books/:id', async function (req, res) {

    await Book.findByIdAndRemove(req.params.id).then(() => {
        res.status(200);
        res.send("Entry successfully deleted!");
    }).catch((err) => {
        console.log(err.message);
    })
})


connectDB().then(() => {
    app.listen(PORT, () =>{
        console.log(`Listening on port ${PORT}`);
    })
});
