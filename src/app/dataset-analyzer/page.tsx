"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Papa from "papaparse";
import { Upload, AlertTriangle, CheckCircle, Table as TableIcon, Loader2, Sparkles } from "lucide-react";
import { useHistory } from "@/context/HistoryContext";
import { GeminiBadge } from "@/components/GeminiBadge";

export default function DatasetAnalyzer() {
  const [csvData, setCsvData] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { addRecord } = useHistory();

  const handleAnalyze = async () => {
    if (!csvData) return;
    
    setLoading(true);
    try {
      // Basic browser-side parsing to find DI
      const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
      const rows = parsed.data as Record<string, string>[];
      
      const response = await fetch("/api/analyze-dataset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset: rows }),
      });
      
      const data = await response.json();
      setResult(data);
      
      addRecord({
        type: "Dataset Fairness",
        title: "Dataset Analysis",
        isBiased: data.disparate_impact < 0.8,
        fairnessScore: data.bias_score,
      });
    } catch (error) {
      console.error("Error analyzing dataset:", error);
    } finally {
      setLoading(false);
    }
  };

  const setExample = () => {
    setCsvData(
`Name,Gender,Selected
A,Male,Yes
B,Male,Yes
C,Female,No
D,Female,No
E,Male,Yes
F,Female,Yes`
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold tracking-tight mb-2">Dataset Fairness Analyzer</h1>
        <p className="text-gray-400">Compute fairness metrics like Disparate Impact Ratio to detect bias in data.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TableIcon className="mr-2 h-5 w-5 text-primary" />
                Input Dataset
              </CardTitle>
              <CardDescription>Paste a small CSV or table of decision data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Name,Gender,Selected..."
                className="w-full h-64 p-4 rounded-md bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={setExample}>
                  Load Example
                </Button>
                <Button onClick={handleAnalyze} disabled={!csvData || loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Compute Fairness
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Fairness Metrics</CardTitle>
              <CardDescription>Selection rates and disparate impact.</CardDescription>
            </CardHeader>
            <CardContent>
              {!result && !loading && (
                <div className="h-64 flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-lg">
                  <Upload className="h-8 w-8 mb-2 opacity-50" />
                  <p>Provide dataset to compute metrics.</p>
                </div>
              )}

              {loading && (
                <div className="h-64 flex flex-col items-center justify-center text-primary">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="animate-pulse">Calculating Disparate Impact Ratio...</p>
                </div>
              )}

              {result && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10 flex flex-col justify-center">
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Fairness Score</h4>
                      <div className="text-3xl font-bold flex items-center">
                        <span className={result.bias_score > 80 ? "text-emerald-400" : result.bias_score > 60 ? "text-amber-400" : "text-red-400"}>
                          {result.bias_score}
                        </span>
                        <span className="text-gray-500 text-lg ml-1">/ 100</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10 flex flex-col justify-center">
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Disparate Impact (DI)</h4>
                      <div className="text-3xl font-bold flex items-center">
                        <span className={result.disparate_impact < 0.8 ? "text-red-400" : "text-emerald-400"}>
                          {result.disparate_impact.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        (&lt;0.8 indicates potential bias)
                      </p>
                    </div>
                  </div>

                  {result.disparate_impact < 0.8 && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-start text-sm">
                      <AlertTriangle className="h-4 w-4 text-red-400 mr-2 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-red-100 font-medium">Warning: Potential Bias Detected</p>
                        <p className="text-red-200/70 mt-1">{result.warning_message}</p>
                      </div>
                    </div>
                  )}

                  {result.disparate_impact >= 0.8 && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-start text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mr-2 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-emerald-100 font-medium">Fairness check passed</p>
                        <p className="text-emerald-200/70 mt-1">Disparate impact ratio is within acceptable limits.</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-4">Selection Rates by Group</h4>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.selection_rates} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                          <XAxis type="number" domain={[0, 100]} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis dataKey="group" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip
                            cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                            contentStyle={{ backgroundColor: "#0f1020", borderColor: "#1e293b", borderRadius: "8px" }}
                            formatter={(value) => [`${value}%`, "Selection Rate"]}
                          />
                          <Bar dataKey="rate" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Suggested Fixes</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {result.suggested_fixes.map((fix: string, i: number) => (
                        <li key={i} className="text-sm text-gray-300">{fix}</li>
                      ))}
                    </ul>
                  </div>

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
