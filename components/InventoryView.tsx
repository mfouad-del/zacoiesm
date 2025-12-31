import React, { useState, useEffect } from 'react';
import { Language, InventoryItem, StockTransaction } from '../types';
import { fetchInventory, createInventoryItem } from '../lib/services';
import { TRANSLATIONS } from '../constants';
import { 
  Box, 
  Search, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  AlertTriangle,
  Loader2,
  Package,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InventoryViewProps {
  lang: Language;
}

export default function InventoryView({ lang }: InventoryViewProps) {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState('stock');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: 'pcs',
    minLevel: 0
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchInventory();
      // Map DB resources to InventoryItem
      const mappedInventory: InventoryItem[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        sku: item.id.substring(0, 8).toUpperCase(),
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        minLevel: item.min_quantity || 0,
        location: lang === 'ar' ? 'الموقع الرئيسي' : 'Main Site',
        lastUpdated: new Date(item.updated_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')
      }));
      setInventory(mappedInventory);
      
      // Mock transactions
      setTransactions([
        { 
          id: 'TRX-001', 
          itemId: mappedInventory[0]?.id || 'INV-001', 
          type: 'in', 
          quantity: 200, 
          date: new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US'), 
          reference: 'PO-2024-001', 
          performedBy: lang === 'ar' ? 'أحمد المخزن' : 'Ahmed Storekeeper' 
        }
      ]);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast.error(lang === 'ar' ? 'فشل تحميل المخزون' : 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [lang]);

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    try {
      await createInventoryItem({
        name: newItem.name,
        category: newItem.category,
        quantity: newItem.quantity,
        unit: newItem.unit,
        min_quantity: newItem.minLevel,
        // site_id: 'default-site' // Optional
      });
      
      toast.success(lang === 'ar' ? 'تم إضافة الصنف بنجاح' : 'Item added successfully');
      setIsAddItemModalOpen(false);
      setNewItem({ name: '', category: '', quantity: 0, unit: 'pcs', minLevel: 0 });
      loadData();
    } catch (error) {
      console.error('Failed to add item:', error);
      toast.error(lang === 'ar' ? 'فشل إضافة الصنف' : 'Failed to add item');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // Calculate stats
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.quantity <= item.minLevel).length;
  const outOfStockItems = inventory.filter(item => item.quantity === 0).length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * 10), 0); // Mock calculation

  // Filter inventory based on search
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.inventory}</h1>
          <p className="text-slate-500 mt-1">{lang === 'ar' ? 'تتبع مستويات المخزون والحركات' : 'Track stock levels and movements'}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-brand-600 hover:bg-brand-700">
                <Plus className="h-4 w-4" />
                {t.addItem}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.addItem}</DialogTitle>
                <DialogDescription>
                  {lang === 'ar' ? 'أدخل تفاصيل الصنف الجديد' : 'Enter new item details'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>{t.itemName}</Label>
                  <Input 
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder={lang === 'ar' ? 'اسم الصنف' : 'Item Name'}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t.category}</Label>
                  <Select 
                    value={newItem.category} 
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.category} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="material">{lang === 'ar' ? 'مواد خام' : 'Raw Material'}</SelectItem>
                      <SelectItem value="equipment">{lang === 'ar' ? 'معدات' : 'Equipment'}</SelectItem>
                      <SelectItem value="consumable">{lang === 'ar' ? 'مستهلكات' : 'Consumables'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t.quantity}</Label>
                    <Input 
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{lang === 'ar' ? 'الوحدة' : 'Unit'}</Label>
                    <Input 
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>{lang === 'ar' ? 'الحد الأدنى' : 'Min Level'}</Label>
                  <Input 
                    type="number"
                    value={newItem.minLevel}
                    onChange={(e) => setNewItem({ ...newItem, minLevel: Number(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddItemModalOpen(false)}>{t.cancel}</Button>
                <Button onClick={handleAddItem}>{t.save}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lang === 'ar' ? 'إجمالي الأصناف' : 'Total Items'}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.lowStock}</CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{lowStockItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.outOfStock}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lang === 'ar' ? 'القيمة الإجمالية' : 'Total Value'}</CardTitle>
            <Box className="h-4 w-4 text-brand-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock" className="gap-2">
            <Box className="h-4 w-4" />
            {t.stock}
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-2">
            <History className="h-4 w-4" />
            {t.movements}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{lang === 'ar' ? 'أصناف المخزون' : 'Inventory Items'}</CardTitle>
                <div className="flex gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder={t.search} 
                      className="pl-8" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                    <TableHead>{t.itemName}</TableHead>
                    <TableHead>{t.sku}</TableHead>
                    <TableHead>{t.category}</TableHead>
                    <TableHead>{t.location}</TableHead>
                    <TableHead>{t.quantity}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        {lang === 'ar' ? 'لا توجد أصناف' : 'No items found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell><Badge variant="outline" className="font-mono">{item.sku}</Badge></TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{item.quantity}</span>
                            <span className="text-muted-foreground text-sm">{item.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.quantity === 0 ? (
                            <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                              {t.outOfStock}
                            </Badge>
                          ) : item.quantity <= item.minLevel ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {t.lowStock}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {t.inStock}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">{t.details}</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.recentTransactions}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.date}</TableHead>
                    <TableHead>{t.type}</TableHead>
                    <TableHead>{t.itemName}</TableHead>
                    <TableHead>{t.quantity}</TableHead>
                    <TableHead>{t.reference}</TableHead>
                    <TableHead>{t.performedBy}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        {lang === 'ar' ? 'لا توجد معاملات' : 'No transactions found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((trx) => {
                      const item = inventory.find(i => i.id === trx.itemId);
                      return (
                        <TableRow key={trx.id}>
                          <TableCell>{trx.date}</TableCell>
                          <TableCell>
                            {trx.type === 'in' ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 gap-1">
                                <ArrowDownLeft className="h-3 w-3" /> {t.in}
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 gap-1">
                                <ArrowUpRight className="h-3 w-3" /> {t.out}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{item?.name || trx.itemId}</TableCell>
                          <TableCell>
                            <span className="font-semibold">{trx.quantity}</span> {item?.unit}
                          </TableCell>
                          <TableCell><Badge variant="outline">{trx.reference}</Badge></TableCell>
                          <TableCell>{trx.performedBy}</TableCell>
                        </TableRow>
                      );
                    })
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
