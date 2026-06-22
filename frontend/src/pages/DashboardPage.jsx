import React from 'react';
import { Package, AlertCircle, DollarSign, Activity } from 'lucide-react';
import useDashboard from '../hooks/useDashboard';
import StatCard from '../components/common/StatCard';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function DashboardPage() {
  const { stats, loading, error, setError } = useDashboard();

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
        <LoadingSpinner text="Loading dashboard metrics..." />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time pricing engine overview</p>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard
          icon={<Package />}
          label="Active Products"
          value={stats?.products?.active || 0}
          subtitle={`${stats?.products?.pricedToday || 0} priced today`}
          color="var(--accent-blue)"
        />
        <StatCard
          icon={<AlertCircle />}
          label="Critical Stock"
          value={stats?.inventory?.critical || 0}
          subtitle={`${stats?.inventory?.low || 0} low stock items`}
          color="var(--accent-red)"
        />
        <StatCard
          icon={<DollarSign />}
          label="Pending Prices"
          value={stats?.pricing?.pendingRecommendations || 0}
          subtitle={`${stats?.pricing?.appliedToday || 0} applied today`}
          color="var(--accent-orange)"
        />
        <StatCard
          icon={<Activity />}
          label="Active Events"
          value={stats?.events?.activeEvents || 0}
          subtitle={`Top: ${stats?.events?.topEvent?.name || 'None'}`}
          color="var(--accent-purple)"
        />
      </div>
      
      {/* Additional UI (Inventory Table, Recommendations) to be built out on Day 4 polish */}
      <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Advanced Dashboard widgets (Recent Recommendations, Active Events details) will be polished on Day 4.</p>
      </div>
    </div>
  );
}
