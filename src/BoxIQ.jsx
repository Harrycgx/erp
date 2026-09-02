export default function BoxIQ() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] overflow-x-hidden">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="text-3xl font-black tracking-tight">
            BOX<span className="text-orange-500">IQ</span>
          </div>

          <nav className="hidden items-center gap-10 text-sm font-semibold text-slate-600 md:flex">
            <a href="#" className="hover:text-black transition">
              Packaging
            </a>
            <a href="#" className="hover:text-black transition">
              Industries
            </a>
            <a href="#" className="hover:text-black transition">
              Factory
            </a>
            <a href="#" className="hover:text-black transition">
              Pricing
            </a>
            <a href="#" className="hover:text-black transition">
              Contact
            </a>
          </nav>

          <button className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-orange-600 hover:shadow-2xl hover:shadow-orange-500/20">
            Get Quote
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-slate-50 px-6 py-32">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-orange-200 blur-3xl opacity-20"></div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-20 lg:grid-cols-2">
          {/* LEFT */}
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-5 py-2 text-sm font-bold text-orange-600">
              Premium Custom Packaging
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              Packaging That Makes Your Brand Feel Premium Before Customers Even Open It
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600">
              Modern corrugated packaging engineered for ecommerce, luxury retail,
              gifting, and ambitious brands across India.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button className="rounded-2xl bg-orange-500 px-8 py-5 text-lg font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-orange-600 hover:shadow-2xl hover:shadow-orange-500/30">
                Get Instant Quote
              </button>

              <button className="rounded-2xl border border-black/10 bg-white px-8 py-5 text-lg font-bold text-slate-700 transition-all duration-300 hover:bg-slate-50">
                View Packaging Samples
              </button>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 text-sm font-semibold text-slate-500">
              <span>90% Repeat Orders</span>
              <span>Notebook Orders</span>
              <span>2-3 Concurrent Jobs</span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <div className="absolute -left-10 top-10 h-48 w-48 rounded-full bg-orange-300 blur-3xl opacity-30"></div>

            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop"
              alt="Packaging"
              className="relative rounded-[32px] border border-black/5 object-cover shadow-[0_40px_100px_rgba(15,23,42,0.15)]"
            />
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 text-center md:grid-cols-4">
          {[
            ["90%", "Repeat Orders"],
            ["2-3", "Concurrent Jobs"],
            ["~₹20L/mo", "Revenue"],
            ["20-25", "Workers"],
          ].map(([number, text], i) => (
            <div key={i}>
              <div className="text-3xl font-black">{number}</div>
              <div className="mt-2 text-sm text-slate-500">{text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 max-w-2xl">
            <div className="mb-4 text-sm font-black uppercase tracking-[3px] text-orange-500">
              Packaging Solutions
            </div>

            <h2 className="text-5xl font-black tracking-tight md:text-6xl">
              Built For Modern Brands
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Packaging designed to improve customer experience, brand perception,
              and delivery reliability.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Luxury Packaging",
                image:
                  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop",
                text: "Premium rigid boxes crafted for luxury presentation.",
              },
              {
                title: "Ecommerce Mailers",
                image:
                  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop",
                text: "Corrugated mailers engineered for modern shipping.",
              },
              {
                title: "Industrial Cartons",
                image:
                  "https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=1200&auto=format&fit=crop",
                text: "Heavy-duty packaging built for operational scale.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group overflow-hidden rounded-[30px] border border-black/5 bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(15,23,42,0.12)]"
              >
                <div className="overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-80 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="p-8">
                  <h3 className="text-3xl font-black">{item.title}</h3>

                  <p className="mt-4 leading-8 text-slate-600">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DARK QUOTE SECTION */}
      <section className="bg-[#0F172A] px-6 py-32 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-20 lg:grid-cols-2">
          {/* LEFT */}
          <div>
            <div className="mb-4 text-sm font-black uppercase tracking-[3px] text-orange-400">
              Smart Quote Experience
            </div>

            <h2 className="text-5xl font-black leading-tight md:text-6xl">
              Get Packaging Pricing In Minutes
            </h2>

            <p className="mt-8 text-lg leading-8 text-slate-300">
              A guided experience designed to simplify packaging customization
              for modern businesses.
            </p>

            <div className="mt-10 space-y-5">
              {[
                "Choose packaging style",
                "Enter dimensions & quantity",
                "Select print & finish",
                "Receive instant estimate",
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-5 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-lg font-black">
                    {index + 1}
                  </div>

                  <div className="text-lg font-semibold">{step}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="rounded-[32px] bg-white p-10 text-slate-900 shadow-[0_40px_100px_rgba(0,0,0,0.35)]">
            <h3 className="text-4xl font-black">Instant Quote</h3>

            <div className="mt-10 grid gap-5">
              <input
                placeholder="Your Name"
                className="rounded-2xl border border-black/10 px-5 py-4 outline-none focus:border-orange-500"
              />

              <input
                placeholder="Business Name"
                className="rounded-2xl border border-black/10 px-5 py-4 outline-none focus:border-orange-500"
              />

              <select className="rounded-2xl border border-black/10 px-5 py-4 outline-none focus:border-orange-500">
                <option>Luxury Packaging</option>
                <option>Ecommerce Mailers</option>
                <option>Shipping Cartons</option>
              </select>

              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Quantity"
                  className="rounded-2xl border border-black/10 px-5 py-4 outline-none focus:border-orange-500"
                />

                <input
                  placeholder="Size"
                  className="rounded-2xl border border-black/10 px-5 py-4 outline-none focus:border-orange-500"
                />
              </div>

              <button className="mt-4 rounded-2xl bg-orange-500 px-6 py-5 text-lg font-black text-white transition-all duration-300 hover:bg-orange-600 hover:shadow-2xl hover:shadow-orange-500/30">
                Generate Estimate
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FACTORY */}
      <section className="px-6 py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-20 lg:grid-cols-2">
          <div>
            <img
              src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?q=80&w=1200&auto=format&fit=crop"
              alt="Factory"
              className="rounded-[32px] shadow-[0_40px_100px_rgba(15,23,42,0.15)]"
            />
          </div>

          <div>
            <div className="mb-4 text-sm font-black uppercase tracking-[3px] text-orange-500">
              Manufacturing Precision
            </div>

            <h2 className="text-5xl font-black tracking-tight md:text-6xl">
              Real Production. Real Reliability.
            </h2>

            <p className="mt-8 text-lg leading-8 text-slate-600">
              From printing and die cutting to dispatch and logistics, BoxIQ is
              built to deliver packaging at scale without compromising quality.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-6">
              <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <div className="text-4xl font-black">~₹20L</div>
                <div className="mt-2 text-slate-500">Monthly Revenue (verif.)</div>
              </div>

              <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <div className="text-4xl font-black">Semi-Auto</div>
                <div className="mt-2 text-slate-500">Machines (verif.)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 pb-32">
        <div className="mx-auto max-w-7xl rounded-[40px] bg-orange-500 px-10 py-24 text-center text-white shadow-[0_40px_100px_rgba(249,115,22,0.30)] lg:px-20">
          <h2 className="mx-auto max-w-4xl text-5xl font-black leading-tight md:text-7xl">
            Make Your Brand Look More Premium With Better Packaging
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-orange-50">
            Custom packaging solutions designed for businesses that want stronger
            customer perception and reliable delivery performance.
          </p>

          <button className="mt-12 rounded-2xl bg-white px-10 py-5 text-lg font-black text-orange-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            Request Custom Quote
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/5 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <div className="text-3xl font-black tracking-tight">
              BOX<span className="text-orange-500">IQ</span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Premium custom packaging for modern Indian brands.
            </p>
          </div>

          <div className="flex gap-8 text-sm font-semibold text-slate-500">
            <a href="#">Instagram</a>
            <a href="#">WhatsApp</a>
            <a href="#">LinkedIn</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}