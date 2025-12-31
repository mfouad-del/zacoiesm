import React, { useState, useEffect } from 'react';
import { Language, ProcurementOrder, Supplier, Project, UserRole } from '../types';
import { fetchProcurementOrders, fetchSuppliers, createProcurementOrder, createSupplier } from '../lib/services';
import { TRANSLATIONS } from '../constants';
import { 
  ShoppingCart, 
  Plus, 
  Filter, 
  Search, 
  CheckCircle2, 
  Users, 
  Loader2,
  Package,
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  // CardDescription, 
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

interface ProcurementViewProps {
  lang: Language;
  projects: Project[];
  userRole?: UserRole;
}

export default function ProcurementView({ lang, projects }: ProcurementViewProps) {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<ProcurementOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // New Order Form State
  const [newOrder, setNewOrder] = useState<Partial<ProcurementOrder>>({
    projectId: '',
    supplierId: '',
    items: [],
    notes: ''
  });

  // New Supplier Form State
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordersData, suppliersData] = await Promise.all([
        fetchProcurementOrders(),
        fetchSuppliers()
      ]);
      
      setOrders(ordersData || []);
      setSuppliers(suppliersData || []);

    } catch (error) {
      console.error('Failed to load procurement data:', error);
      toast.error(lang === 'ar' ? 'فشل تحميل بيانات المشتريات' : 'Failed to load procurement data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateOrder = async () => {
    if (!newOrder.projectId || !newOrder.supplierId) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await createProcurementOrder(newOrder, (newOrder.items || []) as any[]);
      toast.success(lang === 'ar' ? 'تم إنشاء الطلب بنجاح' : 'Order created successfully');
      setIsOrderModalOpen(false);
      loadData();
      setNewOrder({ projectId: '', supplierId: '', items: [], notes: '' });
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(lang === 'ar' ? 'فشل إنشاء الطلب' : 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSupplier = async () => {
    if (!newSupplier.name || !newSupplier.email) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await createSupplier({ ...newSupplier, status: 'active' });
      toast.success(lang === 'ar' ? 'تم إضافة المورد بنجاح' : 'Supplier added successfully');
      setIsSupplierModalOpen(false);
      loadData();
      setNewSupplier({ name: '', contactPerson: '', email: '', phone: '', address: '' });
    } catch (error) {
      console.error('Failed to create supplier:', error);
      toast.error(lang === 'ar' ? 'فشل إضافة المورد' : 'Failed to add supplier');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { color: 'bg-slate-100 text-slate-700 border-slate-200', label: t.draft },
      pending_approval: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: t.pendingApproval },
      approved: { color: 'bg-green-50 text-green-700 border-green-200', label: t.approved },
      rejected: { color: 'bg-red-50 text-red-700 border-red-200', label: t.rejected },
      ordered: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: t.ordered },
      delivered: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: t.delivered }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { color: 'bg-slate-100 text-slate-700', label: status };
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending_approval').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const totalAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.procurement}</h1>
          <p className="text-slate-500 mt-1">{lang === 'ar' ? 'إدارة طلبات الشراء والموردين' : 'Manage purchase orders and suppliers'}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSupplierModalOpen} onOpenChange={setIsSupplierModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                {t.addSupplier}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.addSupplier}</DialogTitle>
                <DialogDescription>{lang === 'ar' ? 'أضف مورد جديد للنظام' : 'Add a new supplier to the system'}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t.supplierName}*</Label>
                  <Input 
                    placeholder={lang === 'ar' ? 'اسم المورد' : 'Supplier name'} 
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.contactPerson}</Label>
                  <Input 
                    placeholder={lang === 'ar' ? 'اسم جهة الاتصال' : 'Contact person'} 
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.email}*</Label>
                    <Input 
                      type="email"
                      placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'} 
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.phone}</Label>
                    <Input 
                      placeholder={lang === 'ar' ? 'رقم الهاتف' : 'Phone'} 
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t.address}</Label>
                  <Input 
                    placeholder={lang === 'ar' ? 'العنوان' : 'Address'} 
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateSupplier} disabled={isLoading} className="bg-brand-600 hover:bg-brand-700">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (lang === 'ar' ? 'حفظ' : 'Save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-brand-600 hover:bg-brand-700">
                <Plus className="h-4 w-4" />
                {t.createOrder}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.createOrder}</DialogTitle>
                <DialogDescription>{lang === 'ar' ? 'إنشاء طلب شراء جديد' : 'Create a new purchase order'}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.projectName}*</Label>
                    <Select onValueChange={(v) => setNewOrder({...newOrder, projectId: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر مشروع' : 'Select Project'} />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.supplier}*</Label>
                    <Select onValueChange={(v) => setNewOrder({...newOrder, supplierId: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر مورد' : 'Select Supplier'} />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{lang === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                  <Input 
                    placeholder={lang === 'ar' ? 'ملاحظات إضافية...' : 'Additional notes...'} 
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateOrder} disabled={isLoading} className="bg-brand-600 hover:bg-brand-700">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.createOrder}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lang === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lang === 'ar' ? 'بانتظار الاعتماد' : 'Pending Approval'}</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lang === 'ar' ? 'تم التسليم' : 'Delivered'}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveredOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lang === 'ar' ? 'القيمة الإجمالية' : 'Total Value'}</CardTitle>
            <TrendingUp className="h-4 w-4 text-brand-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            {t.orders}
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Users className="h-4 w-4" />
            {t.suppliers}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{lang === 'ar' ? 'طلبات الشراء' : 'Purchase Orders'}</CardTitle>
                <div className="flex gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t.search} className="pl-8" />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.orderNumber}</TableHead>
                    <TableHead>{t.projectName}</TableHead>
                    <TableHead>{t.supplier}</TableHead>
                    <TableHead>{t.requestDate}</TableHead>
                    <TableHead>{t.totalAmount}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        {lang === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{projects.find(p => p.id === order.projectId)?.name || '-'}</TableCell>
                        <TableCell>{suppliers.find(s => s.id === order.supplierId)?.name || '-'}</TableCell>
                        <TableCell>{order.requestDate}</TableCell>
                        <TableCell className="font-semibold">${order.totalAmount?.toLocaleString() || 0}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">{lang === 'ar' ? 'عرض' : 'View'}</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{lang === 'ar' ? 'قائمة الموردين' : 'Suppliers List'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.supplierName}</TableHead>
                    <TableHead>{t.contactPerson}</TableHead>
                    <TableHead>{t.email}</TableHead>
                    <TableHead>{t.phone}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        {lang === 'ar' ? 'لا يوجد موردين' : 'No suppliers found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{supplier.contactPerson || '-'}</TableCell>
                        <TableCell>{supplier.email}</TableCell>
                        <TableCell>{supplier.phone || '-'}</TableCell>
                        <TableCell>
                          {supplier.status === 'active' ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {lang === 'ar' ? 'نشط' : 'Active'}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-100 text-slate-700">
                              {lang === 'ar' ? 'غير نشط' : 'Inactive'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">{lang === 'ar' ? 'تعديل' : 'Edit'}</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
