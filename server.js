const PORT = process.env.PORT || 3001;
const fs = require('fs');
const path = require('path');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();

const allNotes = () => {
    return readFile ('db/db.json', 'utf-8').then(notes => [].concat(JSON.parse(notes)))
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
    allNotes().then(notes => res.json(notes))
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.post('/api/notes', (req, res) => {
    allNotes().then(oldNotes => {
        console.log(oldNotes)
        const { title, text } = req.body
        const noteArray = [...oldNotes, { title, text, id:uuidv4() }]
        console.log(noteArray)
        writeFile(
            path.join(__dirname, './db/db.json'),
            JSON.stringify(noteArray)
        ).then(()=> res.json({
            msg:"new note added"
        }));
    })
    // const newNote = createNewNote(req.body, allNotes);
    // res.json(newNote);
});

app.delete('/api/notes/:id', (req, res) => {
    allNotes().then(oldNotes => {
        const noteArray = oldNotes.filter(note => note.id !== req.params.id)
        console.log(noteArray)
        writeFile(
            path.join(__dirname, './db/db.json'),
            JSON.stringify(noteArray)
        ).then(()=> res.json({
            msg:"note deleted"
        }));
    }) 
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});