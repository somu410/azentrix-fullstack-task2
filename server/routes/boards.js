const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const { protect } = require('../middleware/auth');

// Get all boards for logged in user
router.get('/', protect, async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    }).populate('owner', 'name email').populate('members', 'name email');
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create board
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    const board = await Board.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id]
    });
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single board
router.get('/:id', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add member to board by email
router.post('/:id/members', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    // Check if requester is board owner
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only board owner can invite members' });
    }

    // Find user by email
    const User = require('../models/User');
    const userToAdd = await User.findOne({ email: req.body.email });
    if (!userToAdd) return res.status(404).json({ message: 'No user found with that email' });

    // Check if already a member
    if (board.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    board.members.push(userToAdd._id);
    await board.save();

    const updatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Delete board
router.delete('/:id', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await board.deleteOne();
    res.json({ message: 'Board deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;