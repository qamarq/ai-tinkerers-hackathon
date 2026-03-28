"use client";

import { useAtom } from "jotai";

import { ingredientsAtom } from "../../atoms/cookingAtoms";

export function IngredientsWindow() {
  const [ingredients, setIngredients] = useAtom(ingredientsAtom);

  const toggle = (id: string) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, checked: !ing.checked } : ing,
      ),
    );
  };

  const checkedCount = ingredients.filter((i) => i.checked).length;

  return (
    <div className="p-3">
      <div className="text-xs text-white/40 mb-3 px-1">
        {checkedCount}/{ingredients.length} ready
      </div>
      <div className="space-y-1">
        {ingredients.map((ing) => (
          <button
            key={ing.id}
            onClick={() => toggle(ing.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
              ing.checked
                ? "opacity-50 line-through"
                : "hover:bg-white/8 active:bg-white/15"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                ing.checked
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-white/30"
              }`}
            >
              {ing.checked && (
                <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-white">
                  <path
                    d="M1.5 5 L4 7.5 L8.5 2"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              )}
            </div>
            <span className="text-white/85 text-sm flex-1">{ing.name}</span>
            <span className="text-white/35 text-xs">{ing.amount}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
