import { Onboarding } from '@/components/onboarding'
import { ThemeSwitcher } from '@/components/theme-switcher'
import React from 'react'

export default function Page() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      
      {/* Floating theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-sm">
        <Onboarding />
      </div>
    </div>
  )
}
