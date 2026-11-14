import React, { useState, useEffect, useCallback } from 'react';
import { Search, BookOpen, Info, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';

const BrowseBooks = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  // Book Details Modal
  const [selectedBook, setSelectedBook] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { showToast } = useToast();

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/books', {
        params: {
          search,
          category: selectedCategory,
          availability: selectedAvailability,
          page: currentPage,
          limit: 8,
        },
      });
      if (res.data.success) {
        setBooks(res.data.books);
        setTotalPages(res.data.totalPages);
        setTotalBooks(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load books:', err);
      showToast('Error', 'Failed to retrieve books from catalog', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedAvailability, currentPage, showToast]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/books/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to get categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  const handleOpenDetails = (book) => {
    setSelectedBook(book);
    setIsDetailsOpen(true);
  };

  return (
    <div className="fade-in">
      <div className="page-header-actions">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>College Central Book Catalog</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Explore {totalBooks} academic textbooks, literature, and reference volumes
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedAvailability}
          onChange={(e) => {
            setSelectedAvailability(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Books</option>
          <option value="available">Available in Stock</option>
          <option value="unavailable">Currently Borrowed Out</option>
        </select>
      </div>

      {/* Books Grid */}
      {loading ? (
        <LoadingSpinner text="Searching catalog shelves..." />
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Matching Books Found"
          description="Try broadening your search term or selecting a different category."
        />
      ) : (
        <>
          <div className="book-grid">
            {books.map((book) => (
              <div key={book._id} className="book-card">
                <div className="book-cover-container">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="book-cover-img"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  <div className="book-availability-tag">
                    <span
                      className={`badge ${
                        book.availableCopies > 0 ? 'badge-available' : 'badge-unavailable'
                      }`}
                    >
                      {book.availableCopies > 0
                        ? `${book.availableCopies} in Stock`
                        : 'Borrowed Out'}
                    </span>
                  </div>
                </div>

                <div className="book-card-body">
                  <div className="book-category">{book.category}</div>
                  <h4 className="book-title" title={book.title}>
                    {book.title}
                  </h4>
                  <div className="book-author">by {book.author}</div>

                  <div className="book-meta">
                    <span>ISBN: {book.isbn}</span>
                    <span>Stack: {book.shelfLocation}</span>
                  </div>

                  <div className="book-card-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => handleOpenDetails(book)}
                    >
                      <Info size={14} /> View Details & Shelf Info
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalBooks}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </>
      )}

      {/* Book Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Book Details & Location"
        size="md"
      >
        {selectedBook && (
          <div>
            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              <img
                src={selectedBook.coverImage}
                alt={selectedBook.title}
                style={{
                  width: 110,
                  height: 150,
                  objectFit: 'cover',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                }}
              />
              <div>
                <span className="badge badge-info" style={{ marginBottom: 6 }}>
                  {selectedBook.category}
                </span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0' }}>
                  {selectedBook.title}
                </h4>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  by {selectedBook.author}
                </div>
                <div style={{ fontSize: '0.82rem', marginTop: 8 }}>
                  <strong>Publisher:</strong> {selectedBook.publisher} ({selectedBook.publicationYear})
                </div>
                <div style={{ fontSize: '0.82rem' }}>
                  <strong>ISBN:</strong> {selectedBook.isbn}
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: 14,
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.85rem' }}>Shelf / Stack Location:</span>
                <strong style={{ color: 'var(--primary-700)' }}>{selectedBook.shelfLocation}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.85rem' }}>Available Copies:</span>
                <strong style={{ color: selectedBook.availableCopies > 0 ? '#166534' : 'var(--danger)' }}>
                  {selectedBook.availableCopies} of {selectedBook.totalCopies} Copies
                </strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
                Visit the circulation desk with your student ID card to issue this book.
              </div>
            </div>

            {selectedBook.description && (
              <div>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>Synopsis:</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {selectedBook.description}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BrowseBooks;
