import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { getProducts } from '../api/productApi';
import api from '../api/axiosInstance';
import PriceHistoryChart from '../components/analytics/PriceHistoryChart';
import DemandTrendChart from '../components/analytics/DemandTrendChart';
import DemandAttributionChart from '../components/analytics/DemandAttributionChart';
import EventPerformanceCard from '../components/analytics/EventPerformanceCard';
import ErrorAlert from '../components/common/ErrorAlert';

export default function AnalyticsPage() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [priceHistory, setPriceHistory] = useState([]);
  const [demandTrends, setDemandTrends] = useState([]);
  const [demandAttribution, setDemandAttribution] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProducts();
        setProducts(res.data || []);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProductId) return;
    (async () => {
      try {
        setChartLoading(true);
        setError(null);
        const [priceRes, demandRes, attrRes] = await Promise.all([
          api.get(`/analytics/price-history/${selectedProductId}`),
          api.get(`/analytics/demand-trends/${selectedProductId}`),
          api.get(`/analytics/demand-attribution/${selectedProductId}`),
        ]);
        setPriceHistory(priceRes.data?.data || []);
        setDemandTrends(demandRes.data?.data || []);
        setDemandAttribution(attrRes.data?.data || null);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setChartLoading(false);
      }
    })();
  }, [selectedProductId]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Price history, demand trends, and event performance</p>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Product Selector */}
      <div style={{ marginBottom: '1.5rem', maxWidth: 400 }}>
        <label className="label">Select Product</label>
        <select
          className="select"
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
        >
          <option value="">— Choose a product —</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>{p.productName} ({p.sku})</option>
          ))}
        </select>
      </div>

      {!selectedProductId && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <BarChart3 size={40} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p style={{ color: 'var(--text-muted)' }}>Select a product to view analytics.</p>
        </div>
      )}

      {selectedProductId && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Demand Attribution KPIs */}
          {demandAttribution && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="card" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Sales (30d)</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace' }}>{demandAttribution.totalSales}</p>
              </div>
              <div className="card" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Organic Revenue</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--accent-blue)' }}>₹{demandAttribution.organicRevenue?.toLocaleString('en-IN')}</p>
              </div>
              <div className="card" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Promo Revenue</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--accent-orange)' }}>₹{demandAttribution.promotionalRevenue?.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}

          {/* Chart 1: Price History */}
          <PriceHistoryChart data={priceHistory} loading={chartLoading} />

          {/* Chart 2: Demand Trends */}
          <DemandTrendChart data={demandTrends} loading={chartLoading} />

          {/* Chart 3: Demand Attribution (stacked bars) */}
          <DemandAttributionChart
            data={demandTrends}
            organicPercentage={demandAttribution?.organicPercentage}
            promotionalPercentage={demandAttribution?.promotionalPercentage}
            loading={chartLoading}
          />

          {/* Chart 4: Event Performance */}
          <EventPerformanceCard />
        </div>
      )}
    </div>
  );
}
