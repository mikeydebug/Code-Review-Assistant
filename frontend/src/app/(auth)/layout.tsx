import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-transparent">
        {children}
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-950 items-center justify-center overflow-hidden">
        {/* The generated image */}
        <Image 
          src="/images/auth-hero.png" 
          alt="Abstract Tech Background" 
          fill 
          className="object-cover opacity-80"
          priority
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent"></div>
        
        <div className="relative z-10 p-12 text-center max-w-lg">
          <h2 className="text-4xl font-bold text-white mb-4">
            AI Code Reviewer
          </h2>
          <p className="text-lg text-indigo-200/80">
            Automate your code reviews, detect bugs early, and ask an AI assistant anything about your codebase.
          </p>
        </div>
      </div>
    </div>
  );
}
