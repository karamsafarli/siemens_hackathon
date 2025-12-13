'use client';

import { useEffect, useState } from 'react';
import { dashboardApi, DEMO_USER_ID } from '@/lib/api';
import type { DashboardStats, Alert } from '@/lib/types';
import {
  Sprout,
  Droplets,
  AlertTriangle,
  FileText,
  TrendingUp,
  MapPin,
  Activity,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  LogOut,
  Filter,
  Calendar,
  X,
  Home,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import MobileNav from '@/components/MobileNav';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState('all'); // all, today, week, month
  const [statusFilter, setStatusFilter] = useState('all'); // all, healthy, at_risk, critical
  const [fieldFilter, setFieldFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          dashboardApi.getStats(DEMO_USER_ID),
          dashboardApi.getAlerts(DEMO_USER_ID),
        ]);
        setStats(statsRes.data);
        setAlerts(alertsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter alerts based on selected filters
  const filteredAlerts = alerts.filter((alert) => {
    // Status filter - map to alert severity
    if (statusFilter !== 'all') {
      const severityMatch =
        (statusFilter === 'critical' && alert.severity === 'critical') ||
        (statusFilter === 'at_risk' && alert.severity === 'warning');
      if (!severityMatch && statusFilter !== 'healthy' && statusFilter !== 'diseased') return false;
      if (statusFilter === 'healthy' || statusFilter === 'diseased') return false;
    }

    return true;
  });

  // Calculate filtered stats
  const filteredStats = stats ? {
    ...stats,
    total_plants: statusFilter === 'all'
      ? stats.total_plants
      : stats.plants_by_status.find(s => s.current_status === statusFilter)?._count || 0,
    problem_plants: filteredAlerts.length,
  } : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-slate-700">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Plants',
      value: filteredStats?.total_plants || 0,
      icon: Sprout,
      bgGradient: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Overdue Irrigation',
      value: filteredStats?.irrigation.total_overdue || 0,
      icon: Droplets,
      bgGradient: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Problem Plants',
      value: filteredStats?.problem_plants || 0,
      icon: AlertTriangle,
      bgGradient: 'from-amber-500 to-orange-600'
    },
    {
      title: 'Recent Notes',
      value: filteredStats?.recent_activity.notes_last_7_days || 0,
      icon: FileText,
      bgGradient: 'from-violet-500 to-purple-600'
    },
  ];

  const navItems = [
    { href: '/fields', label: 'Fields', icon: MapPin, description: 'Manage your farm fields' },
    { href: '/plants', label: 'Plants', icon: Sprout, description: 'View plant batches' },
    { href: '/irrigation', label: 'Irrigation', icon: Droplets, description: 'Water schedule' },
    { href: '/notes', label: 'Notes', icon: FileText, description: 'Activity journal' },
    { href: '/chat', label: 'AI Chat', icon: Droplets, description: 'Ask the AI assistant' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 pb-20 md:pb-0">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Smart Farm</h1>
                  <p className="text-slate-600 text-xs sm:text-base hidden sm:block">Monitor and manage your agricultural operations</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-600">Welcome, {user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-xs sm:text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-sm font-medium"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              {(dateRange !== 'all' || statusFilter !== 'all' || fieldFilter !== 'all') && (
                <button
                  onClick={() => {
                    setDateRange('all');
                    setStatusFilter('all');
                    setFieldFilter('all');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Activity className="w-4 h-4 inline mr-1" />
                    Plant Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900"
                  >
                    <option value="all">All Statuses</option>
                    <option value="healthy">Healthy</option>
                    <option value="at_risk">At Risk</option>
                    <option value="critical">Critical</option>
                    <option value="diseased">Diseased</option>
                  </select>
                </div>

                {/* Field Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Field
                  </label>
                  <select
                    value={fieldFilter}
                    onChange={(e) => setFieldFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900"
                  >
                    <option value="all">All Fields</option>
                    {stats?.plants_by_field.map((field) => (
                      <option key={field.field_id} value={field.field_id}>
                        {field.field_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200">
                  <div className="p-3 sm:p-6">
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${card.bgGradient} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 hidden sm:block" />
                    </div>
                    <div className="text-xl sm:text-3xl font-bold text-slate-900 mb-0.5 sm:mb-1">{card.value}</div>
                    <div className="text-xs sm:text-sm font-medium text-slate-600">{card.title}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-5 hover:shadow-md hover:border-emerald-300 transition-all duration-200 active:scale-95"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 group-hover:text-emerald-600 transition-colors" />
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base mb-0.5 sm:mb-1">{item.label}</h3>
                  <p className="text-xs text-slate-600 hidden sm:block">{item.description}</p>
                </Link>
              );
            })}
          </div>

          {/* Alerts Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Active Alerts</h2>
                <p className="text-xs sm:text-sm text-slate-600">Requires your attention</p>
              </div>
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">All systems running smoothly</p>
                <p className="text-sm text-slate-500 mt-1">No alerts matching filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.slice(0, 5).map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-l-4 ${alert.severity === 'critical'
                      ? 'bg-rose-50 border-rose-500'
                      : 'bg-amber-50 border-amber-500'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className={`w-4 h-4 ${alert.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'
                            }`} />
                          <span className="font-semibold text-slate-900">{alert.message}</span>
                        </div>
                        <p className="text-sm text-slate-600">{alert.batch_name} • {alert.field_name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${alert.severity === 'critical'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                        }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Plants by Field
              </h3>
              <div className="space-y-3">
                {stats?.plants_by_field.map((field) => (
                  <div key={field.field_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <span className="font-medium text-slate-900">{field.field_name}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                          style={{ width: `${(field.count / (stats?.total_plants || 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-700 min-w-[3rem] text-right">{field.count} plants</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-violet-600" />
                Health Status
              </h3>
              <div className="space-y-3">
                {stats?.plants_by_status.map((status) => {
                  const statusColors: Record<string, string> = {
                    healthy: 'from-emerald-500 to-teal-600',
                    at_risk: 'from-amber-500 to-orange-600',
                    critical: 'from-rose-500 to-pink-600',
                    diseased: 'from-red-500 to-rose-600',
                  };
                  return (
                    <div key={status.current_status} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <span className="font-medium text-slate-900 capitalize">{status.current_status.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${statusColors[status.current_status] || 'from-slate-500 to-slate-600'} rounded-full`}
                            style={{ width: `${(status._count / (stats?.total_plants || 1)) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-700 min-w-[3rem] text-right">{status._count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
