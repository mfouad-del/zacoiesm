import React, { useState, useEffect } from 'react';
import { Language, InventoryItem, StockTransaction } from '../types';
import { fetchInventory } from '../lib/services';
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
  Loader2
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

interface InventoryViewProps {
  lang: Language;
}

export default function InventoryView({ lang }: InventoryViewProps) {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState('stock');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchInventory();
        // Map DB resources to InventoryItem
        const mappedInventory: InventoryItem[] = (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          sku: item.id.substring(0, 8).toUpperCase(), // Mock SKU from ID
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          minLevel: item.min_quantity || 0,
          location: 'Main Site', // Placeholder
          lastUpdated: new Date(item.updated_at).toLocaleDateString()
        }));
        setInventory(mappedInventory);
        // Mock transactions for now as we don't have an API for it yet
        setTransactions([
          { id: 'TRX-001', itemId: mappedInventory[0]?.id || 'INV-001', type: 'in', quantity: 200, date: '2024-06-10', reference: 'PO-2024-001', performedBy: 'Ahmed Storekeeper' }
        ]);
      } catch (error) {
        console.error('Failed to load inventory:', error);
        toast.error(lang === 'ar' ? 'فشل تحميل المخزون' : 'Failed to load inventory');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [lang]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.inventory}</h1>
          <p className="text-slate-500 mt-1">Track stock levels, movements, and material usage.</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2 bg-brand-600 hover:bg-brand-700">
            <Plus className="h-4 w-4" />
            {lang === 'ar' ? 'إضافة صنف' : 'Add Item'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {inventory.filter(i => i.quantity <= i.minLevel).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">$</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">Estimated stock value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock" className="gap-2">
            <Box className="h-4 w-4" />
            Current Stock
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-2">
            <History className="h-4 w-4" />
            Stock Movements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Inventory Items</CardTitle>
                <div className="flex gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search items..." className="pl-8" />
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
                    <TableHead>Item Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{item.quantity}</span>
                          <span className="text-muted-foreground text-sm">{item.unit}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.quantity <= item.minLevel ? (
                          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Low Stock</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Stock</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Performed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((trx) => {
                    const item = inventory.find(i => i.id === trx.itemId);
                    return (
                      <TableRow key={trx.id}>
                        <TableCell>{trx.date}</TableCell>
                        <TableCell>
                          {trx.type === 'in' ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 gap-1">
                              <ArrowDownLeft className="h-3 w-3" /> In
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 gap-1">
                              <ArrowUpRight className="h-3 w-3" /> Out
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{item?.name || trx.itemId}</TableCell>
                        <TableCell>{trx.quantity} {item?.unit}</TableCell>
                        <TableCell>{trx.reference}</TableCell>
                        <TableCell>{trx.performedBy}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
