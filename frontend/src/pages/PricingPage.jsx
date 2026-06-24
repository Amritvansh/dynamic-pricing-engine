import React, { useState, useEffect } from 'react';
import { History, Check, X } from 'lucide-react';
import { getProducts } from '../api/productApi';
import { getProductRecommendations, applyDecision, rejectDecision } from '../api/pricingApi';
import usePricing from '../hooks/usePricing';
import PricingForm from '../components/pricing/PricingForm';
import RecommendationCard from '../components/pricing/RecommendationCard';
import ConfidenceBadge from '../components/common/ConfidenceBadge';
import ErrorAlert from '../components/common/ErrorAlert';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function PricingPage() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { result, loading, error, setError, calculate, apply, reject } = usePricing();

  useEffect(() => {
    (async () => {
      try {
        const res = await getProducts();
        setProducts(res.data || []);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [setError]);

  // Fetch pricing history when a product is selected or result changes
  const fetchHistory = async (productId) => {
    if (!productId) return;
    setHistoryLoading(true);
    try {
      const res = await getProductRecommendations(productId);
      setHistory(res.data || []);
    } catch {
      // non-critical
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProductId) fetchHistory(selectedProductId);
  }, [selectedProductId, result]);

  const handleCalculate = async (productId) => {
    setSelectedProductId(productId);
    try {
      await calculate(productId);
    } catch {
      // error set by hook
    }
  };

  const handleApply = async (decisionId) => {
    setActionLoading(true);
    try {
      await apply(decisionId);
      if (selectedProductId) fetchHistory(selectedProductId);
    } catch {
      // error set by hook
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (decisionId) => {
    setActionLoading(true);
    try {
      await reject(decisionId);
      if (selectedProductId) fetchHistory(selectedProductId);
    } catch {
      // error set by hook
    } finally {
      setActionLoading(false);
    }
  };

  // History table inline apply/reject
  const handleHistoryAction = async (id, action) => {
    try {
      if (action === 'apply') await applyDecision(id);
      else await rejectDecision(id);
      fetchHistory(selectedProductId);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pricing Engine</h1>
          <p className="page-subtitle">Calculate optimized prices with multi-signal analysis</p>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Split layout: Left — Input, Right — Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left Panel — Input */}
        <div style={{ position: 'sticky', top: '1.75rem' }}>
          <PricingForm products={products} onCalculate={handleCalculate} loading={loading} />
        </div>

        {/* Right Panel — Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!result && !loading && (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1rem' }}>Select a product and click <strong>Run Pricing Engine</strong> to see recommendations.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                The engine evaluates demand, inventory, competitors, and seasonal signals.
              </p>
            </div>
          )}

          {loading && (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-indigo)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Running pricing engine...</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Analyzing demand · inventory · competitors · seasonal trends
              </p>
            </div>
          )}

          {result && (
            <RecommendationCard
              result={result}
              onApply={handleApply}
              onReject={handleReject}
              loading={loading}
              actionLoading={actionLoading}
            />
          )}

          {/* ─── Pricing History Table ─── */}
          {selectedProductId && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <History size={16} color="var(--text-muted)" />
                <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                  Pricing History
                </p>
              </div>

              {historyLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ flex: 2, height: 14, borderRadius: 4, background: 'var(--bg-input)', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ flex: 1, height: 14, borderRadius: 4, background: 'var(--bg-input)', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ flex: 1, height: 14, borderRadius: 4, background: 'var(--bg-input)', animation: 'pulse 1.5s infinite' }} />
                    </div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
                  No pricing history for this product yet.
                </p>
              ) : (
                <div className="table-container" style={{ border: 'none' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Recommended</th>
                        <th>Adjustment</th>
                        <th>Confidence</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 10).map((rec) => (
                        <tr key={rec._id}>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {formatDate(rec.createdAt)}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem' }}>
                            ₹{(rec.pricing?.recommendedPrice || rec.outcome?.recommendedPrice)?.toLocaleString('en-IN') || '—'}
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>
                            <span style={{
                              color: ((rec.pricing?.adjustmentPercent || rec.outcome?.adjustmentPercent) || 0) > 0 ? 'var(--accent-green)' : ((rec.pricing?.adjustmentPercent || rec.outcome?.adjustmentPercent) || 0) < 0 ? 'var(--accent-red)' : 'var(--text-muted)',
                              fontFamily: 'monospace', fontWeight: 600,
                            }}>
                              {(rec.pricing?.adjustmentPercent || rec.outcome?.adjustmentPercent) > 0 ? '+' : ''}{(rec.pricing?.adjustmentPercent || rec.outcome?.adjustmentPercent)?.toFixed(1) || '0'}%
                            </span>
                          </td>
                          <td>
                            <ConfidenceBadge
                              score={rec.decision?.confidenceScore || rec.outcome?.confidenceScore || 0}
                              level={rec.decision?.confidenceLevel || rec.outcome?.confidenceLevel}
                            />
                          </td>
                          <td>
                            <span className={`badge ${rec.status === 'APPLIED' ? 'badge-green' : rec.status === 'REJECTED' ? 'badge-red' : rec.status === 'EXPIRED' ? 'badge-gray' : 'badge-yellow'}`}>
                              {rec.status || 'PENDING'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {rec.status === 'PENDING' && (
                              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-success btn-sm" onClick={() => handleHistoryAction(rec._id, 'apply')} title="Apply">
                                  <Check size={13} />
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleHistoryAction(rec._id, 'reject')} title="Reject">
                                  <X size={13} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
