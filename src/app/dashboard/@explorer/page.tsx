"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Upload, FileText, Users, MapPin, Calendar, FolderOpen, Database, Network, TrendingUp, AlertCircle, CheckCircle2, BarChart3 } from "lucide-react";
import { RamadanLanternIcon, RamadanStarIcon } from "@/components/icons/ramadan-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  documentUploadSchema,
  type DocumentUploadInput,
} from "@/lib/validators/form-schema";
import { useSadaqa } from "@/components/context/sadaqa-context";
import { vectorAction, type ExtractedFamily } from "@/actions/vector-action";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/context/theme-context";

interface FamilyData {
  id: string;
  name: string;
  district: string;
  members: number;
  needs: string[];
  priority: "high" | "medium" | "low";
}

export default function ExplorerPage() {
  const [families, setFamilies] = useState<FamilyData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { activeDocument, setActiveDocument } = useSadaqa();
  const { toast } = useToast();
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<DocumentUploadInput>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      file: undefined,
    },
  });

  // Calculate statistics from families
  const stats = {
    totalFamilies: families.length,
    totalMembers: families.reduce((sum, f) => sum + f.members, 0),
    totalNeeds: families.reduce((sum, f) => sum + f.needs.length, 0),
    byPriority: {
      high: families.filter(f => f.priority === "high").length,
      medium: families.filter(f => f.priority === "medium").length,
      low: families.filter(f => f.priority === "low").length,
    },
    needsCount: families.reduce((acc, family) => {
      family.needs.forEach(need => {
        acc[need] = (acc[need] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
    topNeeds: Object.entries(
      families.reduce((acc, family) => {
        family.needs.forEach(need => {
          acc[need] = (acc[need] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>)
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([need, count]) => ({ need, count })),
  };

  const onSubmit = async (data: DocumentUploadInput) => {
    setIsProcessing(true);
    setActiveDocument(data.file.name);

    try {
      const formData = new FormData();
      formData.append("file", data.file);

      const result = await vectorAction(formData);

              if (result.success) {
                toast({
                  title: "Document traité avec succès",
                  description: result.message || `Le document "${data.file.name}" a été indexé dans la base de connaissances.`,
                });

                // Afficher les familles extraites si disponibles
                if (result.extractedFamilies && result.extractedFamilies.length > 0) {
                  console.log("Familles extraites:", result.extractedFamilies);
                  // Utiliser un ID basé sur le nom du fichier et l'index pour éviter les problèmes d'hydratation
                  // Ne pas utiliser Date.now() ou Math.random() qui changent entre serveur et client
                  const familiesData: FamilyData[] = result.extractedFamilies.map((family, index) => ({
                    id: `family-${data.file.name.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`,
                    name: family.name,
                    district: family.district,
                    members: family.members,
                    needs: family.needs,
                    priority: family.priority,
                  }));
                  console.log("Familles mappées:", familiesData);
                  setFamilies(familiesData);
                } else {
                  console.log("Aucune famille extraite du document");
                  // Si aucune famille n'a été extraite, réinitialiser la liste
                  setFamilies([]);
                }
              } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur s'est produite lors du traitement.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing document:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du traitement du document.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      form.reset();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 h-full overflow-y-auto px-2 sm:px-4 md:px-6 pb-20 lg:pb-0 w-full" style={{ paddingBottom: 'max(5rem, calc(env(safe-area-inset-bottom) + 5rem))' }}>
      {/* Upload Card */}
      <div className="bg-openai-darker/50 backdrop-blur-sm border border-openai-gray/30 rounded-xl p-5 sm:p-7 relative shadow-xl overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-openai-green/5 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-openai-green/20 to-openai-green/5 flex items-center justify-center ring-2 ring-openai-green/10">
              <FolderOpen className="w-6 h-6 text-openai-green" />
              <RamadanLanternIcon className="absolute -top-1 -right-1 w-3 h-3 text-openai-green/60" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-openai-text" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                استيراد المستندات
              </h2>
              <h3 className="text-sm sm:text-base font-medium text-openai-text-muted">
                Import de Documents
              </h3>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="file"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel className={`text-sm font-semibold ${theme === "light" ? "text-openai-green" : "text-openai-text"}`}>
                      Document (PDF, TXT ou Excel)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...fieldProps}
                          type="file"
                          accept=".pdf,.txt,.xlsx,.xls"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onChange(file);
                            }
                          }}
                          disabled={isProcessing}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-openai-green/10 file:text-openai-green hover:file:bg-openai-green/20 cursor-pointer border-openai-gray/50 focus:border-openai-green/50 rounded-xl"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className={`text-xs ${theme === "light" ? "text-openai-green" : "text-openai-text-muted"}`}>
                      Téléchargez des listes de familles, inventaires ou guides de Zakat (PDF, TXT, XLSX, XLS).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={isProcessing} 
                className="w-full bg-gradient-to-r from-openai-green to-openai-green-hover text-white hover:from-openai-green-hover hover:to-openai-green transition-all shadow-lg rounded-xl py-6 text-base font-semibold"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Traiter le Document
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* Active Document Card */}
      {mounted && activeDocument && (
        <div className="bg-openai-darker/50 backdrop-blur-sm border border-openai-gray/30 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-openai-green/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-openai-green" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-openai-text-muted uppercase tracking-wide mb-1">
                Document actif
              </p>
              <p className="text-sm font-semibold text-openai-green truncate">
                {activeDocument}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Section */}
      {families.length > 0 && (
        <motion.div 
          className="bg-openai-darker/50 backdrop-blur-sm border border-openai-gray/30 rounded-xl p-5 sm:p-7 shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 1,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-openai-green/20 to-openai-green/5 flex items-center justify-center ring-2 ring-openai-green/10">
              <BarChart3 className="w-6 h-6 text-openai-green" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-openai-text" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                الإحصائيات
              </h3>
              <p className="text-sm text-openai-text-muted">Statistiques</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Families */}
            <motion.div 
              className="bg-openai-dark rounded-xl p-4 border border-openai-gray/20 hover:border-openai-green/30 transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.1, 
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              whileHover={{ 
                y: -3,
                transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-openai-green/70" />
                <span className="text-2xl font-bold text-openai-text">{stats.totalFamilies}</span>
              </div>
              <p className="text-xs text-openai-text-muted">Familles</p>
            </motion.div>

            {/* Total Members */}
            <motion.div 
              className="bg-openai-dark rounded-xl p-4 border border-openai-gray/20 hover:border-openai-green/30 transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.2, 
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              whileHover={{ 
                y: -3,
                transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-400/70" />
                <span className="text-2xl font-bold text-openai-text">{stats.totalMembers}</span>
              </div>
              <p className="text-xs text-openai-text-muted">Membres</p>
            </motion.div>

            {/* Total Needs */}
            <motion.div 
              className="bg-openai-dark rounded-xl p-4 border border-openai-gray/20 hover:border-openai-green/30 transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.3, 
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              whileHover={{ 
                y: -3,
                transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-400/70" />
                <span className="text-2xl font-bold text-openai-text">{stats.totalNeeds}</span>
              </div>
              <p className="text-xs text-openai-text-muted">Besoins</p>
            </motion.div>

            {/* Average Members */}
            <motion.div 
              className="bg-openai-dark rounded-xl p-4 border border-openai-gray/20 hover:border-openai-green/30 transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.4, 
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              whileHover={{ 
                y: -3,
                transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400/70" />
                <span className="text-2xl font-bold text-openai-text">
                  {stats.totalFamilies > 0 ? Math.round(stats.totalMembers / stats.totalFamilies) : 0}
                </span>
              </div>
              <p className="text-xs text-openai-text-muted">Moy. membres</p>
            </motion.div>
          </div>

          {/* Priority Distribution */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.5, 
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          >
            <h4 className="text-sm font-semibold text-openai-text-muted mb-3 uppercase tracking-wide">Répartition par Priorité</h4>
            <div className="grid grid-cols-3 gap-3">
              <motion.div 
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center"
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="text-2xl font-bold text-red-400 mb-1">{stats.byPriority.high}</div>
                <div className="text-xs font-medium text-red-400/80">Haute</div>
              </motion.div>
              <motion.div 
                className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center"
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.byPriority.medium}</div>
                <div className="text-xs font-medium text-yellow-400/80">Moyenne</div>
              </motion.div>
              <motion.div 
                className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center"
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="text-2xl font-bold text-green-400 mb-1">{stats.byPriority.low}</div>
                <div className="text-xs font-medium text-green-400/80">Basse</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Top Needs */}
          {stats.topNeeds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.6, 
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            >
              <h4 className="text-sm font-semibold text-openai-text-muted mb-3 uppercase tracking-wide">Besoins les Plus Fréquents</h4>
              <div className="flex flex-wrap gap-2">
                {stats.topNeeds.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-openai-dark rounded-lg border border-openai-gray/20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.2 }}
                    whileHover={{ scale: 1.05, borderColor: "rgba(188, 131, 42, 0.5)" }}
                  >
                    <span className="text-xs font-semibold text-openai-green">{item.count}</span>
                    <span className="text-xs text-openai-text-muted">{item.need}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Families List */}
      {families.length > 0 && (
        <div className="bg-openai-darker/50 backdrop-blur-sm border border-openai-gray/30 rounded-xl p-5 sm:p-7 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-openai-green/20 to-openai-green/5 flex items-center justify-center ring-2 ring-openai-green/10">
                <Users className="w-6 h-6 text-openai-green" />
                <Network className="absolute -top-0.5 -right-0.5 w-3 h-3 text-openai-green/60" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-openai-text" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                  الأسر المحتاجة
                </h3>
                <p className="text-sm text-openai-text-muted">
                  Familles Nécessiteuses
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-openai-green/10 rounded-lg border border-openai-green/20">
              <span className="text-sm font-semibold text-openai-green">{families.length}</span>
            </div>
          </div>

          {/* Families Grid */}
          <div className="grid grid-cols-1 gap-4">
            {families.map((family) => (
              <div
                key={family.id}
                className="group p-5 bg-openai-dark rounded-xl border border-openai-gray/30 hover:border-openai-green/30 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-base sm:text-lg text-openai-text truncate">
                        {family.name}
                      </h4>
                      {/* Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap flex items-center gap-1 ${
                          family.priority === "high"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : family.priority === "medium"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-green-500/20 text-green-400 border border-green-500/30"
                        }`}
                      >
                        {family.priority === "high" && <AlertCircle className="w-2.5 h-2.5" />}
                        {family.priority === "medium" && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {family.priority === "low" && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {family.priority === "high"
                          ? "Urgent"
                          : family.priority === "medium"
                          ? "Moyenne"
                          : "Normale"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-openai-text-muted">
                      <MapPin className="w-3.5 h-3.5 text-openai-green/70 flex-shrink-0" />
                      <span className="truncate">{family.district}</span>
                    </div>
                  </div>
                  {/* Priority Tag */}
                  <div className="flex flex-col items-end gap-1 ml-3">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                        family.priority === "high"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : family.priority === "medium"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-green-500/20 text-green-400 border border-green-500/30"
                      }`}
                    >
                      {family.priority === "high"
                        ? "Priorité Haute"
                        : family.priority === "medium"
                        ? "Priorité Moyenne"
                        : "Priorité Basse"}
                    </span>
                    <span className="text-[10px] text-openai-text-muted/60">
                      {family.needs.length} besoin{family.needs.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 text-openai-text-muted">
                      <Users className="w-4 h-4 text-openai-green/70" />
                      <span className="font-medium">{family.members}</span>
                      <span className="text-openai-text-muted/70">membres</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-openai-gray/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-openai-green/70" />
                      <span className="text-xs font-semibold text-openai-text-muted uppercase tracking-wide">Besoins</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {family.needs.map((need, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs font-medium bg-openai-green/10 text-openai-green rounded-md border border-openai-green/20"
                        >
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
