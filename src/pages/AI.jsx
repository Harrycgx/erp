import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";
import DataTable from "../components/tables/DataTable";
import AiQuotationAssistant from "../features/ai/AiQuotationAssistant";

import { fetchAiPredictions } from "../services/aiService";

const aiColumns = [
  {
    key: "prediction_type",
    label: "Prediction Type",
  },
  {
    key: "reference_number",
    label: "Reference",
  },
  {
    key: "predicted_value",
    label: "Predicted Value",
  },
  {
    key: "confidence_score",
    label: "Confidence",
  },
  {
    key: "recommendation",
    label: "Recommendation",
  },
];

export default function AI() {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    async function loadPredictions() {
      try {
        const result = await fetchAiPredictions();

        if (result.data) {
          setPredictions(result.data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadPredictions();
  }, []);

  const highConfidencePredictions =
    predictions.filter(
      (prediction) =>
        Number(prediction.confidence_score) >= 90
    );

  const avgConfidence =
    predictions.length > 0
      ? Math.round(
          predictions.reduce(
            (sum, prediction) =>
              sum +
              Number(
                prediction.confidence_score || 0
              ),
            0
          ) / predictions.length
        )
      : 0;

  return (
    <PageContainer
      title="AI Center"
      subtitle="Monitor manufacturing intelligence, AI predictions and operational recommendations."
    >
      {/* AI KPI */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            AI Predictions
          </p>

          <h2 className="mt-4 text-5xl font-black text-orange-400">
            {predictions.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            High Confidence
          </p>

          <h2 className="mt-4 text-5xl font-black text-green-400">
            {highConfidencePredictions.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Avg Confidence
          </p>

          <h2 className="mt-4 text-5xl font-black text-blue-400">
            {avgConfidence}%
          </h2>
        </div>
      </div>

      {/* AI INSIGHT PANEL */}
      <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-black p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
          AI FACTORY INSIGHT
        </p>

        <h2 className="mt-4 text-4xl font-black text-white">
          Production Wastage Risk Detected
        </h2>

        <p className="mt-4 max-w-3xl text-lg text-slate-300">
          AI analysis indicates elevated wastage probability
          during flexographic alignment stage for high GSM
          kraft paper batches.
        </p>

        <div className="mt-6 inline-flex rounded-2xl border border-orange-500/30 bg-orange-500/10 px-5 py-3 text-orange-300">
          Recommended Action:
          Increase calibration checks before production start.
        </div>
      </div>

      {/* AI QUOTATION ASSISTANT */}
<AiQuotationAssistant />

{/* AI TABLE */}
<DataTable
  columns={aiColumns}
  data={predictions}
/>
    </PageContainer>
  );
}