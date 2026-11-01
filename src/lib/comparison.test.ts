import {
  categories,
  products,
} from "../data/products";
import {
  buildProductFromAiDraft,
  heuristicAnalyzeProductInput,
  heuristicSuggestCategories,
} from "./aiCurator";
import {
  analyzeComparison,
  calculatePriorityScore,
  getSpecPracticalExplanation,
} from "./comparison";
import assert from "node:assert/strict";
import test from "node:test";

test("notebooks comparison identifies best performance vs best cost-benefit and head-to-head winners", () => {
  const notebooks = products.filter((p) => p.category === "notebooks");
  assert.ok(notebooks.length >= 3, "Should have at least 3 notebooks to compare");

  const vivobook = notebooks.find((p) => p.id === "notebook-vivobook-ryzen7");
  const nitro = notebooks.find((p) => p.id === "notebook-acer-nitro-v15");
  const ideapad = notebooks.find((p) => p.id === "notebook-ideapad-slim3");

  assert.ok(vivobook && nitro && ideapad, "Core notebook models must exist");

  // 1. Custo-benefício analysis
  const cbAnalysis = analyzeComparison(
    [vivobook, nitro, ideapad],
    "custo-beneficio",
  );
  assert.ok(cbAnalysis);
  assert.equal(cbAnalysis.bestCostBenefit.id, "notebook-vivobook-ryzen7");
  assert.equal(cbAnalysis.bestPerformance.id, "notebook-acer-nitro-v15");
  assert.equal(cbAnalysis.lowestPrice.id, "notebook-ideapad-slim3");

  // Head-to-head winning labels
  assert.ok(
    cbAnalysis.winningSpecLabelsByProductId["notebook-acer-nitro-v15"].includes(
      "Placa de Vídeo (GPU)",
    ),
    "Acer Nitro V15 should win Placa de Vídeo (GPU)",
  );
  assert.ok(
    cbAnalysis.winningSpecLabelsByProductId["notebook-ideapad-slim3"].includes(
      "Menor Preço",
    ),
    "Lenovo IdeaPad Slim 3i should win Menor Preço",
  );

  // Practical explanation on every spec
  for (const spec of ideapad.specs) {
    const note = getSpecPracticalExplanation(spec);
    assert.ok(note.length > 15, `Spec ${spec.key} must have a practical explanation`);
  }

  // 2. Desempenho analysis must crown Acer Nitro V15 (RTX 4050)
  const perfAnalysis = analyzeComparison(
    [vivobook, nitro, ideapad],
    "desempenho",
  );
  assert.ok(perfAnalysis);
  assert.equal(perfAnalysis.winner.id, "notebook-acer-nitro-v15");
  assert.ok(
    perfAnalysis.specWinners["gpu"].includes("notebook-acer-nitro-v15"),
    "Acer Nitro V15 with RTX 4050 should win GPU spec row",
  );

  // 3. Economia analysis must crown Lenovo IdeaPad Slim 3i
  const econAnalysis = analyzeComparison(
    [vivobook, nitro, ideapad],
    "economia",
  );
  assert.ok(econAnalysis);
  assert.equal(econAnalysis.winner.id, "notebook-ideapad-slim3");
});

test("calculatePriorityScore adapts dynamically to priority mode", () => {
  const notebooks = products.filter((p) => p.category === "notebooks");
  const nitro = notebooks.find((p) => p.id === "notebook-acer-nitro-v15")!;
  const macbook = notebooks.find((p) => p.id === "notebook-macbook-air-m2")!;

  const macMobility = calculatePriorityScore(macbook, "mobilidade", notebooks);
  const nitroMobility = calculatePriorityScore(nitro, "mobilidade", notebooks);

  assert.ok(
    macMobility > nitroMobility,
    "MacBook Air M2 must score higher than gaming laptop on mobility & battery",
  );
});

test("AI product analyzer structures product link into ready-to-compare Product with usageNote and camera", () => {
  const draft = heuristicAnalyzeProductInput(
    "https://shopee.com.br/Notebook-Dell-Inspiron-15-Core-i5-16GB-SSD-512GB",
    3399,
  );
  assert.equal(draft.category, "notebooks");
  assert.ok(draft.idealFor.length > 10);
  assert.ok(draft.specs.some((s) => s.key === "processor"));
  assert.ok(draft.specs.some((s) => s.key === "gpu"));
  assert.ok(draft.specs.some((s) => s.key === "camera"));
  assert.ok(draft.specs.every((s) => Boolean(s.usageNote)));

  const built = buildProductFromAiDraft(
    draft,
    "https://afil.exemplo.com/dell-i15",
  );
  assert.equal(built.price, 3399);
  assert.equal(built.affiliateUrl, "https://afil.exemplo.com/dell-i15");
  assert.ok(built.image.startsWith("data:image/svg+xml"));
});

test("AI category advisor suggests new affiliate categories and product improvements", () => {
  const advice = heuristicSuggestCategories(products, categories);
  assert.ok(advice.newCategories.length >= 2);
  assert.ok(advice.productImprovements.length >= 2);
  assert.ok(advice.strategicSummary.length > 20);
});
