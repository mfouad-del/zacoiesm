import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  DollarSign,
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';

interface EVMMetrics {
  projectId: string;
  projectName: string;
  periodDate: string;
  
  // Core EVM Values
  pv: number;  // Planned Value
  ev: number;  // Earned Value
  ac: number;  // Actual Cost
  bac: number; // Budget at Completion
  
  // Variance Metrics
  sv: number;  // Schedule Variance (EV - PV)
  cv: number;  // Cost Variance (EV - AC)
  
  // Performance Indices
  spi: number; // Schedule Performance Index (EV / PV)
  cpi: number; // Cost Performance Index (EV / AC)
  
  // Forecast Metrics
  eac: number; // Estimate at Completion
  etc: number; // Estimate to Complete
  vac: number; // Variance at Completion (BAC - EAC)
  tcpi: number; // To-Complete Performance Index
}

interface EVMDashboardProps {
  projectId?: string;
  lang?: 'ar' | 'en';
}

const EVMDashboard: React.FC<EVMDashboardProps> = ({ projectId, lang = 'ar' }) => {
  const [metrics, setMetrics] = useState<EVMMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEVMMetrics();
  }, [projectId]);

  const loadEVMMetrics = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await api.costTracking.getLatest(projectId);
      
      if (data) {
        setMetrics({
          projectId: data.project_id,
          projectName: data.project?.name || 'Unknown',
          periodDate: data.period_date,
          pv: data.planned_value,
          ev: data.earned_value,
          ac: data.actual_cost,
          bac: data.budget_at_completion,
          sv: data.schedule_variance,
          cv: data.cost_variance,
          spi: data.spi,
          cpi: data.cpi,
          eac: data.eac,
          etc: data.etc,
          vac: data.vac,
          tcpi: data.tcpi
        });
      } else {
        setError('No EVM data available for this project');
      }
    } catch (err) {
      console.error('Failed to load EVM metrics:', err);
      setError('Failed to load EVM metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getPerformanceColor = (value: number, isVariance: boolean = false): string => {
    if (isVariance) {
      // For variance: positive is good, negative is bad
      if (value > 0) return 'text-green-600 bg-green-50';
      if (value < 0) return 'text-red-600 bg-red-50';
      return 'text-gray-600 bg-gray-50';
    } else {
      // For indices: > 1 is good, < 1 is bad
      if (value >= 1.0) return 'text-green-600 bg-green-50';
      if (value >= 0.9) return 'text-yellow-600 bg-yellow-50';
      return 'text-red-600 bg-red-50';
    }
  };

  const getPerformanceIcon = (value: number, isVariance: boolean = false) => {
    const isGood = isVariance ? value > 0 : value >= 1.0;
    return isGood ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
        <p className="text-yellow-800 font-medium">
          {error || 'لا توجد بيانات EVM متاحة'}
        </p>
        <p className="text-yellow-600 text-sm mt-2">
          قم بإدخال بيانات التكلفة والإنجاز لعرض تحليل EVM
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              تحليل الأداء - EVM
            </h2>
            <p className="text-gray-600">
              {metrics.projectName} - {new Date(metrics.periodDate).toLocaleDateString('ar-SA')}
            </p>
          </div>
          <BarChart3 className="w-10 h-10 text-brand-600" />
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="القيمة المخططة (PV)"
          value={formatCurrency(metrics.pv)}
          icon={<Calendar className="w-6 h-6" />}
          color="bg-blue-50 text-blue-600"
        />
        <MetricCard
          title="القيمة المكتسبة (EV)"
          value={formatCurrency(metrics.ev)}
          icon={<Target className="w-6 h-6" />}
          color="bg-green-50 text-green-600"
        />
        <MetricCard
          title="التكلفة الفعلية (AC)"
          value={formatCurrency(metrics.ac)}
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-purple-50 text-purple-600"
        />
        <MetricCard
          title="ميزانية الإنجاز (BAC)"
          value={formatCurrency(metrics.bac)}
          icon={<Target className="w-6 h-6" />}
          color="bg-gray-50 text-gray-600"
        />
      </div>

      {/* Performance Indices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PerformanceCard
          title="مؤشر أداء الجدول (SPI)"
          value={metrics.spi}
          formatted={formatPercentage(metrics.spi)}
          description={
            metrics.spi >= 1.0
              ? '✅ المشروع متقدم عن الجدول الزمني'
              : '⚠️ المشروع متأخر عن الجدول الزمني'
          }
          variance={metrics.sv}
          varianceLabel="انحراف الجدول (SV)"
          color={getPerformanceColor(metrics.spi)}
          icon={getPerformanceIcon(metrics.spi)}
        />
        
        <PerformanceCard
          title="مؤشر أداء التكلفة (CPI)"
          value={metrics.cpi}
          formatted={formatPercentage(metrics.cpi)}
          description={
            metrics.cpi >= 1.0
              ? '✅ المشروع تحت الميزانية'
              : '⚠️ المشروع يتجاوز الميزانية'
          }
          variance={metrics.cv}
          varianceLabel="انحراف التكلفة (CV)"
          color={getPerformanceColor(metrics.cpi)}
          icon={getPerformanceIcon(metrics.cpi)}
        />
      </div>

      {/* Forecast Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 التوقعات</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ForecastMetric
            label="التكلفة المتوقعة عند الإنجاز (EAC)"
            value={formatCurrency(metrics.eac)}
            subtitle={`الباقي: ${formatCurrency(metrics.etc)}`}
          />
          <ForecastMetric
            label="الفرق عن الميزانية (VAC)"
            value={formatCurrency(metrics.vac)}
            subtitle={metrics.vac >= 0 ? 'توفير' : 'تجاوز'}
            color={metrics.vac >= 0 ? 'text-green-600' : 'text-red-600'}
          />
          <ForecastMetric
            label="مؤشر الأداء المطلوب (TCPI)"
            value={formatPercentage(metrics.tcpi)}
            subtitle={
              metrics.tcpi <= 1.0
                ? 'قابل للتحقيق'
                : 'يتطلب تحسين كبير'
            }
            color={metrics.tcpi <= 1.0 ? 'text-green-600' : 'text-red-600'}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">نسبة الإنجاز</h3>
        <div className="space-y-3">
          <ProgressBar
            label="الإنجاز المخطط"
            value={(metrics.pv / metrics.bac) * 100}
            color="bg-blue-500"
          />
          <ProgressBar
            label="الإنجاز الفعلي"
            value={(metrics.ev / metrics.bac) * 100}
            color="bg-green-500"
          />
          <ProgressBar
            label="التكلفة المستهلكة"
            value={(metrics.ac / metrics.bac) * 100}
            color="bg-purple-500"
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
      {icon}
    </div>
    <p className="text-sm text-gray-600 mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

const PerformanceCard: React.FC<{
  title: string;
  value: number;
  formatted: string;
  description: string;
  variance: number;
  varianceLabel: string;
  color: string;
  icon: React.ReactNode;
}> = ({ title, formatted, description, variance, varianceLabel, color, icon }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className={`text-3xl font-bold ${color.split(' ')[0]}`}>{formatted}</p>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
    <p className="text-sm text-gray-700 mb-3">{description}</p>
    <div className="pt-3 border-t border-gray-200">
      <p className="text-xs text-gray-500 mb-1">{varianceLabel}</p>
      <p className={`text-lg font-semibold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {variance >= 0 ? '+' : ''}{new Intl.NumberFormat('ar-SA').format(variance)} ريال
      </p>
    </div>
  </div>
);

const ForecastMetric: React.FC<{
  label: string;
  value: string;
  subtitle: string;
  color?: string;
}> = ({ label, value, subtitle, color = 'text-gray-900' }) => (
  <div>
    <p className="text-sm text-gray-600 mb-2">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
  </div>
);

const ProgressBar: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-700 font-medium">{label}</span>
      <span className="text-gray-900 font-bold">{value.toFixed(1)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className={`h-3 rounded-full ${color} transition-all duration-500`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  </div>
);

export default EVMDashboard;
