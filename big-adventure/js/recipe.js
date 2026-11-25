import { FOODS } from './data.js';

export function startRecipe(foodId) {
  return { foodId, stepIndex: 0, done: false };
}

export function currentStep(progress) {
  if (progress.done) return null;
  return FOODS[progress.foodId].steps[progress.stepIndex] ?? null;
}

// Try one action in the kitchen. Only the exact action the current step asks
// for moves the recipe on; anything else changes nothing.
export function tryAction(progress, action = {}) {
  const step = currentStep(progress);
  const matches = step && (step.tap !== undefined
    ? action.tap === step.tap && action.drag === undefined
    : action.drag === step.drag && action.onto === step.onto && action.tap === undefined);
  if (!matches) return { progress, ok: false };
  const stepIndex = progress.stepIndex + 1;
  const done = stepIndex >= FOODS[progress.foodId].steps.length;
  return { progress: { ...progress, stepIndex, done }, ok: true };
}
