require('dotenv').config();

const express = require('express');
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;
const Book = require('./models/books');


mongoose.set('strictQuery', false);
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
    res.send({title:'Books'});
});

app.get('/add-note', async(req, res) => {
    try{
        await Book.insertMany([
            {
                title: "Sons",
                body: "Hi this body",
            },
            {
                title: "Daughters",
                body: "Hi this yo",
            }
        ]);
        res.send("Data sent.");
    } catch (error) {
        console.log("err", + error);
    }

});

app.get('/books', async(req, res) =>{

    const bookTitle = req.query.title;

    if(bookTitle){
        const book = await Book.findOne({title: bookTitle}).exec();
        if(book){
            res.status(200);
            res.json(book);
        }else{
            res.status(404);
            res.send("We could not find the file");
        }
    } else{
        const book = await Book.find();

        if(book){
            res.status(200);
            res.json(book)
        } else {
            res.status(404)
            res.send("Something went wrong. No books were found!");
        }
    }




});

connectDB().then(() => {
    app.listen(PORT, () =>{
        console.log(`Listerning on port ${PORT}`);
    })
});