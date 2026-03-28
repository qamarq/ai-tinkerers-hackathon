"use client";

import { useAtom } from "jotai";

import { ingredientsAtom, stepsAtom } from "../atoms/cookingAtoms";

interface CookingFinishProps {
  onRestart: () => void;
}

export function CookingFinish({ onRestart }: CookingFinishProps) {
  const [ingredients] = useAtom(ingredientsAtom);
  const [steps] = useAtom(stepsAtom);

  const completedIngredients = ingredients.filter((i) => i.checked).length;
  const completedSteps = steps.filter((s) => s.checked).length;
  const allStepsCompleted = completedSteps === steps.length;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-lg mx-4">
        {/* Success icon */}
        <div className="text-center mb-8 animate-in zoom-in duration-700">
          <div className="text-8xl mb-4 drop-shadow-2xl">
            {allStepsCompleted ? "🎉" : "👨‍🍳"}
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight mb-2">
            {allStepsCompleted ? "Bon Appétit!" : "Cooking Session Ended"}
          </h1>
          <p className="text-white/40 text-lg">
            {allStepsCompleted
              ? "You've completed all steps! Enjoy your meal."
              : "You can always come back and continue cooking."}
          </p>
        </div>

        {/* Stats card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/60 mb-6 animate-in slide-in-from-bottom duration-700 delay-200">
          <h2 className="text-xl font-semibold text-white mb-6">
            Session Summary
          </h2>

          <div className="space-y-4">
            {/* Steps progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Cooking Steps</span>
                <span className="text-white font-mono font-semibold">
                  {completedSteps}/{steps.length}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(completedSteps / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Ingredients progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Ingredients Used</span>
                <span className="text-white font-mono font-semibold">
                  {completedIngredients}/{ingredients.length}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all duration-1000"
                  style={{
                    width: `${(completedIngredients / ingredients.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Achievement badge */}
          {allStepsCompleted && (
            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-400/20 rounded-2xl animate-in fade-in duration-700 delay-500">
              <div className="flex items-center gap-3">
                <div className="text-3xl">✨</div>
                <div>
                  <p className="text-emerald-300 font-semibold text-sm">
                    Achievement Unlocked!
                  </p>
                  <p className="text-emerald-400/70 text-xs">
                    Perfect Carbonara Chef
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 animate-in slide-in-from-bottom duration-700 delay-300">
          <button
            onClick={onRestart}
            className="flex-1 relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-4 rounded-2xl text-base transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10">🍳 Start New Session</span>
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium rounded-2xl text-base transition-all duration-200 border border-white/20"
          >
            Home
          </button>
        </div>

        {/* Tips */}
        {allStepsCompleted && (
          <div className="mt-8 text-center animate-in fade-in duration-700 delay-700">
            <p className="text-white/30 text-sm mb-2">💡 Pro Tip</p>
            <p className="text-white/50 text-sm">
              Serve immediately while hot. The residual heat will keep melting
              the cheese perfectly!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
