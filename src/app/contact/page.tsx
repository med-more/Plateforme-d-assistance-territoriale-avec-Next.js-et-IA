"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { 
  Mail, Phone, MapPin, Send, MessageSquare, Building2, 
  Facebook, Twitter, Instagram, Linkedin 
} from "lucide-react";
import { RamadanMoonIcon, RamadanLanternIcon } from "@/components/icons/ramadan-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { contactFormSchema, type ContactFormInput } from "@/lib/validators/form-schema";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/context/theme-context";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormInput) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erreur lors de l'envoi");
      }

      toast({
        title: "Message envoyé avec succès",
        description: result.message || "Nous vous répondrons dans les plus brefs délais.",
      });
      
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error 
          ? error.message 
          : "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "contact@aura-link.ma",
      href: "mailto:contact@aura-link.ma",
    },
    {
      icon: Phone,
      label: "Téléphone",
      value: "+212 600 000 000",
      href: "tel:+212600000000",
    },
    {
      icon: MapPin,
      label: "Adresse",
      value: "Casablanca, Maroc",
      href: "#",
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <div className="min-h-screen bg-openai-dark py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Contact SVG - Top Left */}
      <div className="absolute top-0 left-0 z-10 pointer-events-none">
        <Image
          src="/contact.svg"
          alt="Contact decoration"
          width={300}
          height={400}
          className="opacity-80"
          style={{
            filter: 'drop-shadow(0 4px 20px rgba(188, 131, 42, 0.2))'
          }}
        />
      </div>
      
      {/* Contact SVG - Top Right */}
      <div className="absolute top-0 right-0 z-10 pointer-events-none">
        <Image
          src="/contact.svg"
          alt="Contact decoration"
          width={300}
          height={400}
          className="opacity-80 transform scale-x-[-1]"
          style={{
            filter: 'drop-shadow(0 4px 20px rgba(188, 131, 42, 0.2))'
          }}
        />
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-20">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
            <div className="relative">
              <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-openai-green" />
              <RamadanMoonIcon className="absolute -top-1 -right-1 w-4 h-4 text-openai-green/60 animate-pulse" />
            </div>
          </div>
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-openai-text mb-3 sm:mb-4" 
            style={{ fontFamily: 'var(--font-amiri), serif' }}
          >
            اتصل بنا
          </h1>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-openai-text-muted mb-4 sm:mb-6">
            Contactez-nous
          </h2>
          <p className="text-base sm:text-lg text-openai-text-muted max-w-2xl mx-auto">
            Nous sommes là pour vous aider. N'hésitez pas à nous contacter pour toute question ou demande d'assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {/* Contact Information Sidebar */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            {/* Contact Info Cards */}
            <div className="bg-openai-darker border border-openai-gray/30 rounded-lg p-6 sm:p-8">
              <h3 
                className="text-xl sm:text-2xl font-bold text-openai-text mb-4 sm:mb-6" 
                style={{ fontFamily: 'var(--font-amiri), serif' }}
              >
                معلومات الاتصال
              </h3>
              <h4 className="text-lg sm:text-xl font-semibold text-openai-text-muted mb-6">
                Informations de Contact
              </h4>
              <div className="space-y-4 sm:space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <a
                      key={index}
                      href={info.href}
                      className="flex items-start gap-4 p-4 bg-openai-dark rounded-lg border border-openai-gray/20 hover:border-openai-green/50 transition-all duration-200 group"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-openai-green/10 flex items-center justify-center group-hover:bg-openai-green/20 transition-colors">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-openai-green" />
                        </div>
                        <RamadanLanternIcon className="absolute -top-1 -right-1 w-3 h-3 text-openai-green/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-openai-text-muted mb-1">
                          {info.label}
                        </p>
                        <p className="text-sm sm:text-base text-openai-text font-medium break-words">
                          {info.value}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-openai-darker border border-openai-gray/30 rounded-lg p-6 sm:p-8">
              <h3 
                className="text-lg sm:text-xl font-bold text-openai-text mb-4" 
                style={{ fontFamily: 'var(--font-amiri), serif' }}
              >
                تواصل معنا
              </h3>
              <h4 className="text-base sm:text-lg font-semibold text-openai-text-muted mb-6">
                Suivez-nous
              </h4>
              <div className="flex items-center justify-start gap-3 sm:gap-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-openai-green/10 border border-openai-green/20 text-openai-green hover:bg-openai-green/20 hover:border-openai-green/40 transition-all duration-200"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-openai-darker border border-openai-gray/30 rounded-lg p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-openai-green" />
                <h3 className="text-base sm:text-lg font-semibold text-openai-text">
                  Heures d'ouverture
                </h3>
              </div>
              <div className="space-y-2 text-sm text-openai-text-muted">
                <p>Lundi - Vendredi: 9h00 - 18h00</p>
                <p>Samedi: 9h00 - 13h00</p>
                <p>Dimanche: Fermé</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-openai-darker border border-openai-gray/30 rounded-lg p-6 sm:p-8 lg:p-10">
              <div className="mb-6 sm:mb-8">
                <h3 
                  className="text-2xl sm:text-3xl font-bold text-openai-text mb-2" 
                  style={{ fontFamily: 'var(--font-amiri), serif' }}
                >
                  أرسل رسالة
                </h3>
                <h4 className="text-xl sm:text-2xl font-semibold text-openai-text-muted mb-3">
                  Envoyez-nous un message
                </h4>
                <p className="text-sm sm:text-base text-openai-text-muted">
                  Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={theme === "light" ? "text-openai-green" : ""}>
                            Nom complet
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Votre nom"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={theme === "light" ? "text-openai-green" : ""}>
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="votre@email.com"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={theme === "light" ? "text-openai-green" : ""}>
                          Sujet
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Sujet de votre message"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={theme === "light" ? "text-openai-green" : ""}>
                          Message
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Votre message..."
                            className="min-h-[180px] sm:min-h-[200px]"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription className={theme === "light" ? "text-openai-green" : ""}>
                          Minimum 10 caractères, maximum 2000 caractères
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-openai-green text-white hover:bg-openai-green-hover transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
