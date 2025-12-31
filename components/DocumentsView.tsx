import React, { useState } from 'react';
import { Language, Document } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  FileText, File, Image, FileSpreadsheet, Search, 
  Download, FolderOpen, Clock, CheckCircle, 
  Eye, UploadCloud, FileCode,
  LayoutGrid, List
} from 'lucide-react';

interface DocumentsViewProps {
  lang: Language;
  documents: Document[];
  onAddDoc: () => void;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ lang, documents, onAddDoc }) => {
  const t = TRANSLATIONS[lang];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const categories = [
    { id: 'All', label: lang === 'ar' ? 'الكل' : 'All Files', icon: FolderOpen },
    { id: 'Drawing', label: lang === 'ar' ? 'المخططات' : 'Drawings', icon: Image },
    { id: 'RFI', label: lang === 'ar' ? 'استفسارات (RFI)' : 'RFIs', icon: FileText },
    { id: 'Submittal', label: lang === 'ar' ? 'اعتمادات' : 'Submittals', icon: CheckCircle },
    { id: 'Contract', label: lang === 'ar' ? 'العقود' : 'Contracts', icon: File },
    { id: 'Report', label: lang === 'ar' ? 'التقارير' : 'Reports', icon: FileSpreadsheet },
  ];

  const filteredDocs = documents.filter(doc => 
    (selectedCategory === 'All' || doc.category === selectedCategory) &&
    (doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'PDF': return <FileText className="text-red-500" />;
      case 'DWG': return <FileCode className="text-blue-500" />;
      case 'XLSX': return <FileSpreadsheet className="text-emerald-500" />;
      case 'JPG': return <Image className="text-purple-500" />;
      default: return <File className="text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'Superseded': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.documents}</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {lang === 'ar' ? 'نظام إدارة المستندات والمخططات الفنية (EDMS)' : 'Engineering Document Management System (EDMS)'}
          </p>
        </div>
        <button onClick={onAddDoc} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/25">
          <UploadCloud size={18} />
          {lang === 'ar' ? 'رفع مستند جديد' : 'Upload New Document'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <File size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'إجمالي الملفات' : 'Total Files'}</p>
            <p className="text-2xl font-black text-slate-900">{documents.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'معتمد' : 'Approved'}</p>
            <p className="text-2xl font-black text-slate-900">{documents.filter(d => d.status === 'Approved').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'قيد المراجعة' : 'Pending Review'}</p>
            <p className="text-2xl font-black text-slate-900">{documents.filter(d => d.status === 'Pending').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <UploadCloud size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'تم الرفع اليوم' : 'Uploaded Today'}</p>
            <p className="text-2xl font-black text-slate-900">3</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar / Categories */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">{lang === 'ar' ? 'المجلدات' : 'Folders'}</h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                    ${selectedCategory === cat.id 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <cat.icon size={18} />
                  {cat.label}
                  <span className="ml-auto text-xs bg-white px-2 py-1 rounded-md text-slate-400 border border-slate-100">
                    {cat.id === 'All' ? documents.length : documents.filter(d => d.category === cat.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Toolbar */}
          <div className="bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={lang === 'ar' ? 'بحث في المستندات...' : 'Search documents...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>

          {/* Documents List/Grid */}
          {viewMode === 'list' ? (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'الرمز' : 'Code'}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-end">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocs.map(doc => (
                      <tr 
                        key={doc.id} 
                        onClick={() => setSelectedDoc(doc)}
                        className={`group hover:bg-slate-50 transition-colors cursor-pointer ${selectedDoc?.id === doc.id ? 'bg-blue-50/50' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                              {getFileIcon(doc.type)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{doc.title}</p>
                              <p className="text-xs text-slate-500">{doc.size} • {doc.version}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{doc.code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(doc.status)}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{doc.date}</td>
                        <td className="px-6 py-4 text-end">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                              <Eye size={16} />
                            </button>
                            <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                              <Download size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                      {getFileIcon(doc.type)}
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{doc.title}</h4>
                  <p className="text-xs text-slate-500 mb-4">{doc.code}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400">{doc.date}</span>
                    <span className="text-xs font-bold text-slate-400">{doc.size}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsView;
