import React, { useState, useEffect } from 'react';
import { auditLogger } from '../lib/audit/logger';
import { 
  Activity, 
  Search, 
  Filter, 
  Download,
  Clock,
  User,
  FileText
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  entity_name?: string;
  old_values?: any;
  new_values?: any;
  metadata?: any;
  ip_address?: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

interface AuditTrailViewProps {
  lang?: 'ar' | 'en';
}

const AuditTrailView: React.FC<AuditTrailViewProps> = ({ lang = 'ar' }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterEntity, setFilterEntity] = useState<string>('');

  useEffect(() => {
    loadLogs();
  }, [filterAction, filterEntity]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await auditLogger.queryLogs({
        action: filterAction || undefined,
        entityType: filterEntity as any || undefined,
        limit: 100
      });
      setLogs(data);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.entity_name?.toLowerCase().includes(search) ||
      log.user?.email?.toLowerCase().includes(search) ||
      log.user?.full_name?.toLowerCase().includes(search) ||
      log.action.toLowerCase().includes(search)
    );
  });

  const getActionBadgeColor = (action: string): string => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'APPROVE': return 'bg-emerald-100 text-emerald-800';
      case 'REJECT': return 'bg-orange-100 text-orange-800';
      case 'LOGIN': return 'bg-purple-100 text-purple-800';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      'CREATE': 'إنشاء',
      'UPDATE': 'تعديل',
      'DELETE': 'حذف',
      'APPROVE': 'موافقة',
      'REJECT': 'رفض',
      'LOGIN': 'تسجيل دخول',
      'LOGOUT': 'تسجيل خروج',
      'EXPORT': 'تصدير',
      'IMPORT': 'استيراد'
    };
    return labels[action] || action;
  };

  const getEntityLabel = (entityType: string): string => {
    const labels: Record<string, string> = {
      'project': 'مشروع',
      'task': 'مهمة',
      'contract': 'عقد',
      'variation': 'تعديل عقد',
      'ncr': 'تقرير عدم مطابقة',
      'timesheet': 'كشف الوقت',
      'document': 'مستند',
      'report': 'تقرير',
      'incident': 'حادث',
      'user': 'مستخدم',
      'settings': 'إعدادات'
    };
    return labels[entityType] || entityType;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const exportToCSV = () => {
    const headers = ['التاريخ', 'المستخدم', 'الإجراء', 'النوع', 'الكيان', 'IP'];
    const rows = filteredLogs.map(log => [
      formatDate(log.created_at),
      log.user?.full_name || log.user?.email || 'Unknown',
      getActionLabel(log.action),
      getEntityLabel(log.entity_type),
      log.entity_name || '-',
      log.ip_address || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-brand-600" />
            سجل النشاطات (Audit Trail)
          </h1>
          <p className="text-gray-600 mt-1">
            متابعة جميع العمليات والتغييرات في النظام
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          تصدير CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">كل الإجراءات</option>
            <option value="CREATE">إنشاء</option>
            <option value="UPDATE">تعديل</option>
            <option value="DELETE">حذف</option>
            <option value="APPROVE">موافقة</option>
            <option value="REJECT">رفض</option>
            <option value="LOGIN">تسجيل دخول</option>
          </select>

          {/* Entity Filter */}
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">كل الأنواع</option>
            <option value="project">مشروع</option>
            <option value="task">مهمة</option>
            <option value="contract">عقد</option>
            <option value="ncr">NCR</option>
            <option value="timesheet">كشف وقت</option>
            <option value="document">مستند</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">جاري التحميل...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">لا توجد سجلات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      التاريخ
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      المستخدم
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراء
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الكيان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التفاصيل
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {log.user?.full_name || 'Unknown'}
                        </div>
                        <div className="text-gray-500">{log.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getEntityLabel(log.entity_type)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.entity_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.metadata?.status_transition || 
                       log.metadata?.changed_fields?.join(', ') || 
                       log.ip_address ||
                       '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrailView;
