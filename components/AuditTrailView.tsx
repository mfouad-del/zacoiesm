import React, { useState, useMemo, useEffect } from 'react';
import { auditLogger } from '@/lib/audit/logger';
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Calendar as CalendarIcon,
  Activity,
  User,
  Shield,
  Eye,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { MOCK_AUDIT_LOGS } from '@/lib/mockData';

// Types for our Audit Log
interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  entity_name?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

interface AuditTrailViewProps {
  lang?: 'ar' | 'en';
}

export default function AuditTrailView({ lang = 'ar' }: AuditTrailViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch logs from backend
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const data = await auditLogger.queryLogs({
          limit: 100,
          action: actionFilter !== 'ALL' ? actionFilter as any : undefined,
          entityType: entityFilter !== 'ALL' ? entityFilter as any : undefined,
        });
        
        if (data && data.length > 0) {
          // Transform data to match our interface if needed
          // Assuming the backend returns data matching the interface mostly
          setLogs(data as unknown as AuditLog[]);
        } else {
          // Fallback to mock data if no real data found (for demo purposes)
          // In a real app, we might just show empty state
          // setLogs(MOCK_AUDIT_LOGS); 
          // Keeping MOCK_AUDIT_LOGS as initial state is better
        }
      } catch (error) {
        console.error("Failed to fetch audit logs", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Uncomment to enable real fetching
    // fetchLogs();
    
    // For now, we simulate a fetch with mock data to show the loading state
    // and then use the filtered mock data
  }, [actionFilter, entityFilter]);

  // Filter logs based on search (client-side for now)
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        (log.user?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.entity_name && log.entity_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filters are already applied in fetch, but if we use mock data we need them here too
      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
      const matchesEntity = entityFilter === 'ALL' || log.entity_type === entityFilter;

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [searchTerm, logs, actionFilter, entityFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalActions = filteredLogs.length;
    const uniqueUsers = new Set(filteredLogs.map(l => l.user_id)).size;
    const criticalActions = filteredLogs.filter(l => ['DELETE', 'UPDATE'].includes(l.action)).length;
    
    return { totalActions, uniqueUsers, criticalActions };
  }, [filteredLogs]);

  // Prepare chart data (Actions per day)
  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      data[date] = 0;
    }

    filteredLogs.forEach(log => {
      const date = format(parseISO(log.created_at), 'yyyy-MM-dd');
      if (data[date] !== undefined) {
        data[date]++;
      }
    });

    return Object.entries(data).map(([date, count]) => ({
      date: format(parseISO(date), 'MMM dd'),
      count
    }));
  }, [filteredLogs]);

  // Export to CSV
  const handleExportCSV = () => {
    const csvData = filteredLogs.map(log => ({
      ID: log.id,
      User: log.user?.full_name || 'Unknown',
      Action: log.action,
      Entity: log.entity_type,
      'Entity Name': log.entity_name || '-',
      Date: format(parseISO(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      IP: log.ip_address || '-'
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_trail_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add Title
    doc.setFontSize(18);
    doc.text('Audit Trail Report', 14, 22);
    
    // Add Metadata
    doc.setFontSize(11);
    doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 14, 30);
    doc.text(`Total Records: ${filteredLogs.length}`, 14, 36);

    // Add Table
    const tableData = filteredLogs.map(log => [
      format(parseISO(log.created_at), 'yyyy-MM-dd HH:mm'),
      log.user?.full_name || 'Unknown',
      log.action,
      log.entity_type,
      log.entity_name || '-'
    ]);

    autoTable(doc, {
      head: [['Date', 'User', 'Action', 'Entity Type', 'Entity Name']],
      body: tableData,
      startY: 44,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`audit_trail_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      case 'LOGIN': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'APPROVE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Audit Trail</h1>
          <p className="text-slate-500 mt-1">Monitor and track all system activities and security events.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <FileText className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleExportPDF} className="gap-2 bg-slate-900 hover:bg-slate-800">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActions}</div>
            <p className="text-xs text-muted-foreground">Recorded in selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">Unique users performed actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalActions}</div>
            <p className="text-xs text-muted-foreground">Updates and Deletions</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>System usage trends over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#0f172a" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: "#0f172a" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Activity Log
            </CardTitle>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="APPROVE">Approve</SelectItem>
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Entities</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="timesheet">Timesheet</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{format(parseISO(log.created_at), 'MMM dd, yyyy')}</span>
                          <span className="text-xs text-muted-foreground">{format(parseISO(log.created_at), 'HH:mm:ss')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                            {log.user?.full_name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{log.user?.full_name}</span>
                            <span className="text-xs text-muted-foreground">{log.user?.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="capitalize font-medium">{log.entity_type}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={log.entity_name}>
                            {log.entity_name || log.entity_id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {log.ip_address ? `IP: ${log.ip_address}` : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setIsDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Transaction ID: {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">User</h4>
                  <p className="text-sm font-semibold">{selectedLog.user?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedLog.user?.email}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Timestamp</h4>
                  <p className="text-sm">{format(parseISO(selectedLog.created_at), 'PPpp')}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Action</h4>
                  <Badge variant="outline" className={getActionColor(selectedLog.action)}>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Entity</h4>
                  <p className="text-sm capitalize">{selectedLog.entity_type}: {selectedLog.entity_name}</p>
                </div>
              </div>

              {(selectedLog.old_values || selectedLog.new_values) && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Changes</h4>
                  <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 bg-slate-50">
                    <div>
                      <h5 className="text-xs font-semibold text-red-600 mb-2">Old Values</h5>
                      {selectedLog.old_values ? (
                        <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-[200px]">
                          {JSON.stringify(selectedLog.old_values, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No previous data</span>
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-green-600 mb-2">New Values</h5>
                      {selectedLog.new_values ? (
                        <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-[200px]">
                          {JSON.stringify(selectedLog.new_values, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No new data</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
