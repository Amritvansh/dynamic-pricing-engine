import React, { useState } from 'react';
import useInventory from '../hooks/useInventory';
import InventoryTable from '../components/inventory/InventoryTable';
import StockUpdateModal from '../components/inventory/StockUpdateModal';
import SaleRecordModal from '../components/inventory/SaleRecordModal';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function InventoryPage() {
  const { inventory, loading, error, setError, updateStock, addSale } = useInventory();

  const [stockModalItem, setStockModalItem] = useState(null);
  const [saleModalItem, setSaleModalItem] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const handleUpdateStock = async (productId, data) => {
    try {
      setActionError(null);
      await updateStock(productId, data);
    } catch (err) {
      setActionError(err.message);
      throw err;
    }
  };

  const handleRecordSale = async (data) => {
    try {
      setActionError(null);
      await addSale(data);
    } catch (err) {
      setActionError(err.message);
      throw err;
    }
  };

  const filtered = inventory.filter((item) => {
    if (statusFilter && item.inventoryStatus !== statusFilter) return false;
    return true;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Track stock levels and record sales</p>
        </div>
      </div>

      {(error || actionError) && (
        <ErrorAlert
          message={error || actionError}
          onDismiss={() => {
            setError(null);
            setActionError(null);
          }}
        />
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <select
          className="select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">All Statuses</option>
          <option value="critical">Critical</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading inventory..." />
      ) : (
        <InventoryTable
          inventory={filtered}
          onUpdateStock={setStockModalItem}
          onRecordSale={setSaleModalItem}
        />
      )}

      <StockUpdateModal
        isOpen={!!stockModalItem}
        onClose={() => setStockModalItem(null)}
        onSubmit={handleUpdateStock}
        item={stockModalItem}
      />

      <SaleRecordModal
        isOpen={!!saleModalItem}
        onClose={() => setSaleModalItem(null)}
        onSubmit={handleRecordSale}
        item={saleModalItem}
      />
    </div>
  );
}
