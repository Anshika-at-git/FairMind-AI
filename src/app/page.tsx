"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, CheckCircle, Database, FileText, ShieldAlert, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useHistory } from "@/context/HistoryContext";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

export default function Home() {
  const { history } = useHistory();

  // Derived calculations from history
  const {
    totalAudits,
    totalIssues,
    overallFairness,
    textAudits,
    modelAudits,
    datasetAudits,
    chartData,
  } = useMemo(() => {
    const totalAudits = history.length;
    const totalIssues = history.filter(r => r.isBiased).length;
    
    // Average fairness score (for datasets) or pseudo-score based on issues
    let fairnessScore = 100;
    if (totalAudits > 0) {
      const issuesRatio = totalIssues / totalAudits;
      fairnessScore = Math.round(100 - (issuesRatio * 40)); // rough metric
    }
    
    const textAudits = history.filter(r => r.type === "Text Bias").length;
    const modelAudits = history.filter(r => r.type === "Model Output").length;
    const datasetAudits = history.filter(r => r.type === "Dataset Fairness").length;

    // Build chart data for categories
    const categoryCounts: Record<string, number> = {};
    history.forEach(r => {
      if (r.biasCategories) {
        r.biasCategories.forEach(cat => {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
      }
    });

    const chartData = Object.entries(categoryCounts).map(([name, issues]) => ({ name, issues }));

    // Fallback if no category data
    if (chartData.length === 0 && totalIssues > 0) {
       chartData.push({ name: "General Bias", issues: totalIssues });
    }

    return { totalAudits, totalIssues, overallFairness: fairnessScore, textAudits, modelAudits, datasetAudits, chartData };
  }, [history]);

  return (
    <div className="p-8 pb-20 space-y-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight mb-2">FairMind Dashboard</h1>
        <p className="text-gray-400">Overview of your AI system's fairness metrics and detected biases.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="border-accent-fair/20 bg-accent-fair/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-400">Overall Fairness</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">{totalAudits === 0 ? "--" : `${overallFairness}%`}</div>
              <p className="text-xs text-gray-400 mt-1">Based on recent audits</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className={totalIssues > 0 ? "border-accent-high/20 bg-accent-high/5" : "border-white/5"}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${totalIssues > 0 ? "text-red-400" : "text-gray-300"}`}>Total Bias Issues</CardTitle>
              <ShieldAlert className={`h-4 w-4 ${totalIssues > 0 ? "text-red-400" : "text-gray-500"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${totalIssues > 0 ? "text-red-400" : "text-gray-300"}`}>{totalIssues}</div>
              <p className="text-xs text-gray-400 mt-1">Across {totalAudits} audits</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Text Audits</CardTitle>
              <FileText className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{textAudits}</div>
              <p className="text-xs text-gray-400 mt-1">Sentences analyzed</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Model / Dataset</CardTitle>
              <Bot className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{modelAudits + datasetAudits}</div>
              <p className="text-xs text-gray-400 mt-1">Checks performed</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="col-span-1 h-full">
            <CardHeader>
              <CardTitle>Bias Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} angle={-45} textAnchor="end" />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                      contentStyle={{ backgroundColor: "#0f1020", borderColor: "#1e293b", borderRadius: "8px" }}
                    />
                    <Bar dataKey="issues" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <p>No bias issues recorded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="col-span-1 h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-gray-500 h-64 border border-dashed border-white/10 rounded-lg">
                    <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
                    <p>No activity yet.</p>
                    <p className="text-sm">Run an analysis to see it here.</p>
                  </div>
                ) : (
                  history.slice(0, 5).map((item, i) => {
                    let Icon = FileText;
                    let color = "text-purple-400";
                    if (item.type === "Model Output") { Icon = Bot; color = "text-cyan-400"; }
                    if (item.type === "Dataset Fairness") { Icon = Database; color = "text-amber-400"; }
                    
                    return (
                      <div key={item.id} className="flex items-center">
                        <div className={`mr-4 p-2 rounded-full bg-white/5 border border-white/10 ${item.isBiased ? 'border-red-500/50' : ''}`}>
                          <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-none flex items-center">
                            {item.title}
                            {item.isBiased && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400">Flagged</span>}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

