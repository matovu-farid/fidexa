// app/page.tsx
import WhySection from '@/components/WhySection'
import WhatSection from '@/components/WhatSection'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <WhySection />
      <WhatSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
