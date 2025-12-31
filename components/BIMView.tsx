import React, { useState, useEffect } from 'react';
import { Language, BIMModel } from '../types';
import { fetchBIMModels, createBIMModel } from '../lib/services';
import { TRANSLATIONS } from '../constants';
import { 
  BoxSelect, 
  Upload, 
  Eye, 
  Layers, 
  Maximize2, 
  Settings,
  Info,
  Loader2,
  Box,
  ZoomIn,
  RotateCw
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BIMViewProps {
  lang: Language;
}

export default function BIMView({ lang }: BIMViewProps) {
  const t = TRANSLATIONS[lang];
  const [selectedModel, setSelectedModel] = useState<BIMModel | null>(null);
  const [models, setModels] = useState<BIMModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewerLoading, setIsViewerLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    version: '1.0',
    file: null as File | null
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBIMModels();
      const mappedModels = (data || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        version: m.version || '1.0',
        uploadDate: new Date(m.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US'),
        size: m.metadata?.size || (lang === 'ar' ? 'غير محدد' : 'Unknown'),
        url: m.file_url,
        projectId: m.project_id
      }));
      setModels(mappedModels);
      if (mappedModels.length > 0 && !selectedModel) {
        setSelectedModel(mappedModels[0]);
        setIsViewerLoading(true);
        // Simulate loading
        setTimeout(() => setIsViewerLoading(false), 2000);
      }
    } catch (error) {
      console.error('Failed to load BIM models:', error);
      toast.error(lang === 'ar' ? 'فشل تحميل نماذج BIM' : 'Failed to load BIM models');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [lang]);

  const handleUploadModel = async () => {
    if (!newModel.name || !newModel.file) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    try {
      // In a real app, we would upload the file to storage first
      // For now, we'll just create the record with a dummy URL
      await createBIMModel({
        name: newModel.name,
        version: newModel.version,
        project_id: '1', // Default project
        file_url: URL.createObjectURL(newModel.file), // Temporary local URL
        metadata: {
          size: `${(newModel.file.size / (1024 * 1024)).toFixed(2)} MB`,
          type: newModel.file.type
        }
      });
      
      toast.success(lang === 'ar' ? 'تم رفع النموذج بنجاح' : 'Model uploaded successfully');
      setIsUploadModalOpen(false);
      setNewModel({ name: '', version: '1.0', file: null });
      loadData();
    } catch (error) {
      console.error('Failed to upload model:', error);
      toast.error(lang === 'ar' ? 'فشل رفع النموذج' : 'Failed to upload model');
    }
  };

  const handleModelSelect = (model: BIMModel) => {
    setSelectedModel(model);
    setIsViewerLoading(true);
    setTimeout(() => setIsViewerLoading(false), 1500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen flex flex-col h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.bim}</h1>
          <p className="text-slate-500 mt-1">{lang === 'ar' ? 'عرض وإدارة نماذج المباني ثلاثية الأبعاد (IFC)' : 'Visualize and manage 3D building models (IFC)'}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-brand-600 hover:bg-brand-700">
                <Upload className="h-4 w-4" />
                {t.uploadModel}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{lang === 'ar' ? 'رفع نموذج جديد' : 'Upload New Model'}</DialogTitle>
                <DialogDescription>
                  {lang === 'ar' ? 'قم برفع ملف IFC أو نموذج ثلاثي الأبعاد.' : 'Upload an IFC file or 3D model.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{lang === 'ar' ? 'اسم النموذج' : 'Model Name'}</Label>
                  <Input
                    id="name"
                    value={newModel.name}
                    onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                    placeholder={lang === 'ar' ? 'اسم النموذج' : 'Model name'}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="version">{lang === 'ar' ? 'الإصدار' : 'Version'}</Label>
                  <Input
                    id="version"
                    value={newModel.version}
                    onChange={(e) => setNewModel({ ...newModel, version: e.target.value })}
                    placeholder="1.0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file">{lang === 'ar' ? 'ملف النموذج' : 'Model File'}</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".ifc,.obj,.gltf,.glb"
                    onChange={(e) => setNewModel({ ...newModel, file: e.target.files ? e.target.files[0] : null })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={handleUploadModel}>
                  {lang === 'ar' ? 'رفع' : 'Upload'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lang === 'ar' ? 'إجمالي النماذج' : 'Total Models'}</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lang === 'ar' ? 'النموذج النشط' : 'Active Model'}</CardTitle>
            <BoxSelect className="h-4 w-4 text-brand-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">{selectedModel?.name || '-'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.version}</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedModel?.version || '-'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lang === 'ar' ? 'حجم الملف' : 'File Size'}</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{selectedModel?.size || '-'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Sidebar List */}
        <Card className="w-1/3 flex flex-col">
          <CardHeader>
            <CardTitle>{t.availableModels}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {models.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <BoxSelect className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>{lang === 'ar' ? 'لا توجد نماذج متاحة' : 'No models available'}</p>
                <Button variant="link" className="mt-2">{t.uploadModel}</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.name}</TableHead>
                    <TableHead>{t.ver}</TableHead>
                    <TableHead className="text-right">{t.action}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((model) => (
                    <TableRow 
                      key={model.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedModel?.id === model.id 
                          ? 'bg-brand-50 hover:bg-brand-100' 
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={() => handleModelSelect(model)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold">{model.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {model.uploadDate} • {model.size}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">{model.version}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4 text-brand-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Viewer Area */}
        <Card className="flex-1 flex flex-col overflow-hidden bg-slate-900 border-slate-800">
          <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            {/* Background grid pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `
                linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }} />

            {selectedModel ? (
              isViewerLoading ? (
                <div className="text-center space-y-4 z-10">
                  <div className="w-32 h-32 mx-auto bg-brand-500/20 rounded-full flex items-center justify-center animate-pulse">
                    <BoxSelect className="h-16 w-16 text-brand-400 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{t.loading} {selectedModel.name}...</h3>
                    <p className="text-slate-400">{t.initializingWebGL}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center z-10">
                  <div className="text-center space-y-6">
                    {/* 3D Cube Visual */}
                    <div className="relative w-48 h-48 mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/30 to-brand-600/30 rounded-3xl transform rotate-12 animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-tl from-brand-400/40 to-brand-500/40 rounded-3xl transform -rotate-6 animate-pulse delay-100" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Box className="h-24 w-24 text-brand-300 animate-float" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{selectedModel.name}</h3>
                      <div className="flex items-center justify-center gap-4 text-slate-400 text-sm">
                        <span className="flex items-center gap-1">
                          <Info className="h-4 w-4" /> IFC 2x3
                        </span>
                        <span>•</span>
                        <span>{t.version} {selectedModel.version}</span>
                      </div>
                    </div>

                    <p className="text-slate-500 max-w-md mx-auto">
                      {lang === 'ar' 
                        ? 'عارض النماذج ثلاثية الأبعاد قيد التطوير. سيتم دمج WebGL/Three.js قريباً.' 
                        : '3D Model viewer under development. WebGL/Three.js integration coming soon.'}
                    </p>

                    {/* Control hints */}
                    <div className="flex items-center justify-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
                        <ZoomIn className="h-3 w-3" />
                        <span>{lang === 'ar' ? 'تكبير' : 'Zoom'}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
                        <RotateCw className="h-3 w-3" />
                        <span>{lang === 'ar' ? 'دوران' : 'Rotate'}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
                        <Layers className="h-3 w-3" />
                        <span>{lang === 'ar' ? 'طبقات' : 'Layers'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center text-slate-500 z-10">
                <BoxSelect className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">{t.selectModel}</p>
              </div>
            )}

            {/* Viewer Controls */}
            {selectedModel && !isViewerLoading && (
              <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                <Button variant="secondary" size="icon" className="bg-slate-800/80 backdrop-blur text-white hover:bg-slate-700 border-slate-700">
                  <Layers className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" className="bg-slate-800/80 backdrop-blur text-white hover:bg-slate-700 border-slate-700">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" className="bg-slate-800/80 backdrop-blur text-white hover:bg-slate-700 border-slate-700">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Model Info Footer */}
          {selectedModel && !isViewerLoading && (
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-slate-400 text-sm shrink-0">
              <div className="flex gap-6">
                <span><strong className="text-slate-300">{t.objects}:</strong> 1,245</span>
                <span><strong className="text-slate-300">{t.materials}:</strong> 42</span>
                <span><strong className="text-slate-300">{lang === 'ar' ? 'الحجم' : 'Size'}:</strong> {selectedModel.size}</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>IFC 2x3</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
