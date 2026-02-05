"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { 
  Users, Sparkles, FileText, MessageSquare, Upload, ArrowRight, Target, Coins, Building2, Twitter, Facebook, Instagram, Youtube
} from "lucide-react";
import { RamadanStarIcon, RamadanLanternIcon, DonationHandIcon } from "@/components/icons/ramadan-icon";
import { LottieAnimation } from "@/components/animations/lottie-animation";
import mosqueAnimation from "@/assets/Mosque Animation.json";

// Professional, relaxing, and smooth animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 1.2, 
      ease: [0.25, 0.1, 0.25, 1] // Custom cubic-bezier for smooth easing
    } 
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      duration: 1.5, 
      ease: [0.25, 0.1, 0.25, 1]
    } 
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 1.4, 
      ease: [0.25, 0.1, 0.25, 1]
    } 
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 1.4, 
      ease: [0.25, 0.1, 0.25, 1]
    } 
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 1.6, 
      ease: [0.25, 0.1, 0.25, 1]
    } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

// Animated Section Component
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  useEffect(() => {
    // Handle hash navigation when page loads - only on client side
    if (typeof window === "undefined") return;
    
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        // Wait for page to be fully rendered
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    };

    handleHashScroll();
    // Also handle hash changes
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-openai-dark">
      {/* Hero Section - Modern Professional Design */}
      <section className="relative h-screen flex flex-col overflow-hidden bg-openai-dark">
        {/* Subtle gradient overlay - matching dashboard style */}
        <div className="absolute inset-0 bg-gradient-to-br from-openai-green/5 via-transparent to-openai-green/3 pointer-events-none z-0" />
        
        {/* Background pattern - subtle geometric shapes */}
        <div className="absolute inset-0 opacity-5 z-0">
          <div className="absolute top-16 left-8 w-56 h-56 rounded-full bg-openai-green blur-3xl" />
          <div className="absolute bottom-32 right-16 w-72 h-72 rounded-full bg-openai-green blur-3xl" />
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 flex-1 flex items-center px-4 sm:px-6 lg:px-8 xl:px-12 pt-8 sm:pt-10 pb-12">
          <div className="container mx-auto max-w-7xl h-full flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-center w-full">
              
              {/* Left Side - Text Content */}
              <motion.div 
                className="space-y-2 sm:space-y-3 text-center lg:text-left"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Arabic Title */}
                <motion.h1 
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-openai-text leading-tight"
                  style={{ 
                    fontFamily: 'var(--font-amiri), serif',
                    letterSpacing: '0.02em'
                  }}
                  variants={fadeInUp}
                >
                  رمضان كريم
                </motion.h1>
                
                {/* English Title */}
                <motion.h2 
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-openai-text-muted leading-tight"
                  variants={fadeInUp}
                >
                  Happy Ramadan Kareem
                </motion.h2>
                
                {/* Subtitle */}
                <motion.p 
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-openai-text-muted leading-relaxed max-w-2xl mx-auto lg:mx-0"
                  variants={fadeInUp}
                >
                  Plateforme d'Entraide Citoyenne Intelligente pour les associations caritatives de Casablanca
                </motion.p>
                
                {/* Feature Badges */}
                <motion.div 
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 pt-1"
                  variants={staggerContainer}
                >
                  {[
                    { icon: Sparkles, text: "IA Assistante" },
                    { icon: Users, text: "Gestion Familles" },
                    { icon: FileText, text: "Documents Indexés" }
                  ].map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={index}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-openai-darker/50 border border-openai-gray/30 hover:border-openai-green/50 transition-all duration-300"
                        variants={fadeInUp}
                        whileHover={{ 
                          scale: 1.02,
                          y: -2,
                          transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
                        }}
                      >
                        <Icon className="w-3 h-3 text-openai-green" />
                        <span className="text-[10px] font-medium text-openai-text-muted">
                          {feature.text}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
                
                {/* CTA Button */}
                <motion.div 
                  className="pt-1"
                  variants={fadeInUp}
                >
                  <Link href="/dashboard">
                    <motion.div
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-openai-green text-white font-semibold text-xs sm:text-sm rounded-lg shadow-lg"
                      whileHover={{ 
                        scale: 1.02,
                        y: -2,
                        boxShadow: "0 8px 20px rgba(188, 131, 42, 0.25)",
                        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                      }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <span>Accéder au Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right Side - Mosque Animation */}
              <motion.div 
                className="relative flex items-center justify-center lg:justify-end h-full"
                variants={scaleIn}
                initial="hidden"
                animate="visible"
              >
                <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl h-full flex items-center">
                  {/* Decorative gradient circle behind animation */}
                  <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full bg-gradient-to-br from-openai-green/10 to-transparent blur-3xl" />
                  </div>
                  
                  {/* Mosque Animation */}
                  <div className="relative w-full h-full max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] flex items-center">
                    <LottieAnimation 
                      animationData={mosqueAnimation}
                      className="w-full h-full drop-shadow-2xl"
                      loop={true}
                      autoplay={true}
                      speed={1}
                    />
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-openai-green/5 blur-2xl" />
                  <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-openai-green/5 blur-3xl" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Social Media Icons - Right Side, positioned in viewport */}
        <motion.div 
          className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 lg:right-6 z-20 flex flex-col gap-2"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {[
            { name: 'Twitter', Icon: Twitter, href: '#', color: 'bg-sky-500/90 hover:bg-sky-600' },
            { name: 'Facebook', Icon: Facebook, href: '#', color: 'bg-blue-600/90 hover:bg-blue-700' },
            { name: 'Instagram', Icon: Instagram, href: '#', color: 'bg-pink-600/90 hover:bg-pink-700' },
            { name: 'YouTube', Icon: Youtube, href: '#', color: 'bg-red-600/90 hover:bg-red-700' },
          ].map((social, index) => {
            const Icon = social.Icon;
            return (
              <motion.a
                key={index}
                href={social.href}
                className={`w-8 h-8 sm:w-9 sm:h-9 ${social.color} rounded-full flex items-center justify-center text-white shadow-lg backdrop-blur-sm`}
                aria-label={social.name}
                variants={fadeIn}
                whileHover={{ 
                  scale: 1.08,
                  y: -3,
                  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.a>
            );
          })}
        </motion.div>
      </section>

      {/* Main Content Section - Welcome */}
      <section id="about" className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-openai-dark">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Image */}
            <AnimatedSection>
              <motion.div 
                className="relative"
                variants={slideInLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <motion.div 
                  className="relative rounded-2xl overflow-hidden border-4 border-openai-dark shadow-2xl"
                  whileHover={{ 
                    scale: 1.01,
                    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
                  }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div 
                    className="aspect-[4/5] bg-cover bg-center"
                    style={{
                      backgroundImage: "url('/1.png')"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-openai-dark/60 to-transparent" />
                </motion.div>
              </motion.div>
            </AnimatedSection>

            {/* Right Side - Welcome Content */}
            <AnimatedSection>
              <motion.div 
                className="space-y-6 sm:space-y-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-openai-text mb-4" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                  مرحبا بكم في أورا-لينك
                </h2>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-openai-text-muted mb-6">
                  Welcome to Aura-Link
                </h2>
                <p className="text-base sm:text-lg text-openai-text-muted leading-relaxed mb-6">
                  Plateforme d'Entraide Citoyenne Intelligente dédiée aux associations caritatives de Casablanca. 
                  Notre mission est de faciliter la gestion des dons, la coordination des distributions et 
                  l'assistance aux familles nécessiteuses pendant le Ramadan et tout au long de l'année.
                </p>
                <p className="text-sm sm:text-base text-openai-text-muted/80 leading-relaxed" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                  منصة التضامن الذكية المخصصة للجمعيات الخيرية في الدار البيضاء. مهمتنا هي تسهيل إدارة التبرعات 
                  وتنسيق التوزيعات ومساعدة الأسر المحتاجة خلال رمضان وعلى مدار السنة.
                </p>
              </div>

              {/* Services Grid */}
              <motion.div 
                className="grid grid-cols-2 gap-4 sm:gap-6 pt-6"
                variants={staggerContainer}
              >
                {[
                  { icon: DonationHandIcon, title: "Zakat & Sadaqa", titleAr: "الزكاة والصدقة", desc: "Gestion des dons" },
                  { icon: Users, title: "Familles Nécessiteuses", titleAr: "الأسر المحتاجة", desc: "Suivi des bénéficiaires" },
                  { icon: RamadanLanternIcon, title: "Ramadan Activities", titleAr: "أنشطة رمضان", desc: "Distributions Quffat" },
                  { icon: Sparkles, title: "IA Assistante", titleAr: "المساعد الذكي", desc: "Support intelligent" }
                ].map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <motion.div
                      key={index}
                      className="p-4 sm:p-6 bg-openai-darker/50 border border-openai-gray/30 rounded-xl hover:border-openai-green/50 transition-all duration-300"
                      variants={fadeInUp}
                      whileHover={{ 
                        scale: 1.02,
                        y: -3,
                        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                      }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-openai-green/10 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-openai-green" />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-openai-text mb-1" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                        {service.titleAr}
                      </h3>
                      <h3 className="text-xs sm:text-sm font-medium text-openai-text-muted mb-2">
                        {service.title}
                      </h3>
                      <p className="text-xs text-openai-text-muted/70">
                        {service.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* About Section - Our Mission */}
      <section id="services" className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-openai-dark">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-6 order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-openai-text" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                مهمتنا
              </h2>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-openai-text-muted mb-4">
                Notre Mission
              </h2>
              <p className="text-base sm:text-lg text-openai-text-muted leading-relaxed">
                Notre plateforme utilise l'intelligence artificielle pour optimiser la gestion des opérations caritatives. 
                Nous aidons les associations à mieux coordonner les distributions de Quffat Ramadan, suivre les familles nécessiteuses 
                par quartier, et gérer efficacement les dons de Zakat et Sadaqa grâce à notre assistant IA.
              </p>
              <p className="text-sm sm:text-base text-openai-text-muted/80 leading-relaxed" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                تستخدم منصتنا الذكاء الاصطناعي لتحسين إدارة العمليات الخيرية. نساعد الجمعيات على تنسيق توزيع قفة رمضان بشكل أفضل، 
                ومتابعة الأسر المحتاجة حسب الحي، وإدارة التبرعات من الزكاة والصدقة بكفاءة من خلال مساعدنا الذكي.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-openai-green text-openai-text font-semibold rounded-lg hover:bg-openai-green-hover transition-colors"
              >
                <span>Accéder au Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right Side - Image */}
            <div className="relative order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div 
                  className="aspect-[3/4] bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/2.png')"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-openai-dark/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Responsive */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-openai-dark">
        <div className="relative z-10 container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-openai-text mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-amiri), serif' }}>
              كيف يعمل
            </h2>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-openai-text-muted mb-6 sm:mb-8 lg:mb-12">
              Comment ça fonctionne
            </h2>
            <p className="text-base sm:text-lg text-openai-text-muted max-w-2xl mx-auto px-4">
              En trois étapes simples, transformez votre gestion caritative
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {[
              { 
                number: "01", 
                icon: Upload, 
                titleAr: "استيراد المستندات", 
                title: "Importez vos documents", 
                desc: "Téléchargez vos listes de familles, inventaires et guides de Zakat",
                decorationIcon: RamadanStarIcon
              },
              { 
                number: "02", 
                icon: FileText, 
                titleAr: "الفهرسة التلقائية", 
                title: "Indexation automatique", 
                desc: "Vos documents sont automatiquement indexés dans la base de connaissances",
                decorationIcon: RamadanLanternIcon
              },
              { 
                number: "03", 
                icon: MessageSquare, 
                titleAr: "اطرح أسئلتك", 
                title: "Posez vos questions", 
                desc: "L'Assistant Sadaqa répond instantanément en utilisant vos données",
                decorationIcon: RamadanStarIcon
              }
            ].map((step, index) => {
              const Icon = step.icon;
              const DecorationIcon = step.decorationIcon;
              return (
                <div key={index} className="relative group text-center">
                  
                  <div className="relative p-6 sm:p-8 bg-openai-dark border border-openai-gray/30 rounded-2xl hover:border-openai-green/50 transition-all duration-300">
                    {/* Step Number */}
                    <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-openai-green text-white font-bold text-base sm:text-lg flex items-center justify-center shadow-lg">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-openai-green/10 border border-openai-green/20 flex items-center justify-center mx-auto mb-4 sm:mb-6 transition-transform duration-500 ease-[0.25,0.1,0.25,1] group-hover:scale-105">
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-openai-green" />
                      {DecorationIcon && (
                        <div className="absolute -top-2 -right-2 animate-pulse">
                          <DecorationIcon className="w-4 h-4 text-openai-green/50" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-lg sm:text-xl font-bold text-openai-text mb-1.5 sm:mb-2" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                      {step.titleAr}
                    </h3>
                    <h3 className="text-base sm:text-lg font-semibold text-openai-text-muted mb-3 sm:mb-4">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-openai-text-muted leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="contact" className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-openai-dark">
        <div className="container mx-auto max-w-4xl">
          {/* SVG Frame Container */}
          <div className="relative min-h-[400px] sm:min-h-[500px] flex items-center justify-center">
            {/* SVG Frame as background */}
            <div className="absolute inset-0 w-full h-full">
              <Image
                src="/frame.svg"
                alt="Frame decoration"
                fill
                className="object-contain"
                style={{ 
                  filter: 'drop-shadow(0 4px 20px rgba(188, 131, 42, 0.2))',
                  opacity: 0.9
                }}
              />
            </div>
            
            {/* Content inside frame */}
            <div className="relative z-10 text-center space-y-6 sm:space-y-8 py-8 sm:py-12 px-6 sm:px-8 md:px-12 w-full pt-24 sm:pt-32 md:pt-40">
              {/* Mission Statement */}
              <div className="space-y-4">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-openai-text leading-relaxed" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                  التضامن والمساعدة للجمعيات الخيرية
                </p>
                <p className="text-lg sm:text-xl text-openai-text-muted leading-relaxed max-w-3xl mx-auto">
                  Solidarité et assistance pour les associations caritatives de Casablanca
                </p>
              </div>

              {/* Footer Links */}
              <div className="pt-8 border-t border-openai-gray/30">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm text-openai-text-muted">
                  <Link href="/dashboard" className="hover:text-openai-text transition-colors">
                    Dashboard
                  </Link>
                  <Link href="#about" className="hover:text-openai-text transition-colors">
                    À propos
                  </Link>
                  <Link href="#services" className="hover:text-openai-text transition-colors">
                    Services
                  </Link>
                  <Link href="#contact" className="hover:text-openai-text transition-colors">
                    Contact
                  </Link>
                </div>
                <p className="mt-6 text-xs text-openai-text-muted/60">
                  © 2026 Aura-Link - Plateforme d'Entraide Citoyenne Intelligente. Tous droits réservés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
