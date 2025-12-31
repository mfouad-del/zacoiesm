import React, { useState, useEffect } from 'react';
import { Language, Correspondence } from '../types';
import { fetchCorrespondence, createCorrespondence } from '../lib/services';
import { TRANSLATIONS } from '../constants';
import { 
  Plus, 
  Loader2,
  Mail,
  Send,
  Inbox,
  Users,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CorrespondenceViewProps {
  lang: Language;
}

export default function CorrespondenceView({ lang }: CorrespondenceViewProps) {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState('all');
  const [correspondence, setCorrespondence] = useState<Correspondence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    recipient: '',
    content: '',
    type: 'outgoing' as 'outgoing' | 'internal'
  });

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

  useEffect(() => {
    loadData();
  }, [lang]);

  const handleSendMessage = async () => {
    if (!newMessage.subject || !newMessage.recipient || !newMessage.content) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    try {
      await createCorrespondence({
        subject: newMessage.subject,
        recipient: newMessage.recipient,
        content: newMessage.content,
        type: newMessage.type,
        sender: 'Current User', // Should be from auth context
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      });
      
      toast.success(lang === 'ar' ? 'تم إرسال الرسالة بنجاح' : 'Message sent successfully');
      setIsNewMessageModalOpen(false);
      setNewMessage({ subject: '', recipient: '', content: '', type: 'outgoing' });
      loadData();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(lang === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send message');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: t.pending },
      replied: { color: 'bg-green-50 text-green-700 border-green-200', label: t.replied },
      closed: { color: 'bg-slate-100 text-slate-700 border-slate-200', label: t.closed }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { color: 'bg-slate-100 text-slate-700', label: status };
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incoming': return <Inbox className="h-4 w-4 text-blue-600" />;
      case 'outgoing': return <Send className="h-4 w-4 text-green-600" />;
      case 'internal': return <Users className="h-4 w-4 text-purple-600" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const filteredCorrespondence = correspondence.filter(c => {
    const matchesTab = activeTab === 'all' || c.type === activeTab;
    const matchesSearch = searchTerm === '' || 
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.recipient.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // Calculate stats
  const totalCorrespondence = correspondence.length;
  const incomingCount = correspondence.filter(c => c.type === 'incoming').length;
  const outgoingCount = correspondence.filter(c => c.type === 'outgoing').length;
  const pendingCount = correspondence.filter(c => c.status === 'pending').length;

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.correspondence}</h1>
          <p className="text-slate-500 mt-1">{lang === 'ar' ? 'إدارة المراسلات الواردة والصادرة' : 'Manage incoming and outgoing communications'}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isNewMessageModalOpen} onOpenChange={setIsNewMessageModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-brand-600 hover:bg-brand-700">
                <Plus className="h-4 w-4" />
                {t.newMessage}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{lang === 'ar' ? 'رسالة جديدة' : 'New Message'}</DialogTitle>
                <DialogDescription>
                  {lang === 'ar' ? 'أدخل تفاصيل الرسالة الجديدة أدناه.' : 'Enter the details of the new message below.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="subject">{lang === 'ar' ? 'الموضوع' : 'Subject'}</Label>
                  <Input
                    id="subject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    placeholder={lang === 'ar' ? 'موضوع الرسالة' : 'Message subject'}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recipient">{lang === 'ar' ? 'المستلم' : 'Recipient'}</Label>
                  <Input
                    id="recipient"
                    value={newMessage.recipient}
                    onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
                    placeholder={lang === 'ar' ? 'اسم المستلم' : 'Recipient name'}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">{lang === 'ar' ? 'النوع' : 'Type'}</Label>
                  <Select
                    value={newMessage.type}
                    onValueChange={(value: 'outgoing' | 'internal') => setNewMessage({ ...newMessage, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outgoing">{lang === 'ar' ? 'صادر' : 'Outgoing'}</SelectItem>
                      <SelectItem value="internal">{lang === 'ar' ? 'داخلي' : 'Internal'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">{lang === 'ar' ? 'المحتوى' : 'Content'}</Label>
                  <Textarea
                    id="content"
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                    placeholder={lang === 'ar' ? 'نص الرسالة...' : 'Message content...'}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewMessageModalOpen(false)}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={handleSendMessage}>
                  {lang === 'ar' ? 'إرسال' : 'Send'}
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
            <CardTitle className="text-sm font-medium">{lang === 'ar' ? 'إجمالي المراسلات' : 'Total Messages'}</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCorrespondence}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.incoming}</CardTitle>
            <Inbox className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{incomingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.outgoing}</CardTitle>
            <Send className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{outgoingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.pending}</CardTitle>
            <Mail className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Mail className="h-4 w-4" />
            {t.all}
          </TabsTrigger>
          <TabsTrigger value="incoming" className="gap-2">
            <Inbox className="h-4 w-4" />
            {t.incoming}
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="gap-2">
            <Send className="h-4 w-4" />
            {t.outgoing}
          </TabsTrigger>
          <TabsTrigger value="internal" className="gap-2">
            <Users className="h-4 w-4" />
            {t.internal}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t.correspondenceLog}</CardTitle>
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
                    <TableHead>{t.type}</TableHead>
                    <TableHead>{t.subject}</TableHead>
                    <TableHead>{t.sender}</TableHead>
                    <TableHead>{t.recipient}</TableHead>
                    <TableHead>{t.date}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCorrespondence.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        {t.noCorrespondence}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCorrespondence.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <span className="capitalize text-sm">
                              {item.type === 'incoming' ? t.incoming : 
                               item.type === 'outgoing' ? t.outgoing : 
                               t.internal}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium max-w-xs truncate">{item.subject}</TableCell>
                        <TableCell>{item.sender}</TableCell>
                        <TableCell>{item.recipient}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
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
      </Tabs>
    </div>
  );
}
