import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Plus, Search, File, Download, MoreVertical } from 'lucide-react';

const DocumentsView: React.FC<{ lang: Language; documents: any[]; onAddDoc: () => void }> = ({ lang, documents, onAddDoc }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.documents}</h1>
          <p className="text-gray-500 text-sm">{lang === 'ar' ? 'إدارة المستندات والمخططات الفنية.' : 'Manage technical documents and drawings.'}</p>
        </div>
        <button onClick={onAddDoc} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          <Plus size={18} />
          {t.addNew}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl">
            <thead className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">{t.docCode}</th>
                <th className="px-6 py-4">{t.docTitle}</th>
                <th className="px-6 py-4">{t.version}</th>
                <th className="px-6 py-4">{t.date}</th>
                <th className="px-6 py-4">{t.status}</th>
                <th className="px-6 py-4">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc, i) => (
                <tr key={i} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-blue-600">{doc.code}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <File size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-800">{doc.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">{doc.version}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">{doc.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                      ${doc.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentsView;
