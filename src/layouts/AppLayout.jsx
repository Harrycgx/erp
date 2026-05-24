import { Outlet } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#0B1020] text-white">
      <Navbar />
      <main className="pt-28">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
