import React, { useState, useEffect } from 'react';
import { Language, BIMModel } from '../types';
import { fetchBIMModels } from '../lib/services';
import { TRANSLATIONS } from '../constants';
import { 
  BoxSelect, 
  Upload, 
  Eye, 
  Layers, 
  Maximize2, 
  Settings,
  Info,
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

interface BIMViewProps {
  lang: Language;
}

export default function BIMView({ lang }: BIMViewProps) {
  const t = TRANSLATIONS[lang];
  const [selectedModel, setSelectedModel] = useState<BIMModel | null>(null);
  const [models, setModels] = useState<BIMModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchBIMModels();
        const mappedModels = (data || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          version: m.version,
          uploadDate: new Date(m.created_at).toLocaleDateString(),
          size: m.metadata?.size || 'Unknown',
          url: m.file_url,
          projectId: m.project_id
        }));
        setModels(mappedModels);
        if (mappedModels.length > 0) {
          setSelectedModel(mappedModels[0]);
        }
      } catch (error) {
        console.error('Failed to load BIM models:', error);
        toast.error(lang === 'ar' ? 'فشل تحميل نماذج BIM' : 'Failed to load BIM models');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [lang]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen flex flex-col h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.bim}</h1>
          <p className="text-slate-500 mt-1">Visualize and manage 3D building models (IFC).</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2 bg-brand-600 hover:bg-brand-700">
            <Upload className="h-4 w-4" />
            {lang === 'ar' ? 'رفع نموذج' : 'Upload Model'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Sidebar List */}
        <Card className="w-1/3 flex flex-col">
          <CardHeader>
            <CardTitle>Available Models</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Ver</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow 
                    key={model.id} 
                    className={`cursor-pointer ${selectedModel?.id === model.id ? 'bg-slate-100' : ''}`}
                    onClick={() => setSelectedModel(model)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.uploadDate} • {model.size}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{model.version}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4 text-brand-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Viewer Area */}
        <Card className="flex-1 flex flex-col overflow-hidden bg-slate-900 border-slate-800">
          <div className="flex-1 relative bg-grid-slate-800/50 flex items-center justify-center">
            {selectedModel ? (
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto bg-brand-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <BoxSelect className="h-16 w-16 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Loading {selectedModel.name}...</h3>
                  <p className="text-slate-400">Initializing WebGL Context</p>
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button variant="secondary" size="icon" className="bg-slate-800 text-white hover:bg-slate-700">
                    <Layers className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="bg-slate-800 text-white hover:bg-slate-700">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="bg-slate-800 text-white hover:bg-slate-700">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <BoxSelect className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Select a model to view</p>
              </div>
            )}
          </div>
          {selectedModel && (
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-slate-400 text-sm">
              <div className="flex gap-4">
                <span><strong className="text-slate-300">Objects:</strong> 1,245</span>
                <span><strong className="text-slate-300">Materials:</strong> 42</span>
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
