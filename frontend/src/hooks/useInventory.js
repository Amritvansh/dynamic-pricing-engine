import { useState, useEffect, useCallback } from 'react';
import { getInventory, updateInventory } from '../api/inventoryApi';
import { recordSale } from '../api/salesApi';

export default function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getInventory();
      setInventory(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const updateStock = async (productId, updates) => {
    const res = await updateInventory(productId, updates);
    await fetchInventory();
    return res;
  };

  const addSale = async (saleData) => {
    const res = await recordSale(saleData);
    await fetchInventory(); // Refresh to update quantities
    return res;
  };

  return {
    inventory,
    loading,
    error,
    setError,
    fetchInventory,
    updateStock,
    addSale,
  };
}
