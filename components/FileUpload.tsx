import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadFile, validateFile } from '../lib/storage/upload';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadComplete?: (path: string, url: string) => void;
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onUploadComplete, 
  folder = 'uploads',
  maxSize = 50,
  allowedTypes,
  multiple = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; status: 'success' | 'error' }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);

    for (const file of files) {
      try {
        // Validate
        const validation = validateFile(file, { folder, maxSize, allowedTypes });
        if (!validation.valid) {
          toast.error(validation.error || 'خطأ في التحقق من الملف');
          setUploadedFiles(prev => [...prev, { name: file.name, url: '', status: 'error' }]);
          continue;
        }

        // Upload
        const result = await uploadFile(file, { folder, maxSize, allowedTypes });
        if (result) {
          toast.success(`تم رفع ${file.name} بنجاح`);
          setUploadedFiles(prev => [...prev, { name: file.name, url: result.url, status: 'success' }]);
          onUploadComplete?.(result.path, result.url);
        }
      } catch (error: any) {
        toast.error(error.message || 'فشل رفع الملف');
        setUploadedFiles(prev => [...prev, { name: file.name, url: '', status: 'error' }]);
      }
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div 
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 transition-all"
      >
        <input
          ref={inputRef}
          type="file"
          onChange={handleFileSelect}
          multiple={multiple}
          className="hidden"
          accept={allowedTypes?.join(',')}
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center">
            <Upload className="w-8 h-8 text-brand-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">
              اسحب الملفات هنا أو اضغط للتحميل
            </p>
            <p className="text-sm text-slate-500 mt-1">
              الحد الأقصى: {maxSize}MB • PDF, Word, Excel, صور
            </p>
          </div>
        </div>
      </div>

      {uploading && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-sm font-semibold text-blue-900">جاري رفع الملفات...</span>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                file.status === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {file.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                  {file.url && (
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      عرض الملف
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
