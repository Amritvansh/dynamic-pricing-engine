import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useProducts from '../hooks/useProducts';
import ProductTable from '../components/products/ProductTable';
import ProductForm from '../components/products/ProductForm';
import Modal from '../components/common/Modal';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProductsPage() {
  const { products, loading, error, setError, addProduct, editProduct, removeProduct } = useProducts();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  const handleCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      setActionError(null);
      if (editingProduct) {
        await editProduct(editingProduct._id, data);
      } else {
        await addProduct(data);
      }
    } catch (err) {
      setActionError(err.message);
      throw err; // Let form know it failed
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionError(null);
      await removeProduct(deleteTarget._id);
      setDeleteTarget(null);
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Apply filters
  const filtered = products.filter((p) => {
    if (searchTerm && !p.productName.toLowerCase().includes(searchTerm.toLowerCase()) && !p.sku.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (tierFilter && p.tier !== tierFilter) return false;
    return true;
  });

  const categories = [...new Set(products.map((p) => p.category))].sort();

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products in catalog</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {(error || actionError) && (
        <ErrorAlert message={error || actionError} onDismiss={() => { setError(null); setActionError(null); }} />
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          className="input"
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="select" value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} style={{ maxWidth: 140 }}>
          <option value="">All Tiers</option>
          <option value="budget">Budget</option>
          <option value="mid">Mid</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading products..." />
      ) : (
        <ProductTable products={filtered} onEdit={handleEdit} onDelete={setDeleteTarget} />
      )}

      {/* Product Create/Edit Form */}
      <ProductForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        editProduct={editingProduct}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product">
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.productName}</strong>?
          This will soft-delete the product (set as inactive).
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete Product</button>
        </div>
      </Modal>
    </div>
  );
}
