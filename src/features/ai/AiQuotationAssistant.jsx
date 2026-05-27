import { useState } from "react";

export default function AiQuotationAssistant() {
  const [quantity, setQuantity] = useState("");
  const [gsm, setGsm] = useState("");
  const [printing, setPrinting] = useState("");

  const estimatedCost =
    quantity && gsm
      ? (
          Number(quantity) *
          Number(gsm) *
          0.0025
        ).toFixed(2)
      : 0;

  const recommendedPrice =
    estimatedCost > 0
      ? (estimatedCost * 1.22).toFixed(2)
      : 0;

  return (
    <div className="rounded-3xl border border-orange-500/20 bg-[#111827] p-8 shadow-2xl">
      <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
        AI QUOTATION ENGINE
      </p>

      <h2 className="mt-4 text-4xl font-black text-white">
        Smart Quote Estimator
      </h2>

      <p className="mt-3 max-w-2xl text-slate-400">
        Estimate quotation pricing using manufacturing
        intelligence logic and operational costing.
      </p>

      {/* FORM */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) =>
            setQuantity(e.target.value)
          }
          className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none"
        />

        <input
          type="number"
          placeholder="Paper GSM"
          value={gsm}
          onChange={(e) =>
            setGsm(e.target.value)
          }
          className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none"
        />

        <select
          value={printing}
          onChange={(e) =>
            setPrinting(e.target.value)
          }
          className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none"
        >
          <option value="">
            Printing Type
          </option>

          <option value="flexo">
            Flexo
          </option>

          <option value="offset">
            Offset
          </option>
        </select>
      </div>

      {/* AI RESULT */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6">
          <p className="text-green-300">
            Estimated Manufacturing Cost
          </p>

          <h2 className="mt-4 text-5xl font-black text-white">
            ₹{estimatedCost}
          </h2>
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-6">
          <p className="text-orange-300">
            Recommended Quotation Price
          </p>

          <h2 className="mt-4 text-5xl font-black text-white">
            ₹{recommendedPrice}
          </h2>
        </div>
      </div>

      {/* AI INSIGHT */}
      <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-blue-300">
          AI INSIGHT
        </p>

        <p className="mt-3 text-lg text-slate-200">
          {Number(gsm) > 180
            ? "High GSM paper detected. Recommended margin buffer increased due to kraft cost volatility."
            : "Normal production risk profile detected."}
        </p>
      </div>
    </div>
  );
}