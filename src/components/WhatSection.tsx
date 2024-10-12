// components/WhatSection.tsx
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const services = [
  { title: "Custom Website Development", description: "Tailored websites that reflect your brand and meet your specific needs." },
  { title: "Mobile Application Development", description: "Native and cross-platform mobile apps for iOS and Android." },
  { title: "Full-stack Web Applications", description: "Scalable and robust web applications with powerful backend systems." },
  { title: "E-commerce Solutions", description: "Online stores and marketplaces to boost your digital sales." },
]

export default function WhatSection() {
  return (
    <section className="w-full py-24 px-6 bg-secondary">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-foreground">What We Do</h2>
        <p className="text-xl text-center mb-16 text-muted-foreground">Software services, tailored solutions, and expert guidance for businesses.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-card hover:bg-card/90 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-2xl mb-2 text-foreground">{service.title}</CardTitle>
                <CardDescription className="text-muted-foreground">{service.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}