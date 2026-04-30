import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Solutions from "@/components/Solutions";
import Products from "@/components/Products";
import Industries from "@/components/Industries";
import WhyDrishti, { About } from "@/components/WhyDrishti";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import ProtectedRoute from "@/components/ProtectedRoute";

function HomePage() {
  return (
    <div className="App bg-white text-[#00264d]" data-testid="home-page">
      <Header />
      <main>
        <Hero />
        <Solutions />
        <Products />
        <Industries />
        <WhyDrishti />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
  );
}

export default App;
