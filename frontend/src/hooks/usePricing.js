import { useState, useCallback } from 'react';
import { calculatePrice, applyDecision, rejectDecision, getRecommendations, getDecisionById } from '../api/pricingApi';

export default function usePricing() {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculate = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const res = await calculatePrice(productId);
      setResult(res.data);
      return res.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDecision = useCallback(async (decisionId) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const res = await getDecisionById(decisionId);
      setResult(res.data);
      return res.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const apply = useCallback(async (decisionId, mode) => {
    try {
      setError(null);
      const res = await applyDecision(decisionId, mode);
      // Update result status locally
      setResult((prev) => prev ? { ...prev, status: 'APPLIED' } : prev);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const reject = useCallback(async (decisionId) => {
    try {
      setError(null);
      const res = await rejectDecision(decisionId);
      setResult((prev) => prev ? { ...prev, status: 'REJECTED' } : prev);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const fetchHistory = useCallback(async (params = {}) => {
    try {
      const res = await getRecommendations(params);
      setHistory(res.data || []);
    } catch (err) {
      // non-critical — don't block
    }
  }, []);

  return {
    result,
    history,
    loading,
    error,
    setError,
    calculate,
    apply,
    reject,
    fetchHistory,
    loadDecision,
  };
}
