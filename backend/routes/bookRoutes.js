const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const mongoose = require('mongoose');

// Create a book
router.post('/', async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all books with optional search/filter
router.get('/', async (req, res) => {
  try {
    const { q, genre, author } = req.query;
    const filter = {};
    if (genre) filter.genre = genre;
    if (author) filter.author = author;
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ title: regex }, { author: regex }, { genre: regex }];
    }
    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a book
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });
    const book = await Book.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });
    const book = await Book.findByIdAndDelete(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Deleted', id: book._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
