'use client';

import { useState, useEffect } from 'react';

const quotes = [
  "Breathe in peace, breathe out tension",
  "Each breath is a fresh beginning",
  "Find peace in the present moment",
  "Your mind is your sanctuary",
  "Silence is the language of the soul",
  "Let go of what you cannot control",
  "Peace comes from within",
  "In stillness, find your strength",
  "Every moment is a new opportunity",
  "Mindfulness is the path to peace"
];

export function QuoteDisplay() {
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      // Change quote after fade out
      setTimeout(() => {
        const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setCurrentQuote(prevQuote => 
          newQuote === prevQuote ? quotes[(quotes.indexOf(newQuote) + 1) % quotes.length] : newQuote
        );
        setIsAnimating(false);
      }, 1000);
    }, 8000); // Change quote every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-6">
      <p 
        className={`text-center text-xl md:text-2xl font-light text-white/90 
          transition-all duration-1000 ease-in-out
          ${isAnimating 
            ? 'opacity-0 transform -translate-y-4' 
            : 'opacity-100 transform translate-y-0'
          }
          backdrop-blur-sm bg-white/5 rounded-2xl p-6 shadow-lg
          border border-white/10 hover:border-white/20
        `}
      >
        "{currentQuote}"
      </p>
    </div>
  );
} 