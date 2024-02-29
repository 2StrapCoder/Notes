const express = require('express');
const fs = require('fs').promises; 
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static('public')); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/notes', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'db.json'), 'utf-8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to read notes' });
    }
});

app.post('/api/notes', async (req, res) => {
    const newNote = { ...req.body, id: uuidv4() };

    try {
        const data = await fs.readFile(path.join(__dirname, 'db.json'), 'utf-8');
        const notes = JSON.parse(data);
        notes.push(newNote);
        await fs.writeFile(path.join(__dirname, 'db.json'), JSON.stringify(notes, null, 2)); 
        res.json(newNote);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to save the note' });
    }
});

app.delete('/api/notes/:id', async (req, res) => {
    const noteId = req.params.id;

    try {
        const data = await fs.readFile(path.join(__dirname, 'db.json'), 'utf8');
        let notes = JSON.parse(data);
        notes = notes.filter(note => note.id !== noteId);
        await fs.writeFile(path.join(__dirname, 'db.json'), JSON.stringify(notes, null, 2)); 
        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete the note' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});