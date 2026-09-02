import {
  ArrowRight,
  Box,
  CheckCircle,
  Factory,
  ShieldCheck,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="bg-[#0B1020] text-white min-h-screen">
      
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div className="text-2xl font-bold tracking-wide">
          BOX<span className="text-blue-500">IQ</span>
        </div>

        <div className="hidden md:flex gap-8 text-sm text-gray-300">
          <a href="#">Products</a>
          <a href="#">Industries</a>
          <a href="#">Pricing</a>
          <a href="#">Contact</a>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 transition px-5 py-2 rounded-xl font-medium">
          Get Quote
        </button>
      </nav>

      <section className="max-w-7xl mx-auto px-8 pt-24 pb-20 grid lg:grid-cols-2 gap-16 items-center">
        
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-sm text-blue-300 mb-6">
            <Factory size={16} />
            Premium Industrial Packaging
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
            Packaging That Makes Your Brand Feel
            <span className="text-blue-500"> Premium</span>
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-xl">
            Custom corrugated packaging engineered for ecommerce,
            luxury retail, gifting, and modern Indian brands.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <button className="bg-blue-600 hover:bg-blue-700 px-7 py-4 rounded-2xl font-semibold flex items-center gap-2 transition">
              Get Instant Quote
              <ArrowRight size={18} />
            </button>

            <button className="border border-white/10 hover:border-white/30 px-7 py-4 rounded-2xl transition">
              View Samples
            </button>
          </div>

          <div className="flex gap-8 flex-wrap text-sm text-gray-400">
            <div>90% Repeat Orders</div>
            <div>2-3 Concurrent Jobs</div>
            <div>WhatsApp / Call / Notebook</div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>

          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop"
            alt="factory"
            className="relative rounded-3xl shadow-2xl border border-white/10"
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-blue-500/30 transition">
            <Box className="text-blue-500 mb-5" size={36} />

            <h3 className="text-2xl font-semibold mb-4">
              Custom Packaging
            </h3>

            <p className="text-gray-400 leading-relaxed">
              Fully customized rigid boxes, corrugated packaging,
              inserts, and premium product experiences.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-blue-500/30 transition">
            <ShieldCheck className="text-blue-500 mb-5" size={36} />

            <h3 className="text-2xl font-semibold mb-4">
              Enterprise Quality
            </h3>

            <p className="text-gray-400 leading-relaxed">
              Manufacturing-grade consistency with strict quality
              control and scalable production workflows.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-blue-500/30 transition">
            <CheckCircle className="text-blue-500 mb-5" size={36} />

            <h3 className="text-2xl font-semibold mb-4">
              Fast Dispatch
            </h3>

            <p className="text-gray-400 leading-relaxed">
              Optimized operations and nationwide logistics ensure
              fast production and reliable delivery timelines.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}