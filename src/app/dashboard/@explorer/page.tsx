"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, FileText, Users, MapPin, Calendar, FolderOpen, Database, Network } from "lucide-react";
import { RamadanLanternIcon } from "@/components/icons/ramadan-icon";
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
                  const familiesData: FamilyData[] = result.extractedFamilies.map((family, index) => ({
                    id: `${data.file.name}-${index}-${Date.now()}`,
                    name: family.name,
                    district: family.district,
                    members: family.members,
                    needs: family.needs,
                    priority: family.priority,
                  }));
                  setFamilies(familiesData);
                } else {
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
    <div className="space-y-4 h-full overflow-y-auto">
      <div className="bg-openai-darker border border-openai-gray/30 rounded-lg p-4 sm:p-6 relative">
        <h2 className="text-base sm:text-lg font-semibold text-openai-text mb-1.5 sm:mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-amiri), serif' }}>
          <div className="relative">
            <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-openai-green" />
            <RamadanLanternIcon className="absolute -top-1 -right-1 w-2.5 h-2.5 text-openai-green/60" />
          </div>
          استيراد المستندات
        </h2>
        <h3 className="text-sm sm:text-base font-medium text-openai-text-muted mb-4 sm:mb-6">
          Import de Documents
        </h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className={theme === "light" ? "text-openai-green" : ""}>Document (PDF ou TXT)</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept=".pdf,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormDescription className={theme === "light" ? "text-openai-green" : ""}>
                    Téléchargez des listes de familles, inventaires ou guides de Zakat.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              disabled={isProcessing} 
              className="w-full bg-openai-green text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isProcessing ? "Traitement en cours..." : "Traiter le Document"}
            </Button>
          </form>
        </Form>
      </div>

      {mounted && activeDocument && (
        <div className="bg-openai-darker border border-openai-gray/30 rounded-lg p-4">
          <p className="text-sm text-openai-text-muted">
            Document actif: <span className="text-openai-green font-medium">{activeDocument}</span>
          </p>
        </div>
      )}

      {mounted && families.length > 0 && (
        <div className="bg-openai-darker border border-openai-gray/30 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-openai-text mb-3 sm:mb-4 flex items-center gap-2">
            <div className="relative">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-openai-green" />
              <Network className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 text-openai-green/60" />
            </div>
            Familles Nécessiteuses ({families.length})
          </h3>
          <div className="space-y-3">
            {families.map((family) => (
              <div
                key={family.id}
                className="p-3 sm:p-4 bg-openai-dark rounded-lg border border-openai-gray/30 hover:border-openai-gray/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-openai-text">{family.name}</h4>
                  <span
                    className={
                      family.priority === "high"
                        ? "px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400"
                        : family.priority === "medium"
                        ? "px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400"
                        : "px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400"
                    }
                  >
                    {family.priority === "high"
                      ? "Priorité Haute"
                      : family.priority === "medium"
                      ? "Priorité Moyenne"
                      : "Priorité Basse"}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-openai-text-muted">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-openai-green/70" />
                      <RamadanStarIcon className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 text-openai-green/40" />
                    </div>
                    <span>{family.district}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-openai-green/70" />
                    <span>{family.members} membres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-openai-green/70" />
                    <span>Besoins: {family.needs.join(", ")}</span>
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
