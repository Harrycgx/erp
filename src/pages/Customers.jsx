import PageContainer from "../components/PageContainer";

const customers = [
  "Amazon",
  "Flipkart",
  "Nykaa",
  "Reliance Retail",
];

export default function Customers() {
  return (
    <PageContainer
      title="Customers"
      description="Customer relationship and client management."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {customers.map((customer) => (
          <div
            key={customer}
            className="rounded-2xl bg-black/30 p-6"
          >
            <h2 className="text-2xl font-semibold text-white">
              {customer}
            </h2>

            <p className="mt-2 text-slate-400">
              Active business account
            </p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}