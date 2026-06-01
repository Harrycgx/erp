import DataTable from "../../components/tables/DataTable";

const productionColumns = [
  {
    key: "quotation_number",
    label: "Quotation",
  },
  {
    key: "quantity",
    label: "Quantity",
  },
  {
    key: "stage",
    label: "Stage",
  },
];

export default function LiveProductionFeed({
  jobs = [],
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-white">
          Live Production Jobs
        </h2>

        <p className="mt-2 text-slate-400">
          Real-time manufacturing workflow tracking
        </p>
      </div>

      <DataTable
        columns={productionColumns}
        data={jobs}
      />
    </div>
  );
}