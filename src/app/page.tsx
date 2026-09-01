"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  MessageSquare, Search, FileText, Calendar, 
  BarChart3, Database, Cpu, Upload, ArrowRight, FileSearch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/footer';

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
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background pt-24 pb-32">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={staggerContainer}
              className="mx-auto max-w-[800px] text-center"
            >
              <motion.div variants={fadeIn} className="mb-6 inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-[#29B5E8] mr-2"></span>
                <span className="font-medium">Powered by Snowflake Cortex AI</span>
              </motion.div>
              
              <motion.h1 variants={fadeIn} className="mb-8 text-5xl font-extrabold tracking-tight sm:text-7xl">
                <span className="bg-gradient-to-r from-[#29B5E8] to-blue-600 bg-clip-text text-transparent">TMSL AI</span>
                <br />
                College Knowledge Engine
              </motion.h1>
              
              <motion.p variants={fadeIn} className="mb-12 text-lg text-muted-foreground sm:text-xl">
                Your college's entire knowledge base, intelligently searchable. Discover notices, events, 
                guidelines, and syllabus details instantly using advanced Retrieval-Augmented Generation.
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="h-12 w-full px-8 sm:w-auto">
                  <Link href="/chat">
                    Ask TMSL AI <MessageSquare className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 w-full px-8 sm:w-auto">
                  <Link href="/documents">
                    Explore Knowledge <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
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
                { icon: Upload, title: "1. Upload Documents", desc: "PDFs and text are ingested into the system." },
                { icon: Cpu, title: "2. AI Processing", desc: "Cortex models chunk and embed text." },
                { icon: Database, title: "3. Snowflake Storage", desc: "Embeddings stored securely in vector columns." },
                { icon: MessageSquare, title: "4. Ask & Get Answers", desc: "Natural language answers backed by citations." }
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
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Features</h2>
              <p className="mt-4 text-lg text-muted-foreground">Everything you need to navigate college life</p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[
                { icon: MessageSquare, title: "AI Chat Assistant", desc: "Ask complex questions and get grounded answers." },
                { icon: Search, title: "Smart Search", desc: "Semantic search finds what you mean, not just what you type." },
                { icon: FileText, title: "Document Management", desc: "Organize institutional knowledge efficiently." },
                { icon: FileSearch, title: "Notice Summarizer", desc: "Instantly extract key points from long PDF notices." },
                { icon: Calendar, title: "Event Intelligence", desc: "Auto-extract deadlines and event dates from texts." },
                { icon: BarChart3, title: "Analytics Dashboard", desc: "Track query trends and popular knowledge areas." }
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
