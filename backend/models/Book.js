const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide book title'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Please provide author name'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'Please provide ISBN number'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide book category'],
      trim: true,
    },
    publisher: {
      type: String,
      required: [true, 'Please provide publisher name'],
      trim: true,
    },
    publicationYear: {
      type: Number,
      required: [true, 'Please provide publication year'],
    },
    description: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    },
    totalCopies: {
      type: Number,
      required: [true, 'Please provide total copies'],
      min: [0, 'Total copies cannot be negative'],
      default: 1,
    },
    availableCopies: {
      type: Number,
      required: [true, 'Please provide available copies'],
      min: [0, 'Available copies cannot be negative'],
      default: 1,
    },
    shelfLocation: {
      type: String,
      default: 'General Stack',
    },
  },
  {
    timestamps: true,
  }
);

// Index for full-text search
bookSchema.index({ title: 'text', author: 'text', isbn: 'text', category: 'text' });

module.exports = mongoose.model('Book', bookSchema);
