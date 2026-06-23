import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { getProducts } from '../api/productApi';
import { getProductRecommendations } from '../api/pricingApi';
import usePricing from '../hooks/usePricing';
import PricingForm from '../components/pricing/PricingForm';
import RecommendationCard from '../components/pricing/RecommendationCard';
import ConfidencePanel from '../components/pricing/ConfidencePanel';
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

  // Fetch pricing history when a product is selected
  useEffect(() => {
    if (!selectedProductId) return;
    (async () => {
      try {
        setHistoryLoading(true);
        const res = await getProductRecommendations(selectedProductId);
        setHistory(res.data || []);
      } catch {
        // non-critical
      } finally {
        setHistoryLoading(false);
      }
    })();
  }, [selectedProductId, result?.status]);

  const handleCalculate = async (productId) => {
    setSelectedProductId(productId);
    try {
      await calculate(productId);
    } catch {
      // error set by hook
    }
  };

  const handleApply = async (decisionId) => {
    try {
      await apply(decisionId);
    } catch {
      // error set by hook
    }
  };

  const handleReject = async (decisionId) => {
    try {
      await reject(decisionId);
    } catch {
      // error set by hook
    }
  };

  const handleHistoryAction = async (decisionId, action) => {
    try {
      if (action === 'apply') await apply(decisionId);
      else await reject(decisionId);
      // Refresh history
      if (selectedProductId) {
        const res = await getProductRecommendations(selectedProductId);
        setHistory(res.data || []);
      }
    } catch {
      // error set by hook
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

          {/* Confidence Panel (below form on left side) */}
          {result && (
            <div style={{ marginTop: '1rem' }}>
              <ConfidencePanel decision={result.decision} explanation={result.explanation} />
            </div>
          )}
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
            />
          )}

          {/* ─── Pricing History Table ─── */}
          {selectedProductId && history.length > 0 && (
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Pricing History
              </p>
              <div className="table-container">
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
                    {history.map((rec) => (
                      <tr key={rec._id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {formatDate(rec.createdAt)}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          ₹{rec.outcome?.recommendedPrice?.toLocaleString('en-IN') || '—'}
                        </td>
                        <td>
                          <span style={{
                            color: (rec.outcome?.adjustmentPercent || 0) > 0 ? 'var(--accent-green)' : (rec.outcome?.adjustmentPercent || 0) < 0 ? 'var(--accent-red)' : 'var(--text-muted)',
                            fontFamily: 'monospace', fontWeight: 600,
                          }}>
                            {rec.outcome?.adjustmentPercent > 0 ? '+' : ''}{rec.outcome?.adjustmentPercent?.toFixed(1) || '0'}%
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${rec.outcome?.confidenceLevel === 'HIGH' ? 'badge-green' : rec.outcome?.confidenceLevel === 'MEDIUM' ? 'badge-yellow' : 'badge-red'}`}>
                            {(rec.outcome?.confidenceScore * 100)?.toFixed(0) || '—'}%
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${rec.status === 'APPLIED' ? 'badge-green' : rec.status === 'REJECTED' ? 'badge-red' : rec.status === 'EXPIRED' ? 'badge-gray' : 'badge-yellow'}`}>
                            {rec.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {rec.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                              <button className="btn btn-success btn-sm" onClick={() => handleHistoryAction(rec._id, 'apply')}>
                                <Check size={12} />
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleHistoryAction(rec._id, 'reject')}>
                                <X size={12} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
