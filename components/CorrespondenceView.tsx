import React, { useState } from 'react';
import { Language, Transmittal, RFI } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  Mail, 
  Send, 
  Inbox, 
  FileText, 
  Plus, 
  Search, 
  Filter,
  MessageSquare,
  Paperclip,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

interface CorrespondenceViewProps {
  lang: Language;
}

export default function CorrespondenceView({ lang }: CorrespondenceViewProps) {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState('rfi');

  // Mock Data
  const [rfis, setRfis] = useState<RFI[]>([
    { 
      id: 'RFI-001', 
      code: 'RFI-CIV-001', 
      subject: 'Clarification on Foundation Depth', 
      question: 'The drawings show 1.5m but specs say 2.0m. Please clarify.',
      requestedBy: 'Eng. Ahmed',
      assignedTo: 'Consultant Office',
      date: '2024-06-15',
      dueDate: '2024-06-20',
      status: 'Open',
      priority: 'High',
      projectId: 'PRJ-001',
      discipline: 'Civil'
    },
    { 
      id: 'RFI-002', 
      code: 'RFI-MEP-005', 
      subject: 'HVAC Duct Routing Conflict', 
      question: 'Conflict with structural beam at grid A-5.',
      answer: 'Reroute duct below beam as per attached sketch.',
      requestedBy: 'Eng. Sarah',
      assignedTo: 'Consultant Office',
      date: '2024-06-10',
      dueDate: '2024-06-15',
      status: 'Answered',
      priority: 'Medium',
      projectId: 'PRJ-001',
      discipline: 'MEP'
    }
  ]);

  const [transmittals, setTransmittals] = useState<Transmittal[]>([
    {
      id: 'TR-001',
      code: 'TR-STR-001',
      subject: 'Submission of Shop Drawings for 1st Floor Slab',
      sender: 'Contractor Co.',
      recipient: 'Consultant Office',
      date: '2024-06-18',
      status: 'Sent',
      type: 'Drawing',
      projectId: 'PRJ-001',
      attachments: ['Slab-L1-01.dwg', 'Slab-L1-02.dwg']
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Open</Badge>;
      case 'Answered': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Answered</Badge>;
      case 'Closed': return <Badge variant="outline" className="bg-slate-100 text-slate-700">Closed</Badge>;
      case 'Overdue': return <Badge variant="destructive">Overdue</Badge>;
      case 'Sent': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Sent</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.correspondence}</h1>
          <p className="text-slate-500 mt-1">Manage RFIs, Transmittals, and official communications.</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2 bg-brand-600 hover:bg-brand-700">
            <Plus className="h-4 w-4" />
            {lang === 'ar' ? 'إنشاء جديد' : 'Create New'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open RFIs</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rfis.filter(r => r.status === 'Open').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue RFIs</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rfis.filter(r => r.status === 'Overdue').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Transmittals</CardTitle>
            <Send className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transmittals.filter(t => t.status === 'Sent').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <History className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5 Days</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="rfi" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            RFIs
          </TabsTrigger>
          <TabsTrigger value="transmittals" className="gap-2">
            <Send className="h-4 w-4" />
            Transmittals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rfi" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Request for Information (RFI)</CardTitle>
                <div className="flex gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search RFIs..." className="pl-8" />
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
                    <TableHead>Code</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Discipline</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rfis.map((rfi) => (
                    <TableRow key={rfi.id}>
                      <TableCell className="font-medium">{rfi.code}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{rfi.subject}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{rfi.question}</span>
                        </div>
                      </TableCell>
                      <TableCell>{rfi.discipline}</TableCell>
                      <TableCell>{rfi.date}</TableCell>
                      <TableCell>{rfi.dueDate}</TableCell>
                      <TableCell>{getStatusBadge(rfi.status)}</TableCell>
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

        <TabsContent value="transmittals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transmittals Log</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transmittals.map((tr) => (
                    <TableRow key={tr.id}>
                      <TableCell className="font-medium">{tr.code}</TableCell>
                      <TableCell>{tr.subject}</TableCell>
                      <TableCell>{tr.type}</TableCell>
                      <TableCell>{tr.sender}</TableCell>
                      <TableCell>{tr.recipient}</TableCell>
                      <TableCell>{tr.date}</TableCell>
                      <TableCell>{getStatusBadge(tr.status)}</TableCell>
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
      </Tabs>
    </div>
  );
}

function History(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </svg>
    )
  }
