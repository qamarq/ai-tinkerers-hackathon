"use client";

import { useAtom } from "jotai";

import { ingredientsAtom, stepsAtom } from "../../atoms/cookingAtoms";

export function StepsWindow() {
  const [steps, setSteps] = useAtom(stepsAtom);
  const [ingredients] = useAtom(ingredientsAtom);

  const toggle = (id: number) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s)),
    );
  };

  const checkedCount = steps.filter((s) => s.checked).length;
  const currentStep = steps.find((s) => !s.checked);

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${(checkedCount / steps.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-white/40 shrink-0">
          {checkedCount}/{steps.length}
        </span>
      </div>
      <div className="space-y-1.5">
        {steps.map((step) => {
          const isCurrent = step.id === currentStep?.id;
          const stepIngredients = step.ingredientIds
            ?.map((id) => ingredients.find((ing) => ing.id === id))
            .filter(Boolean);

          return (
            <div key={step.id}>
              <button
                onClick={() => toggle(step.id)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  step.checked
                    ? "opacity-40"
                    : isCurrent
                      ? "bg-orange-500/15 border border-orange-400/30"
                      : "hover:bg-white/5"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-all ${
                    step.checked
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                        ? "bg-orange-500 text-white"
                        : "bg-white/10 text-white/50"
                  }`}
                >
                  {step.checked ? "✓" : step.id}
                </div>
                <div className="flex-1">
                  <span
                    className={`text-sm leading-snug block ${
                      step.checked
                        ? "text-white/40 line-through"
                        : isCurrent
                          ? "text-white font-medium"
                          : "text-white/70"
                    }`}
                  >
                    {step.text}
                  </span>
                  {stepIngredients && stepIngredients.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {stepIngredients.map((ing) => (
                        <span
                          key={ing!.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                            ing!.checked
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-orange-500/15 text-orange-300"
                          }`}
                        >
                          {ing!.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
