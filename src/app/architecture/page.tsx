"use client";

import { motion } from 'framer-motion';
import { Database, Cpu, Search, BrainCircuit, ArrowRight, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 dark:bg-slate-950">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            Powered by <span className="text-[#29B5E8]">Snowflake</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-xl text-muted-foreground"
          >
            See how Snowflake Cortex AI powers every aspect of the TMSL AI knowledge engine — from ingestion to inference, all within a secure data boundary.
          </motion.p>
        </div>

        {/* The Pipeline Visualization */}
        <div className="mb-24 relative">
          <h2 className="text-2xl font-bold mb-8 text-center">RAG Architecture Flow</h2>
          
          <div className="flex flex-col items-center max-w-4xl mx-auto">
            {/* INGESTION */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="w-full bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-6"
            >
              <div className="flex-1 text-center md:text-right">
                <h3 className="font-bold text-lg">1. Data Ingestion</h3>
                <p className="text-sm text-muted-foreground">PDFs, Notices, Syllabi parsed into text chunks.</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border-2 border-slate-200">
                <Database className="h-8 w-8 text-slate-500" />
              </div>
              <div className="flex-1 hidden md:block" />
            </motion.div>

            <ArrowDown className="h-8 w-8 text-[#29B5E8] mb-6 animate-bounce" />

            {/* EMBEDDING */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="w-full bg-[#29B5E8]/10 border-[#29B5E8]/30 border rounded-xl p-6 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-6"
            >
              <div className="flex-1 hidden md:block text-right">
                <Badge label="Snowflake Cortex" />
              </div>
              <div className="w-16 h-16 rounded-full bg-[#29B5E8] flex items-center justify-center shrink-0 text-white shadow-lg shadow-blue-500/20">
                <Cpu className="h-8 w-8" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-lg text-[#0f8dbd] dark:text-[#29B5E8]">2. Vectorization</h3>
                <code className="text-xs bg-white/50 dark:bg-black/50 px-2 py-1 rounded text-slate-800 dark:text-slate-200 block mt-1">EMBED_TEXT_1024()</code>
              </div>
            </motion.div>

            <ArrowDown className="h-8 w-8 text-[#29B5E8] mb-6 animate-bounce" />

            {/* SEARCH */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="w-full bg-[#29B5E8]/10 border-[#29B5E8]/30 border rounded-xl p-6 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-6"
            >
              <div className="flex-1 text-center md:text-right">
                <h3 className="font-bold text-lg text-[#0f8dbd] dark:text-[#29B5E8]">3. Semantic Search</h3>
                <code className="text-xs bg-white/50 dark:bg-black/50 px-2 py-1 rounded text-slate-800 dark:text-slate-200 block mt-1">VECTOR_COSINE_SIMILARITY()</code>
              </div>
              <div className="w-16 h-16 rounded-full bg-[#29B5E8] flex items-center justify-center shrink-0 text-white shadow-lg shadow-blue-500/20">
                <Search className="h-8 w-8" />
              </div>
              <div className="flex-1 hidden md:block text-left">
                <Badge label="Native Vector Types" />
              </div>
            </motion.div>

            <ArrowDown className="h-8 w-8 text-[#29B5E8] mb-6 animate-bounce" />

            {/* GENERATION */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="w-full bg-[#29B5E8]/10 border-[#29B5E8]/30 border rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6"
            >
              <div className="flex-1 hidden md:block text-right">
                <Badge label="mistral-large2" />
              </div>
              <div className="w-16 h-16 rounded-full bg-[#29B5E8] flex items-center justify-center shrink-0 text-white shadow-lg shadow-blue-500/20">
                <BrainCircuit className="h-8 w-8" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-lg text-[#0f8dbd] dark:text-[#29B5E8]">4. Answer Generation</h3>
                <code className="text-xs bg-white/50 dark:bg-black/50 px-2 py-1 rounded text-slate-800 dark:text-slate-200 block mt-1">SNOWFLAKE.CORTEX.COMPLETE()</code>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Detail Cards */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {[
            {
              title: "Cortex EMBED_TEXT",
              desc: "Converts text into 1024-dimensional vector embeddings using the snowflake-arctic-embed-l-v2.0 model, optimized for enterprise retrieval.",
              icon: Cpu
            },
            {
              title: "VECTOR Data Type",
              desc: "Native VECTOR(FLOAT, 1024) column type allows storing high-dimensional embeddings directly in Snowflake relational tables.",
              icon: Database
            },
            {
              title: "Cosine Similarity Search",
              desc: "Built-in VECTOR_COSINE_SIMILARITY function computes nearest neighbors instantly, scaling effortlessly with Snowflake's compute clusters.",
              icon: Search
            },
            {
              title: "Cortex COMPLETE",
              desc: "Serverless LLM inference using state-of-the-art models (like mistral-large2) for high-quality answer generation and document summarization.",
              icon: BrainCircuit
            },
            {
              title: "Secure Data Boundary",
              desc: "Data never leaves Snowflake. Models run securely inside the perimeter, ensuring strict governance and privacy of institutional data.",
              icon: Database
            },
            {
              title: "Zero Operational Overhead",
              desc: "No separate vector database to maintain, no external LLM API endpoints to integrate. Everything is handled via standard SQL.",
              icon: Cpu
            }
          ].map((feature, i) => (
            <motion.div key={i} variants={item}>
              <Card className="h-full border-t-4 border-t-[#29B5E8] transition-shadow hover:shadow-md">
                <CardHeader>
                  <feature.icon className="mb-3 h-8 w-8 text-[#29B5E8]" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
      {label}
    </span>
  );
}
