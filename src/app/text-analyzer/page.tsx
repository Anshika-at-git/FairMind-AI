"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { useHistory } from "@/context/HistoryContext";
import { GeminiBadge } from "@/components/GeminiBadge";

export default function TextAnalyzer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { addRecord } = useHistory();

  const handleAnalyze = async () => {
    if (!text) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      
      const data = await response.json();
      setResult(data);
      
      addRecord({
        type: "Text Bias",
        title: "Text Analysis",
        isBiased: data.bias_detected,
        biasCategories: data.bias_detected && data.bias_type !== "none" ? [data.bias_type] : [],
      });
    } catch (error) {
      console.error("Error analyzing text:", error);
    } finally {
      setLoading(false);
    }
  };

  const setExample = () => {
    setText("The best leaders in the corporate world are strong men who know how to command a room.");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold tracking-tight mb-2">Text Bias Analyzer</h1>
        <p className="text-gray-400">Detect implicit and explicit bias in written content.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Input Text
              </CardTitle>
              <CardDescription>Enter text to analyze for potential bias.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full h-48 p-4 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={setExample}>
                  Load Example
                </Button>
                <Button onClick={handleAnalyze} disabled={!text || loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Text
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>AI-generated fairness report.</CardDescription>
            </CardHeader>
            <CardContent>
              {!result && !loading && (
                <div className="h-48 flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-lg">
                  <FileText className="h-8 w-8 mb-2 opacity-50" />
                  <p>Submit text to see analysis.</p>
                </div>
              )}

              {loading && (
                <div className="h-48 flex flex-col items-center justify-center text-primary">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="animate-pulse">Evaluating text fairness...</p>
                </div>
              )}

              {result && !loading && result.error && (
                <div className="h-48 flex flex-col items-center justify-center text-red-500 border border-red-500/20 bg-red-500/5 rounded-lg">
                  <AlertTriangle className="h-8 w-8 mb-2" />
                  <p>Error analyzing text: {result.error}</p>
                </div>
              )}

              {result && !loading && !result.error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">Detection Status</h4>
                      <div className="flex items-center mt-1">
                        {result.bias_detected ? (
                          <Badge variant="danger" className="text-sm">Bias Detected</Badge>
                        ) : (
                          <Badge variant="success" className="text-sm">No Bias Detected</Badge>
                        )}
                      </div>
                    </div>
                    {result.bias_detected && (
                      <div className="text-right">
                        <h4 className="text-sm font-medium text-gray-400">Confidence</h4>
                        <span className="text-2xl font-bold text-primary">{result.confidence}%</span>
                      </div>
                    )}
                  </div>

                  {result.bias_detected && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Category</h4>
                        <Badge variant="outline" className="capitalize border-primary/50 text-primary-foreground">
                          {result.bias_type} Bias
                        </Badge>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Explanation</h4>
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-start text-sm">
                          <AlertTriangle className="h-4 w-4 text-red-400 mr-2 mt-0.5 shrink-0" />
                          <p className="text-red-100">{result.explanation}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Highlighted Issue</h4>
                        <p className="p-3 bg-white/5 border border-white/10 rounded-md text-sm italic">
                          "...<span className="bg-red-500/30 text-red-200 px-1 rounded">{result.highlighted_text}</span>..."
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Suggested Rewrite</h4>
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-sm">
                          <p className="text-emerald-100">{result.suggested_fix}</p>
                        </div>
                      </div>
                    </>
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
