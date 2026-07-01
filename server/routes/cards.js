const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const Board = require('../models/Board');
const { protect } = require('../middleware/auth');

// Get all cards for a board
router.get('/board/:boardId', protect, async (req, res) => {
  try {
    const cards = await Card.find({ board: req.params.boardId })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create card
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, column, priority, assignee, dueDate, boardId } = req.body;
    const card = await Card.create({
      title,
      description,
      column,
      priority,
      assignee,
      dueDate,
      board: boardId,
      createdBy: req.user._id
    });
    const populatedCard = await Card.findById(card._id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');
    res.status(201).json(populatedCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update card
router.put('/:id', protect, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    if (card.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updatedCard = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');
    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete card
router.delete('/:id', protect, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    if (card.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await card.deleteOne();
    res.json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;