import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Solutions from "@/components/Solutions";
import Industries from "@/components/Industries";
import WhyDrishti, { About } from "@/components/WhyDrishti";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

function HomePage() {
  return (
    <div className="App bg-white text-[#00264d]" data-testid="home-page">
      <Header />
      <main>
        <Hero />
        <Solutions />
        <Industries />
        <WhyDrishti />
        <About />
        <Contact />
      </main>
      <Footer />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
