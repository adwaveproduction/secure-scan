
import React from "react";
import MainLayout from "@/layouts/MainLayout";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ProductShowcase from "@/components/ProductShowcase";
import Contact from "@/components/Contact";

const Index: React.FC = () => {
  return (
    <MainLayout>
      <Hero />
      <Features />
      <ProductShowcase />
      <Contact />
    </MainLayout>
  );
};

export default Index;
