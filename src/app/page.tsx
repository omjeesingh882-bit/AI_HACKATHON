"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  MessageSquare, Search, FileText, Calendar, 
  BarChart3, Database, Cpu, Upload, ArrowRight, FileSearch,
  BookOpen, Shield, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/footer';

import { useAuth } from '@/context/auth-context';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const { user, isAdmin, isStudent } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background pt-20 pb-28">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={staggerContainer}
              className="mx-auto max-w-[850px] text-center"
            >
              <motion.div variants={fadeIn} className="mb-6 inline-flex items-center rounded-full border bg-background px-3.5 py-1.5 text-sm shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-[#29B5E8] mr-2"></span>
                <span className="font-semibold text-[#29B5E8]">Snowflake Cortex AI</span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-muted-foreground">Dual Student & Admin Ecosystem</span>
              </motion.div>
              
              <motion.h1 variants={fadeIn} className="mb-6 text-5xl font-extrabold tracking-tight sm:text-7xl">
                <span className="bg-gradient-to-r from-[#29B5E8] via-blue-600 to-indigo-600 bg-clip-text text-transparent">TMSL AI</span>
                <br />
                College Knowledge Engine
              </motion.h1>
              
              <motion.p variants={fadeIn} className="mb-10 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
                Unified institutional knowledge engine with dedicated <strong>Student</strong> & <strong>Admin</strong> panels.
                Admins publish notices and events; students receive instant updates, personalized feeds, and AI Q&A.
              </motion.p>
              
              {/* Dual Panel Callout Cards */}
              <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10 text-left">
                {/* Student Panel Portal Card */}
                <div className="p-6 rounded-2xl border-2 border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20 hover:border-blue-500 transition-all flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Student Hub</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Student Panel</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Individual student logins. Access official notices, live campus events, syllabus summaries, and ask the AI assistant.
                    </p>
                  </div>
                  <div className="pt-5 mt-4 border-t border-blue-200 dark:border-blue-900/50 flex gap-2">
                    {user ? (
                      <Button asChild className="w-full bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white">
                        <Link href="/student">
                          Enter Student Panel <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button asChild className="w-full bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white">
                          <Link href="/login?role=student">
                            Student Sign In <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href="/register">Register</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Admin Panel Portal Card */}
                <div className="p-6 rounded-2xl border-2 border-purple-500/30 bg-purple-50/40 dark:bg-purple-950/20 hover:border-purple-500 transition-all flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-purple-600 text-white">
                        <Shield className="h-6 w-6" />
                      </div>
                      <Badge className="bg-purple-600 hover:bg-purple-700 text-white">Admin Control</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Admin Panel</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Publish events with deadlines & venues, upload institutional notices/circulars, and oversee registered students.
                    </p>
                  </div>
                  <div className="pt-5 mt-4 border-t border-purple-200 dark:border-purple-900/50 flex gap-2">
                    {isAdmin ? (
                      <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        <Link href="/admin">
                          Enter Admin Panel <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        <Link href="/login?role=admin">
                          Admin Sign In <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Individual student email & password
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Admin event publishing feature
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Universal student knowledge visibility
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-slate-50 py-24 dark:bg-slate-900/50">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="mb-16 text-center"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
              <p className="mt-4 text-lg text-muted-foreground">The architecture behind the intelligence</p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid gap-8 md:grid-cols-4"
            >
              {[
                { icon: Shield, title: "1. Admin Uploads", desc: "Admins upload notices, syllabus files, and publish upcoming events." },
                { icon: Cpu, title: "2. AI Vectorization", desc: "Snowflake Cortex models chunk, embed, and index all documents." },
                { icon: Database, title: "3. Real-Time Storage", desc: "Data is synchronized across Snowflake TABLES & VECTOR stores." },
                { icon: BookOpen, title: "4. Student Access", desc: "All students get instant visibility, timeline filters, and AI answers." }
              ].map((step, i) => (
                <motion.div key={i} variants={fadeIn} className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-[#29B5E8] dark:bg-blue-900/30">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="mb-16 text-center"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Platform Capabilities</h2>
              <p className="mt-4 text-lg text-muted-foreground">Everything students and administrators need</p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[
                { icon: BookOpen, title: "Student Portal Hub", desc: "Personalized portal with individual student email/password login and saved events." },
                { icon: Calendar, title: "Admin Event Publishing", desc: "Admins can add new hackathons, workshops, and placement drives with deadlines." },
                { icon: MessageSquare, title: "AI Chat Assistant", desc: "Ask questions grounded in institutional documents with exact citations." },
                { icon: Search, title: "Smart Semantic Search", desc: "Find exact circulars and notices based on meaning, not just keywords." },
                { icon: FileSearch, title: "Notice Summarizer", desc: "Instantly extract key takeaways, required actions, and deadlines from PDFs." },
                { icon: Shield, title: "Admin Governance", desc: "Manage institutional knowledge, delete obsolete circulars, and view enrolled students." }
              ].map((feat, i) => (
                <motion.div key={i} variants={fadeIn}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <feat.icon className="mb-2 h-8 w-8 text-[#29B5E8]" />
                      <CardTitle>{feat.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{feat.desc}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Snowflake Showcase Section */}
        <section className="bg-slate-900 py-24 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Badge className="mb-4 bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white">Powered by Snowflake</Badge>
                <h2 className="mb-6 text-3xl font-bold sm:text-4xl">Built on the Data Cloud</h2>
                <p className="mb-6 text-lg text-slate-300">
                  TMSL AI leverages Snowflake's unified platform for end-to-end AI capabilities. 
                  No external vector databases or LLM APIs required.
                </p>
                <ul className="space-y-4">
                  {[
                    { title: "Cortex EMBED_TEXT_1024", desc: "Generates high-quality vector embeddings." },
                    { title: "Native VECTOR Data Type", desc: "Stores embeddings directly alongside relational data." },
                    { title: "Cortex COMPLETE", desc: "Powers intelligent summarization and Q&A using mistral-large2." }
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <div className="mr-3 mt-1 rounded-full bg-[#29B5E8]/20 p-1">
                        <Database className="h-4 w-4 text-[#29B5E8]" />
                      </div>
                      <div>
                        <strong className="block text-white">{item.title}</strong>
                        <span className="text-sm text-slate-400">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="mt-8 border-[#29B5E8] text-[#29B5E8] hover:bg-[#29B5E8] hover:text-white">
                  <Link href="/architecture">View Full Architecture</Link>
                </Button>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-2xl"
              >
                <h3 className="mb-6 text-xl font-bold">Try it yourself</h3>
                <div className="space-y-4">
                  {[
                    "When is the registration deadline for TechnoVit?",
                    "Summarize the new attendance guidelines.",
                    "What companies are coming for the placement drive?"
                  ].map((q, i) => (
                    <Link key={i} href={`/chat?q=${encodeURIComponent(q)}`} className="block rounded-lg border border-slate-600 bg-slate-700/50 p-4 transition-colors hover:bg-slate-700">
                      <p className="flex items-center text-sm font-medium">
                        <Search className="mr-2 h-4 w-4 text-[#29B5E8]" /> {q}
                      </p>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Hackathon Banner */}
        <section className="bg-gradient-to-r from-blue-600 to-[#29B5E8] py-12 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold">Built for MLH Hack Days</h2>
            <p className="mt-2 opacity-90">Submitting for the "Best Use of Snowflake" Challenge</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
