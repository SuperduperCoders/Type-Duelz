

// ...existing code...
import Image from "next/image";

export default function SubscriptionsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-slate-100 dark:from-black dark:to-gray-900 p-4 relative overflow-hidden">
      {/* Giant Rotated IN DEVELOPMENT Sign */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-20deg)',
          zIndex: 50,
          pointerEvents: 'none',
          opacity: 0.15,
          userSelect: 'none',
        }}
        className="select-none"
      >
        <span
          style={{
            fontSize: '7vw',
            color: '#dc2626', // Tailwind red-600
            fontWeight: 900,
            letterSpacing: '0.2em',
            textShadow: '0 2px 8px #0008',
            textTransform: 'uppercase',
          }}
        >
          IN DEVELOPMENT
        </span>
      </div>
      {/* ...existing code... */}
      <div className="flex flex-col items-center mb-8">
        <Image src="/favicon.ico" width={80} height={80} alt="TypeDuels Logo" className="mb-2" />
        <h1 className="text-4xl font-extrabold mb-2 text-center tracking-wide select-none">Subscriptions</h1>
        <p className="text-gray-600 text-center max-w-xl mb-4">Manage your TypeDuels subscription and access premium features.</p>
        <div className="flex gap-4 mt-2">
          
            <span className="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold border border-blue-700 hover:bg-blue-600 transition">Sign in</span>
          
          
            <span className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold border border-green-700 hover:bg-green-600 transition">Sign up</span>
          
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Manage Subscription</h2>
        
          <span className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-purple-700 transition">Manage your subscription</span>
        
      </div>
    </main>
  );
}
