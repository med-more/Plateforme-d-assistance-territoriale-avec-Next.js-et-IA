"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, MessageSquare, Menu, Sun, Moon, X, Mail } from "lucide-react";
import { RamadanMoonIcon } from "@/components/icons/ramadan-icon";
import { useTheme } from "@/components/context/theme-context";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    // Get initial hash
    if (typeof window !== "undefined") {
      setCurrentHash(window.location.hash);
    }
  }, []);

  useEffect(() => {
    // Update hash when it changes
    const handleHashChange = () => {
      if (typeof window !== "undefined") {
        setCurrentHash(window.location.hash);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    }
  }, []);

  const navItems = [
    {
      href: "/",
      label: "Accueil",
      labelAr: "الرئيسية",
      icon: Home,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      labelAr: "لوحة التحكم",
      icon: MessageSquare,
    },
    {
      href: "/contact",
      label: "Contact",
      labelAr: "اتصل بنا",
      icon: Mail,
    },
  ];

  const allNavItems = [
    ...navItems,
    {
      href: "/#about",
      label: "À propos",
      labelAr: "من نحن",
      icon: Home,
    },
    {
      href: "/#services",
      label: "Services",
      labelAr: "الخدمات",
      icon: Home,
    },
    {
      href: "/#contact",
      label: "Contact",
      labelAr: "اتصل بنا",
      icon: Home,
    },
  ];

  const isActive = (href: string) => {
    // Only check hash on client side after mount to avoid hydration mismatch
    if (!mounted) {
      // During SSR, only check pathname
      if (href === "/") {
        return pathname === "/";
      }
      if (href.startsWith("/#") || href.startsWith("#")) {
        return false;
      }
      return pathname?.startsWith(href);
    }

    if (href === "/") {
      // Home is active only if we're on home and no hash
      return pathname === "/" && (!currentHash || currentHash === "");
    }
    if (href.startsWith("/#")) {
      // For hash links, check if we're on home page and hash matches
      if (pathname === "/") {
        const hash = href.split("#")[1];
        return currentHash === `#${hash}`;
      }
      return false;
    }
    if (href.startsWith("#")) {
      // Legacy hash links
      if (pathname === "/") {
        return currentHash === href;
      }
      return false;
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-openai-dark/95 backdrop-blur-sm border-b border-openai-gray/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 sm:gap-3 relative group transition-transform hover:scale-105"
          >
            <div className="relative">
              <Image 
                src="/logoR.svg" 
                alt="Aura-Link Logo" 
                width={56}
                height={56}
                className="relative z-10 sm:w-16 sm:h-16 md:w-20 md:h-20 transition-transform group-hover:rotate-3"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-openai-text leading-tight">
                Aura-Link
              </span>
              <span 
                className="text-xs text-openai-text-muted leading-tight" 
                style={{ fontFamily: 'var(--font-amiri), serif' }}
              >
                أورا-لينك
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              // Use simplified logic during SSR to avoid hydration mismatch
              const active = mounted ? isActive(item.href) : (
                item.href === "/" ? pathname === "/" : 
                item.href.startsWith("/#") || item.href.startsWith("#") ? false :
                pathname?.startsWith(item.href)
              );
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 relative rounded-md",
                    active
                      ? "text-openai-green bg-openai-green/10"
                      : "text-openai-text-muted hover:text-openai-text hover:bg-openai-gray/20"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {mounted && active && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-openai-green rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-openai-text-muted hover:text-openai-text hover:bg-openai-gray/20 transition-all duration-200 border border-transparent hover:border-openai-gray/30"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg text-openai-text hover:bg-openai-gray/20 transition-all duration-200 border border-transparent hover:border-openai-gray/30"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mounted && mobileMenuOpen && (
          <div className="md:hidden border-t border-openai-gray/30 py-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const active = mounted ? isActive(item.href) : (item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href));
                
                const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                  setMobileMenuOpen(false);
                  if (item.href.startsWith("/#")) {
                    e.preventDefault();
                    const hash = item.href.split("#")[1];
                    if (pathname === "/") {
                      // Already on home page, just scroll
                      setTimeout(() => {
                        const element = document.getElementById(hash);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }, 100);
                    } else {
                      // Navigate to home page first, then scroll
                      window.location.href = `/#${hash}`;
                    }
                  }
                };
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleClick}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg",
                      active
                        ? "text-openai-green bg-openai-green/10 border-l-2 border-openai-green"
                        : "text-openai-text-muted hover:text-openai-text hover:bg-openai-gray/20"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex flex-col">
                      <span>{item.label}</span>
                      <span 
                        className="text-xs opacity-70" 
                        style={{ fontFamily: 'var(--font-amiri), serif' }}
                      >
                        {item.labelAr}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
