import React, { useState, useEffect } from 'react';
import { Language, ProcurementOrder, Supplier, Project, UserRole } from '../types';
import { fetchProcurementOrders, fetchSuppliers, createProcurementOrder, createSupplier, updateProcurementOrder } from '../lib/services';
import { TRANSLATIONS } from '../constants';
import { 
  ShoppingCart, 
  Plus, 
  Filter, 
  Search, 
  CheckCircle2, 
  Users, 
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

export default function ProcurementView({ lang, projects, userRole }: ProcurementViewProps) {
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
      toast.error(lang === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateOrder = async () => {
    // Validation logic here
    if (!newOrder.projectId || !newOrder.supplierId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await createProcurementOrder(newOrder, newOrder.items || []);
      toast.success('Order created successfully');
      setIsOrderModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSupplier = async () => {
    if (!newSupplier.name || !newSupplier.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await createSupplier(newSupplier);
      toast.success('Supplier added successfully');
      setIsSupplierModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add supplier');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    if (userRole !== UserRole.PROJECT_MANAGER && userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.PROCUREMENT_MANAGER) {
      toast.error('You do not have permission to approve orders');
      return;
    }

    try {
      await updateProcurementOrder(orderId, { status: 'approved' });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'approved' } : o));
      toast.success('Order approved');
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve order');
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Approved</Badge>;
      case 'pending_approval': return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">Pending Approval</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Rejected</Badge>;
      case 'delivered': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Delivered</Badge>;
      default: return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.procurement}</h1>
          <p className="text-slate-500 mt-1">Manage orders, suppliers, and approvals efficiently.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-brand-600 hover:bg-brand-700">
                <Plus className="h-4 w-4" />
                {lang === 'ar' ? 'طلب شراء جديد' : 'New Purchase Order'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>Fill in the details for the new procurement request.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project</Label>
                    <Select onValueChange={(v) => setNewOrder({...newOrder, projectId: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Supplier</Label>
                    <Select onValueChange={(v) => setNewOrder({...newOrder, supplierId: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Item details would go here - simplified for this view */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input 
                    placeholder="Additional notes..." 
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateOrder} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Order'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Users className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="approvals" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Pending Approvals
            {orders.filter(o => o.status === 'pending_approval').length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {orders.filter(o => o.status === 'pending_approval').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Purchase Orders</CardTitle>
                <div className="flex gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search orders..." className="pl-8" />
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
                    <TableHead>Order #</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{projects.find(p => p.id === order.projectId)?.name || order.projectId}</TableCell>
                      <TableCell>{suppliers.find(s => s.id === order.supplierId)?.name || order.supplierId}</TableCell>
                      <TableCell>{order.requestDate}</TableCell>
                      <TableCell>${order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Supplier Directory</CardTitle>
              <Dialog open={isSupplierModalOpen} onOpenChange={setIsSupplierModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Supplier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Supplier</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input 
                        value={newSupplier.name}
                        onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Person</Label>
                      <Input 
                        value={newSupplier.contactPerson}
                        onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        value={newSupplier.email}
                        onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateSupplier} disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Supplier'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.contactPerson}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="font-bold mr-1">{supplier.rating}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Orders waiting for your review and authorization.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.filter(o => o.status === 'pending_approval').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No pending approvals.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.filter(o => o.status === 'pending_approval').map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.requestedBy}</TableCell>
                        <TableCell>${order.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>{order.requestDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Reject
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleApproveOrder(order.id)}
                            >
                              Approve
                            </Button>
                          </div>
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
