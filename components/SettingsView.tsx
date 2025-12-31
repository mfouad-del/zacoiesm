import React, { useState, useEffect } from 'react';
import { Language, User } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  User as UserIcon, 
  Users,
  Bell, 
  Trash2, 
  Plus, 
  Loader2,
  Download,
  FileText,
  CheckCircle2,
  Monitor,
  Key,
  Webhook
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
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { fetchUsers, createUser, deleteUser, changePassword } from '../lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { toast } from 'sonner';

interface SettingsViewProps {
  lang: Language;
  user: User;
  onUpdateUser: (user: User) => void;
}

export default function SettingsView({ lang, user, onUpdateUser }: SettingsViewProps) {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
    avatar: user.avatar || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Users Management State
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'user',
    phone: ''
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: false,
    marketing: false
  });

  // Load Users
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users', error);
      toast.error('Failed to load users list');
    } finally {
      setIsLoading(false);
    }
  };

  // Profile Handlers
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update global user state
      onUpdateUser({
        ...user,
        name: profileForm.name,
        email: profileForm.email,
        avatar: profileForm.avatar
      });

      if (profileForm.newPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          throw new Error("Passwords don't match");
        }
        // Call change password API
        await changePassword(profileForm.newPassword);
      }

      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // User Management Handlers
  const handleCreateUser = async () => {
    setIsLoading(true);
    try {
      await createUser(newUserForm);
      toast.success('User created successfully');
      setIsUserModalOpen(false);
      setNewUserForm({ full_name: '', email: '', password: '', role: 'user', phone: '' });
      loadUsers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUser(userId);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(errorMessage);
    }
  };

  // Export Handlers
  const handleExportCSV = () => {
    const csvData = users.map(u => ({
      ID: u.id,
      Name: u.full_name || u.name,
      Email: u.email,
      Role: u.role,
      Status: 'Active', // Mock status
      'Created At': u.created_at || new Date().toISOString()
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Users Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = users.map(u => [
      u.full_name || u.name,
      u.email,
      u.role,
      'Active',
      u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'
    ]);

    autoTable(doc, {
      head: [['Name', 'Email', 'Role', 'Status', 'Joined']],
      body: tableData,
      startY: 40,
    });

    doc.save(`users_export_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.settings}</h1>
        <p className="text-slate-500 mt-1">
          {lang === 'ar' ? 'إدارة ملفك الشخصي وإعدادات النظام والمستخدمين' : 'Manage your profile, system settings and users'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1">
          <TabsTrigger value="profile" className="gap-2 py-2">
            <UserIcon className="h-4 w-4" />
            {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2 py-2">
            <Users className="h-4 w-4" />
            {lang === 'ar' ? 'المستخدمين' : 'Users'}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 py-2">
            <Bell className="h-4 w-4" />
            {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2 py-2">
            <Monitor className="h-4 w-4" />
            {lang === 'ar' ? 'النظام' : 'System'}
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2 py-2">
            <Webhook className="h-4 w-4" />
            {lang === 'ar' ? 'الربط' : 'Integrations'}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 lg:col-span-5">
              <CardHeader>
                <CardTitle>{lang === 'ar' ? 'معلومات الملف الشخصي' : 'Profile Information'}</CardTitle>
                <CardDescription>
                  {lang === 'ar' ? 'تحديث معلومات حسابك وعنوان البريد الإلكتروني.' : 'Update your account\'s profile information and email address.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-20 w-20 border-2 border-slate-100">
                      <AvatarImage src={profileForm.avatar} />
                      <AvatarFallback className="text-lg bg-slate-100">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <Label htmlFor="avatar">{lang === 'ar' ? 'رابط الصورة الرمزية' : 'Avatar URL'}</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="avatar" 
                          value={profileForm.avatar} 
                          onChange={(e) => setProfileForm({...profileForm, avatar: e.target.value})}
                          placeholder="https://..."
                          className="max-w-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</Label>
                      <Input 
                        id="name" 
                        value={profileForm.name} 
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={profileForm.email} 
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <h3 className="text-lg font-medium">{lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">{lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                        <Input 
                          id="new-password" 
                          type="password" 
                          value={profileForm.newPassword}
                          onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">{lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                        <Input 
                          id="confirm-password" 
                          type="password" 
                          value={profileForm.confirmPassword}
                          onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="col-span-4 lg:col-span-2">
              <CardHeader>
                <CardTitle>{lang === 'ar' ? 'حالة الحساب' : 'Account Status'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">{lang === 'ar' ? 'الدور الحالي' : 'Current Role'}</div>
                    <div className="text-xs text-muted-foreground">{lang === 'ar' ? 'صلاحيات الوصول الخاصة بك' : 'Your access permissions'}</div>
                  </div>
                  <Badge variant="secondary" className="uppercase">{user.role}</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-100">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-green-900">{lang === 'ar' ? 'الحالة' : 'Status'}</div>
                    <div className="text-xs text-green-700">{lang === 'ar' ? 'نشط' : 'Active'}</div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Management Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t.userManagement}</CardTitle>
                <CardDescription>{lang === 'ar' ? 'إدارة المستخدمين وصلاحياتهم' : 'Manage users and their permissions'}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      {lang === 'ar' ? 'إضافة مستخدم' : 'Add User'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{lang === 'ar' ? 'إضافة مستخدم جديد' : 'Add New User'}</DialogTitle>
                      <DialogDescription>
                        {lang === 'ar' ? 'أدخل تفاصيل المستخدم الجديد أدناه.' : 'Enter the new user details below.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="fullname">{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</Label>
                        <Input 
                          id="fullname" 
                          value={newUserForm.full_name}
                          onChange={(e) => setNewUserForm({...newUserForm, full_name: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-email">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                        <Input 
                          id="new-email" 
                          type="email"
                          value={newUserForm.email}
                          onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">{lang === 'ar' ? 'الدور' : 'Role'}</Label>
                        <Select 
                          value={newUserForm.role} 
                          onValueChange={(v) => setNewUserForm({...newUserForm, role: v})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="engineer">Engineer</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateUser} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (lang === 'ar' ? 'إضافة' : 'Add')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{lang === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                      <TableHead>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                      <TableHead>{lang === 'ar' ? 'الدور' : 'Role'}</TableHead>
                      <TableHead>{lang === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead className="text-right">{lang === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.full_name || u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{u.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{lang === 'ar' ? 'تفضيلات الإشعارات' : 'Notification Preferences'}</CardTitle>
              <CardDescription>
                {lang === 'ar' ? 'اختر كيف ومتى تريد تلقي الإشعارات.' : 'Choose how and when you want to receive notifications.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notifs" className="flex flex-col space-y-1">
                  <span>{lang === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</span>
                  <span className="font-normal text-xs text-muted-foreground">Receive daily summaries and alerts via email.</span>
                </Label>
                <Switch 
                  id="email-notifs" 
                  checked={notifications.email}
                  onCheckedChange={(c) => setNotifications({...notifications, email: c})}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="push-notifs" className="flex flex-col space-y-1">
                  <span>{lang === 'ar' ? 'إشعارات المتصفح' : 'Push Notifications'}</span>
                  <span className="font-normal text-xs text-muted-foreground">Receive real-time alerts on your desktop.</span>
                </Label>
                <Switch 
                  id="push-notifs" 
                  checked={notifications.push}
                  onCheckedChange={(c) => setNotifications({...notifications, push: c})}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="updates-notifs" className="flex flex-col space-y-1">
                  <span>{lang === 'ar' ? 'تحديثات النظام' : 'System Updates'}</span>
                  <span className="font-normal text-xs text-muted-foreground">Get notified about new features and maintenance.</span>
                </Label>
                <Switch 
                  id="updates-notifs" 
                  checked={notifications.updates}
                  onCheckedChange={(c) => setNotifications({...notifications, updates: c})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{lang === 'ar' ? 'إعدادات النظام' : 'System Settings'}</CardTitle>
              <CardDescription>
                {lang === 'ar' ? 'تخصيص تجربة الاستخدام الخاصة بك.' : 'Customize your usage experience.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label>{lang === 'ar' ? 'اللغة' : 'Language'}</Label>
                <Select defaultValue={lang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية (Arabic)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{lang === 'ar' ? 'المنطقة الزمنية' : 'Timezone'}</Label>
                <Select defaultValue="riyadh">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="riyadh">Riyadh (GMT+3)</SelectItem>
                    <SelectItem value="cairo">Cairo (GMT+2)</SelectItem>
                    <SelectItem value="dubai">Dubai (GMT+4)</SelectItem>
                    <SelectItem value="london">London (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{lang === 'ar' ? 'المظهر' : 'Theme'}</Label>
                <Select defaultValue="system">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{lang === 'ar' ? 'فاتح' : 'Light'}</SelectItem>
                    <SelectItem value="dark">{lang === 'ar' ? 'داكن' : 'Dark'}</SelectItem>
                    <SelectItem value="system">{lang === 'ar' ? 'النظام' : 'System'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{lang === 'ar' ? 'مفاتيح API' : 'API Keys'}</CardTitle>
              <CardDescription>
                {lang === 'ar' ? 'إدارة مفاتيح الوصول للربط مع الأنظمة الخارجية.' : 'Manage access keys for external system integration.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Production Key</p>
                  <p className="text-sm text-muted-foreground">Created on 2024-01-01</p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-slate-100 px-2 py-1 rounded">pk_live_...8923</code>
                  <Button variant="ghost" size="sm"><Key className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                {lang === 'ar' ? 'إنشاء مفتاح جديد' : 'Generate New Key'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{lang === 'ar' ? 'Webhooks' : 'Webhooks'}</CardTitle>
              <CardDescription>
                {lang === 'ar' ? 'إعداد إشعارات الأحداث للأنظمة الخارجية.' : 'Configure event notifications for external systems.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Order Created Webhook</p>
                  <p className="text-sm text-muted-foreground">https://api.erp-system.com/webhooks/orders</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <Button variant="outline" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                {lang === 'ar' ? 'إضافة Webhook' : 'Add Webhook'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

