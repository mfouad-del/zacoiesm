import React, { useState, useEffect } from 'react';
import { Language, Correspondence } from '../types';
import { fetchCorrespondence } from '../lib/services';
import { TRANSLATIONS } from '../constants';
import { 
  Plus, 
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface CorrespondenceViewProps {
  lang: Language;
}

export default function CorrespondenceView({ lang }: CorrespondenceViewProps) {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState('all');
  const [correspondence, setCorrespondence] = useState<Correspondence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCorrespondence();
        setCorrespondence(data || []);
      } catch (error) {
        console.error('Failed to load correspondence:', error);
        toast.error(lang === 'ar' ? 'فشل تحميل المراسلات' : 'Failed to load correspondence');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [lang]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'replied': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Replied</Badge>;
      case 'closed': return <Badge variant="outline" className="bg-slate-100 text-slate-700">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredCorrespondence = activeTab === 'all' 
    ? correspondence 
    : correspondence.filter(c => c.type === activeTab);

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.correspondence}</h1>
          <p className="text-slate-500 mt-1">Manage incoming and outgoing communications.</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2 bg-brand-600 hover:bg-brand-700">
            <Plus className="h-4 w-4" />
            {lang === 'ar' ? 'رسالة جديدة' : 'New Message'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">All</TabsTrigger>
          <TabsTrigger value="incoming" className="gap-2">Incoming</TabsTrigger>
          <TabsTrigger value="outgoing" className="gap-2">Outgoing</TabsTrigger>
          <TabsTrigger value="internal" className="gap-2">Internal</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Correspondence Log</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCorrespondence.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No correspondence found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCorrespondence.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.subject}</TableCell>
                        <TableCell className="capitalize">{item.type}</TableCell>
                        <TableCell>{item.sender}</TableCell>
                        <TableCell>{item.recipient}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
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
