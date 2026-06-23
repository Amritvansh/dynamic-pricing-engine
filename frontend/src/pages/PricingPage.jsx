import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { getProducts } from '../api/productApi';
import usePricing from '../hooks/usePricing';
import PricingForm from '../components/pricing/PricingForm';
import RecommendationCard from '../components/pricing/RecommendationCard';
import ConfidencePanel from '../components/pricing/ConfidencePanel';
import ErrorAlert from '../components/common/ErrorAlert';

export default function PricingPage() {
  const [products, setProducts] = useState([]);
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

  const handleCalculate = async (productId) => {
    try {
      await calculate(productId);
    } catch (err) {
      // error set by hook
    }
  };

  const handleApply = async () => {
    if (!result?.decisionId) return;
    try {
      await apply(result.decisionId);
    } catch (err) {
      // error set by hook
    }
  };

  const handleReject = async () => {
    if (!result?.decisionId) return;
    try {
      await reject(result.decisionId);
    } catch (err) {
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

          {/* Apply / Reject buttons */}
          {result && result.status === 'PENDING' && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-success" style={{ flex: 1 }} onClick={handleApply}>
                <Check size={16} /> Apply
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleReject}>
                <X size={16} /> Reject
              </button>
            </div>
          )}

          {/* Confidence Panel (below buttons on left side) */}
          {result && (
            <div style={{ marginTop: '1rem' }}>
              <ConfidencePanel decision={result.decision} explanation={result.explanation} />
            </div>
          )}
        </div>

        {/* Right Panel — Results */}
        <div>
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

          {result && <RecommendationCard result={result} />}
        </div>
      </div>
    </div>
  );
}
