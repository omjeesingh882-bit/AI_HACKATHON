"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Snowflake,
  Sun,
  Moon,
  Menu,
  X,
  BookOpen,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user, role, isAdmin, isStudent, logout } = useAuth();

  const links = [
    { href: "/", label: "Home" },
    { href: "/student", label: "Student Panel", icon: BookOpen, highlight: isStudent },
    { href: "/admin", label: "Admin Panel", icon: Shield, highlight: isAdmin },
    { href: "/events", label: "Events" },
    { href: "/documents", label: "Documents" },
    { href: "/chat", label: "AI Chat" },
    { href: "/search", label: "Search" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-8 mx-auto justify-between">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-[#29B5E8]/10">
              <Snowflake className="h-6 w-6 text-[#29B5E8]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg leading-tight tracking-tight">TMSL AI</span>
              <span className="text-[10px] text-muted-foreground hidden sm:inline-block leading-none">
                Knowledge Engine
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-4 text-sm font-medium">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors",
                    pathname === link.href
                      ? "text-primary font-semibold bg-muted/60"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile menu button */}
        <button
          className="inline-flex items-center justify-center rounded-md lg:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Right Side: User Profile & Actions */}
        <div className="hidden lg:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l">
              <Link
                href={isAdmin ? "/admin" : "/student"}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/40 hover:bg-muted/80 transition-colors"
              >
                <div
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                    isAdmin ? "bg-purple-600" : "bg-[#29B5E8]"
                  )}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold leading-tight">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {user.role} Portal
                  </span>
                </div>
                <Badge
                  variant={isAdmin ? "default" : "secondary"}
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    isAdmin ? "bg-purple-600 text-white" : "bg-blue-100 dark:bg-blue-950 text-[#29B5E8]"
                  )}
                >
                  {user.role.toUpperCase()}
                </Badge>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 h-8 px-2"
                title="Log out"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="text-xs h-8">
                <Link href="/login">
                  <UserIcon className="mr-1.5 h-3.5 w-3.5" /> Sign In
                </Link>
              </Button>
              <Button asChild size="sm" className="text-xs h-8 bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white">
                <Link href="/register">
                  <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Student Register
                </Link>
              </Button>
            </div>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="container lg:hidden border-b py-4 bg-background px-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === link.href ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-[#29B5E8] text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{user.role} account</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={logout} className="text-xs">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild size="sm" className="w-full bg-[#29B5E8] text-white">
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}