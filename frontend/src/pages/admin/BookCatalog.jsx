import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, BookOpen, Filter } from 'lucide-react';
import api from '../../services/api';
import useToast from '../../hooks/useToast';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';

const initialForm = {
  title: '',
  author: '',
  isbn: '',
  category: 'Computer Science',
  publisher: '',
  publicationYear: 2024,
  description: '',
  coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
  totalCopies: 5,
  shelfLocation: 'Stack A-1',
};

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBookId, setEditBookId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

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
      console.error('Failed to fetch books:', err);
      showToast('Error', 'Failed to load catalog books', 'error');
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
      console.error('Error fetching categories:', err);
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

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditBookId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setIsEditing(true);
    setEditBookId(book._id);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publisher: book.publisher,
      publicationYear: book.publicationYear,
      description: book.description || '',
      coverImage: book.coverImage || initialForm.coverImage,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      shelfLocation: book.shelfLocation || 'Stack A-1',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        const res = await api.put(`/books/${editBookId}`, formData);
        if (res.data.success) {
          showToast('Updated', 'Book details updated successfully', 'success');
        }
      } else {
        const res = await api.post('/books', formData);
        if (res.data.success) {
          showToast('Created', 'New book added to library catalog', 'success');
        }
      }
      setIsModalOpen(false);
      fetchBooks();
      fetchCategories();
    } catch (err) {
      console.error(err);
      showToast('Error', err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await api.delete(`/books/${id}`);
      if (res.data.success) {
        showToast('Deleted', `Book "${title}" removed from catalog`, 'success');
        fetchBooks();
      }
    } catch (err) {
      showToast('Action Blocked', err.response?.data?.message || 'Cannot delete book', 'error');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header-actions">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Library Catalog Repository</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {totalBooks} total books recorded across categories
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} /> Add New Book
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search books by title, author, or ISBN..."
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
          <option value="all">All Copies</option>
          <option value="available">Available in Stock (>0)</option>
          <option value="unavailable">Out of Stock (0 Available)</option>
        </select>
      </div>

      {/* Book Grid */}
      {loading ? (
        <LoadingSpinner text="Retrieving book catalog..." />
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Books Found"
          description="We couldn't find any catalog books matching your search or category filters."
          actionLabel="Add a New Book"
          onAction={handleOpenAddModal}
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
                      e.target.src = initialForm.coverImage;
                    }}
                  />
                  <div className="book-availability-tag">
                    <span
                      className={`badge ${
                        book.availableCopies > 0 ? 'badge-available' : 'badge-unavailable'
                      }`}
                    >
                      {book.availableCopies > 0
                        ? `${book.availableCopies} Available`
                        : 'Out of Stock'}
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
                    <span>Stack: {book.shelfLocation || 'Main'}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      marginTop: 8,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span>Total Copies: <strong>{book.totalCopies}</strong></span>
                    <span>Available: <strong>{book.availableCopies}</strong></span>
                  </div>

                  <div className="book-card-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleOpenEditModal(book)}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(book._id, book.title)}
                      title="Delete Book"
                      aria-label="Delete Book"
                    >
                      <Trash2 size={14} />
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Book Details' : 'Add New Book to Catalog'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Book Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Introduction to Algorithms"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Author(s) *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Thomas H. Cormen"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">ISBN Number *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 978-0262033848"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Computer Science, Mathematics"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Publisher *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. MIT Press"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Publication Year *</label>
              <input
                type="number"
                className="form-control"
                value={formData.publicationYear}
                onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Inventory Copies *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                required
              />
            </div>

            {isEditing && (
              <div className="form-group">
                <label className="form-label">Available Copies in Shelf</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={formData.availableCopies}
                  onChange={(e) => setFormData({ ...formData, availableCopies: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Shelf / Aisle Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Stack CS-A1"
                value={formData.shelfLocation}
                onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Cover Image URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://..."
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Synopsis / Description</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Brief summary of book contents..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEditing ? 'Update Book' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookCatalog;
