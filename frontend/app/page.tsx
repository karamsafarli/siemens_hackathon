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
  Filter,
  Calendar,
  X,
  Sun,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: Sun, color: 'text-amber-500' };
    if (hour < 18) return { text: 'Good afternoon', icon: Sun, color: 'text-orange-500' };
    return { text: 'Good evening', icon: Sparkles, color: 'text-violet-500' };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-slate-600">Loading dashboard...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Plants',
      value: filteredStats?.total_plants || 0,
      icon: Sprout,
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Overdue Irrigation',
      value: filteredStats?.irrigation.total_overdue || 0,
      icon: Droplets,
      gradient: 'from-blue-500 to-cyan-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      trend: filteredStats?.irrigation.total_overdue === 0 ? 'All good' : 'Needs attention',
      trendUp: filteredStats?.irrigation.total_overdue === 0
    },
    {
      title: 'Problem Plants',
      value: filteredStats?.problem_plants || 0,
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
      trend: filteredStats?.problem_plants === 0 ? 'Healthy' : 'Check now',
      trendUp: filteredStats?.problem_plants === 0
    },
    {
      title: 'Recent Notes',
      value: filteredStats?.recent_activity.notes_last_7_days || 0,
      icon: FileText,
      gradient: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-600',
      trend: 'Last 7 days',
      trendUp: true
    },
  ];

  const quickLinks = [
    { href: '/fields', label: 'Fields', icon: MapPin, count: stats?.plants_by_field.length || 0, color: 'teal' },
    { href: '/plants', label: 'Plants', icon: Sprout, count: stats?.total_plants || 0, color: 'green' },
    { href: '/irrigation', label: 'Irrigation', icon: Droplets, count: stats?.irrigation.total_overdue || 0, color: 'blue' },
    { href: '/notes', label: 'Notes', icon: FileText, count: stats?.recent_activity.notes_last_7_days || 0, color: 'violet' },
  ];

  return (
    <DashboardLayout alerts={filteredAlerts.length}>
      {/* Welcome Banner */}
      <div className="mb-6 lg:mb-8 animate-fadeIn">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 lg:p-8 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <GreetingIcon className={`w-5 h-5 ${greeting.color.replace('text-', 'text-white/80')}`} />
              <span className="text-white/80 text-sm font-medium">{greeting.text}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome to Smart Farm</h1>
            <p className="text-white/80 max-w-xl">
              Monitor your agricultural operations, track plant health, and manage irrigation schedules all in one place.
            </p>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
            <Sprout className="w-32 h-32" />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl transition-all text-sm font-medium shadow-sm hover:shadow"
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
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 animate-scaleIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-400" />
                  Plant Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900"
                >
                  <option value="all">All Statuses</option>
                  <option value="healthy">Healthy</option>
                  <option value="at_risk">At Risk</option>
                  <option value="critical">Critical</option>
                  <option value="diseased">Diseased</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Field
                </label>
                <select
                  value={fieldFilter}
                  onChange={(e) => setFieldFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900"
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
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden card-hover animate-fadeIn"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <div className="p-4 lg:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${card.gradient} rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 ${card.bgLight} rounded-full`}>
                    <TrendingUp className={`w-3 h-3 ${card.trendUp ? 'text-emerald-500' : 'text-amber-500'}`} />
                    <span className={`text-xs font-medium ${card.trendUp ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {card.trend}
                    </span>
                  </div>
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-1">{card.value}</div>
                <div className="text-sm font-medium text-slate-500">{card.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 lg:mb-8">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          const colorClasses: Record<string, string> = {
            teal: 'hover:border-teal-300 hover:bg-teal-50/50',
            green: 'hover:border-green-300 hover:bg-green-50/50',
            blue: 'hover:border-blue-300 hover:bg-blue-50/50',
            violet: 'hover:border-violet-300 hover:bg-violet-50/50',
          };
          const iconColors: Record<string, string> = {
            teal: 'text-teal-600 bg-teal-100',
            green: 'text-green-600 bg-green-100',
            blue: 'text-blue-600 bg-blue-100',
            violet: 'text-violet-600 bg-violet-100',
          };

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                group bg-white rounded-xl shadow-sm border border-slate-200 p-4 
                transition-all duration-200 card-hover animate-fadeIn
                ${colorClasses[link.color]}
              `}
              style={{ animationDelay: `${0.2 + index * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColors[link.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-0.5">{link.label}</h3>
              <p className="text-sm text-slate-500">{link.count} items</p>
            </Link>
          );
        })}
      </div>

      {/* Alerts Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 lg:p-6 mb-6 lg:mb-8 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-slate-900">Active Alerts</h2>
              <p className="text-sm text-slate-500">{filteredAlerts.length} items require attention</p>
            </div>
          </div>
          {filteredAlerts.length > 0 && (
            <Link
              href="/plants"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-slate-900 font-semibold text-lg">All systems running smoothly</p>
            <p className="text-sm text-slate-500 mt-1">No alerts matching your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.slice(0, 5).map((alert, index) => (
              <div
                key={index}
                className={`
                  p-4 rounded-xl border-l-4 transition-all hover:shadow-md cursor-pointer
                  ${alert.severity === 'critical'
                    ? 'bg-rose-50 border-rose-500 hover:bg-rose-100/80'
                    : 'bg-amber-50 border-amber-500 hover:bg-amber-100/80'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                      ${alert.severity === 'critical' ? 'bg-rose-200' : 'bg-amber-200'}
                    `}>
                      <AlertTriangle className={`w-4 h-4 ${alert.severity === 'critical' ? 'text-rose-700' : 'text-amber-700'}`} />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">{alert.message}</span>
                      <p className="text-sm text-slate-600 mt-0.5">{alert.batch_name} • {alert.field_name}</p>
                    </div>
                  </div>
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-bold flex-shrink-0
                    ${alert.severity === 'critical'
                      ? 'bg-rose-200 text-rose-800'
                      : 'bg-amber-200 text-amber-800'
                    }
                  `}>
                    {alert.severity === 'critical' ? '🚨 CRITICAL' : '⚠️ WARNING'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        {/* Plants by Field */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Plants by Field</h3>
          </div>
          <div className="space-y-4">
            {stats?.plants_by_field.map((field, index) => {
              const percentage = (field.count / (stats?.total_plants || 1)) * 100;
              return (
                <div key={field.field_id} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">{field.field_name}</span>
                    <span className="text-sm font-semibold text-slate-900">{field.count} plants</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 group-hover:from-emerald-400 group-hover:to-teal-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Health Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Health Status</h3>
          </div>
          <div className="space-y-4">
            {stats?.plants_by_status.map((status) => {
              const percentage = (status._count / (stats?.total_plants || 1)) * 100;
              const statusStyles: Record<string, { gradient: string; bg: string }> = {
                healthy: { gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-100' },
                at_risk: { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-100' },
                critical: { gradient: 'from-rose-500 to-pink-500', bg: 'bg-rose-100' },
                diseased: { gradient: 'from-red-500 to-rose-500', bg: 'bg-red-100' },
              };
              const style = statusStyles[status.current_status] || statusStyles.healthy;

              return (
                <div key={status.current_status} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.gradient}`} />
                      <span className="font-medium text-slate-700 capitalize">
                        {status.current_status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{status._count}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${style.gradient} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
