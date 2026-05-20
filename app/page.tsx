// app/page.tsx
import Navbar from "./mainPageComponents/Navbar";
import Hero from "./mainPageComponents/hero";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Renders your new Navbar at the top of this specific page */}
      <Navbar />

      {/* Your main dashboard / landing content starts here */}
      <main>
         <Hero />
      </main>
    </div>
  );
}