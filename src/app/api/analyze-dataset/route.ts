import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { dataset } = await request.json();

    if (!dataset || !Array.isArray(dataset) || dataset.length === 0) {
      return NextResponse.json({ error: 'Dataset is required' }, { status: 400 });
    }

    // Try to auto-detect sensitive column (e.g., Gender, Race, Age) and decision column (e.g., Selected, Approved)
    const columns = Object.keys(dataset[0]);
    let sensitiveCol = columns.find(c => ['gender', 'race', 'age', 'ethnicity', 'sex'].includes(c.toLowerCase()));
    let decisionCol = columns.find(c => ['selected', 'approved', 'hired', 'status', 'outcome', 'decision'].includes(c.toLowerCase()));

    // Fallback to defaults if not found
    if (!sensitiveCol) sensitiveCol = columns[1];
    if (!decisionCol) decisionCol = columns[columns.length - 1];

    const groupStats: Record<string, { total: number; selected: number }> = {};

    dataset.forEach(row => {
      const group = row[sensitiveCol as string] || 'Unknown';
      const decisionStr = String(row[decisionCol as string]).toLowerCase();
      const isSelected = decisionStr === 'yes' || decisionStr === '1' || decisionStr === 'true' || decisionStr === 'approved' || decisionStr === 'hired';

      if (!groupStats[group]) {
        groupStats[group] = { total: 0, selected: 0 };
      }
      groupStats[group].total += 1;
      if (isSelected) {
        groupStats[group].selected += 1;
      }
    });

    const selectionRates: { group: string; rate: number }[] = [];
    let minRate = 100;
    let maxRate = 0;

    Object.entries(groupStats).forEach(([group, stats]) => {
      if (stats.total === 0) return;
      const rate = (stats.selected / stats.total) * 100;
      selectionRates.push({ group, rate: Number(rate.toFixed(1)) });

      if (rate < minRate) minRate = rate;
      if (rate > maxRate) maxRate = rate;
    });

    const disparateImpact = maxRate > 0 ? (minRate / maxRate) : 1;
    const biasScore = Math.max(0, Math.min(100, Math.round(disparateImpact * 100)));

    let warningMessage = "";
    let suggestedFixes: string[] = [];

    if (disparateImpact < 0.8) {
      warningMessage = `The selection rate for the least favored group is only ${(disparateImpact * 100).toFixed(1)}% of the most favored group, falling below the 80% threshold (Four-Fifths rule).`;
      
      // Call Gemini for suggestions based on the metrics
      const aiPrompt = `Analyze the following dataset fairness metrics.
Sensitive Attribute: ${sensitiveCol}
Decision Attribute: ${decisionCol}
Selection Rates: ${JSON.stringify(selectionRates)}
Disparate Impact: ${disparateImpact.toFixed(2)}

Provide 3 actionable, specific suggestions to fix the dataset bias. Return as a plain JSON array of strings.`;

      if (!process.env.GEMINI_API_KEY) {
         suggestedFixes = [
          "Rebalance the training data to ensure equal representation of all demographic groups.",
          "Review the feature selection process to remove proxies for sensitive attributes.",
          "Implement bias mitigation algorithms such as adversarial debiasing during model training."
        ];
      } else {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: aiPrompt,
            config: {
              responseMimeType: "application/json",
            }
          });
          const resultText = response.text || "[]";
          suggestedFixes = JSON.parse(resultText);
        } catch (e) {
           console.error("AI Generation error", e);
           suggestedFixes = ["Rebalance training data", "Remove sensitive features"];
        }
      }
    } else {
      suggestedFixes = ["Continue monitoring model outputs regularly.", "Ensure new incoming data maintains this balance."];
    }

    return NextResponse.json({
      selection_rates: selectionRates,
      disparate_impact: disparateImpact,
      bias_score: biasScore,
      warning_message: warningMessage,
      suggested_fixes: suggestedFixes
    });
  } catch (error) {
    console.error('Error in analyze-dataset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
