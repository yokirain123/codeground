import { Button } from '@/components/ui/shadcn/button'
import React from 'react'

function SignButton() {
  return (
    <div>
        <Button
        variant="default"
        className="group relative py-4 cursor-pointer overflow-hidden border bg-accent px-2 text-3xl text-black shadow-[4px_4px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        <span
          aria-hidden="true"
          className="absolute top-full left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
        />

        <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
          Sign up
        </span>
      </Button>
    </div>
  )
}

export default SignButton