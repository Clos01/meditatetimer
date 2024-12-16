import { MeditationTimer } from "@/components/MeditationTimer";
import { QuoteDisplay } from "@/components/QuoteDisplay";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 flex flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-8 max-w-xl w-full">
        <h1 className="text-4xl font-light text-white/90 tracking-wide">
          Mindful Moments by Chey
        </h1>
        <QuoteDisplay />
        <MeditationTimer />
      </div>
    </div>
  );
}
