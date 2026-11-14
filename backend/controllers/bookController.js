const Book = require('../models/Book');
const BorrowRecord = require('../models/BorrowRecord');

// @desc    Get all books with search, filter and pagination
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res, next) => {
  try {
    const { search, category, availability, page = 1, limit = 10 } = req.query;

    const query = {};

    // Search by title, author, or ISBN
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { isbn: searchRegex },
        { publisher: searchRegex },
      ];
    }

    // Filter by Category
    if (category && category !== 'All' && category !== '') {
      query.category = category;
    }

    // Filter by Availability
    if (availability === 'available') {
      query.availableCopies = { $gt: 0 };
    } else if (availability === 'unavailable') {
      query.availableCopies = 0;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalBooks = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: books.length,
      total: totalBooks,
      totalPages: Math.ceil(totalBooks / limitNum) || 1,
      currentPage: pageNum,
      books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private/Admin
exports.createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      publisher,
      publicationYear,
      description,
      coverImage,
      totalCopies,
      availableCopies,
      shelfLocation,
    } = req.body;

    const existingIsbn = await Book.findOne({ isbn });
    if (existingIsbn) {
      return res.status(400).json({ success: false, message: 'A book with this ISBN already exists' });
    }

    const copiesTotal = Number(totalCopies) || 1;
    const copiesAvailable = availableCopies !== undefined ? Number(availableCopies) : copiesTotal;

    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      publisher,
      publicationYear: Number(publicationYear),
      description: description || '',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
      totalCopies: copiesTotal,
      availableCopies: copiesAvailable,
      shelfLocation: shelfLocation || 'General Section',
    });

    res.status(201).json({
      success: true,
      book,
      message: 'Book created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book details
// @route   PUT /api/books/:id
// @access  Private/Admin
exports.updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const {
      title,
      author,
      isbn,
      category,
      publisher,
      publicationYear,
      description,
      coverImage,
      totalCopies,
      availableCopies,
      shelfLocation,
    } = req.body;

    if (isbn && isbn !== book.isbn) {
      const duplicate = await Book.findOne({ isbn, _id: { $ne: book._id } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Another book already uses this ISBN' });
      }
      book.isbn = isbn;
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (category) book.category = category;
    if (publisher) book.publisher = publisher;
    if (publicationYear) book.publicationYear = Number(publicationYear);
    if (description !== undefined) book.description = description;
    if (coverImage) book.coverImage = coverImage;
    if (shelfLocation !== undefined) book.shelfLocation = shelfLocation;

    if (totalCopies !== undefined) {
      const diff = Number(totalCopies) - book.totalCopies;
      book.totalCopies = Number(totalCopies);
      book.availableCopies = Math.max(0, book.availableCopies + diff);
    }

    if (availableCopies !== undefined) {
      book.availableCopies = Number(availableCopies);
    }

    await book.save();

    res.status(200).json({
      success: true,
      book,
      message: 'Book updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Verify if any active borrow records exist for this book
    const activeBorrows = await BorrowRecord.countDocuments({
      book: book._id,
      status: { $in: ['Issued', 'Overdue'] },
    });

    if (activeBorrows > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete book because ${activeBorrows} copy/copies are currently borrowed out. Please return all copies first.`,
      });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all distinct categories
// @route   GET /api/books/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Book.distinct('category');
    res.status(200).json({
      success: true,
      categories: categories.sort(),
    });
  } catch (error) {
    next(error);
  }
};
