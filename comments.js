//Create web server
const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const uuid = require('uuid');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { DATABASE_URL, PORT } = require('./config');
const { Comment } = require('./models');

//Log the http layer
app.use(morgan('common'));

//Get all comments
router.get('/', (req, res) => {
    Comment
        .find()
        .exec()
        .then(comments => {
            res.json({
                comments: comments.map(
                    (comment) => comment.apiRepr())
            });
        })
        .catch(
            err => {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            });
});

//Get comment by id
router.get('/:id', (req, res) => {
    Comment
        .findById(req.params.id)
        .exec()
        .then(comment => res.json(comment.apiRepr()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
});

//Create a new comment
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['content', 'author'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        //Check if field is in request body
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            //Return error code 400
            return res.status(400).send(message);
        }
    }

    Comment
        .create({
            id: uuid.v4(),
            content: req.body.content,