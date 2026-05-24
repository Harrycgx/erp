import OrderCard from './OrderCard';

export default function ProductionQueue({ orders }) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Production queue</p>
          <h3 className="mt-2 text-3xl font-black text-slate-900">Live line status</h3>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}
