"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2, MessageSquare, ShieldAlert, Zap } from "lucide-react";
import { useHistory } from "@/context/HistoryContext";
import { GeminiBadge } from "@/components/GeminiBadge";

export default function ModelAuditor() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { addRecord } = useHistory();

  const handleAudit = async () => {
    if (!prompt || !output) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/audit-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, output }),
      });
      
      const data = await response.json();
      setResult(data);
      
      addRecord({
        type: "Model Output",
        title: "Model Output Audit",
        riskLevel: data.risk_level,
        biasCategories: data.bias_categories || [],
        isBiased: data.risk_level !== "Low",
      });
    } catch (error) {
      console.error("Error auditing model output:", error);
    } finally {
      setLoading(false);
    }
  };

  const setExample = () => {
    setPrompt("Write a story about a successful CEO and their assistant.");
    setOutput("John, the brilliant and decisive CEO, walked into the boardroom. He asked his assistant, Mary, to fetch him some coffee and take notes while he explained his complex strategy to the board.");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold tracking-tight mb-2">AI Output Auditor</h1>
        <p className="text-gray-400">Evaluate LLM responses for safety, bias, and fairness.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                Prompt & Output Pair
              </CardTitle>
              <CardDescription>Enter the user prompt and the AI model's response.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">User Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Write a story about a CEO..."
                  className="w-full h-24 p-3 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Model Output</label>
                <textarea
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  placeholder="Paste the AI generated text here..."
                  className="w-full h-40 p-3 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={setExample}>
                  Load Example
                </Button>
                <Button onClick={handleAudit} disabled={!prompt || !output || loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Auditing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Audit Output
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Audit Report</CardTitle>
              <CardDescription>Risk assessment and safety review.</CardDescription>
            </CardHeader>
            <CardContent>
              {!result && !loading && (
                <div className="h-64 flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-lg">
                  <Bot className="h-8 w-8 mb-2 opacity-50" />
                  <p>Run audit to see report.</p>
                </div>
              )}

              {loading && (
                <div className="h-64 flex flex-col items-center justify-center text-primary">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="animate-pulse">Analyzing context and intent...</p>
                </div>
              )}

              {result && !loading && result.error && (
                <div className="h-64 flex flex-col items-center justify-center text-red-500 border border-red-500/20 bg-red-500/5 rounded-lg p-4 overflow-y-auto">
                  <ShieldAlert className="h-8 w-8 mb-2 shrink-0" />
                  <p className="text-sm text-center break-all whitespace-pre-wrap">Error: {result.error}</p>
                </div>
              )}

              {result && !loading && !result.error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">Risk Level</h4>
                      <div className="flex items-center mt-1">
                        {result.risk_level === "High" && <Badge variant="danger" className="text-sm px-3 py-1">High Risk</Badge>}
                        {result.risk_level === "Medium" && <Badge variant="warning" className="text-sm px-3 py-1">Medium Risk</Badge>}
                        {result.risk_level === "Low" && <Badge variant="success" className="text-sm px-3 py-1">Low Risk</Badge>}
                      </div>
                    </div>
                    {result.risk_level !== "Low" && (
                      <ShieldAlert className={`h-8 w-8 ${result.risk_level === "High" ? "text-red-500" : "text-amber-500"}`} />
                    )}
                  </div>

                  {result.risk_level !== "Low" && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Bias Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.bias_categories.map((cat: string, i: number) => (
                            <Badge key={i} variant="outline" className="border-primary/50">{cat}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Problematic Phrases</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {result.problematic_phrases.map((phrase: string, i: number) => (
                            <li key={i} className="text-sm text-red-300">"{phrase}"</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Explanation</h4>
                        <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-md">{result.explanation}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Safer Alternative</h4>
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-sm">
                          <p className="text-emerald-100">{result.safer_alternative}</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {result.risk_level === "Low" && (
                     <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                        <p className="text-sm text-emerald-100">{result.explanation}</p>
                     </div>
                  )}

                  <div className="pt-4 mt-6 border-t border-white/10 flex justify-end">
                    <GeminiBadge />
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
