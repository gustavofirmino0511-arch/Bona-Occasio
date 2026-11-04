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
import type { Product } from "../types/product";
import assert from "node:assert/strict";
import test from "node:test";

test("catalog contains ONLY real affiliate products and zero fake example links", () => {
  assert.equal(products.length, 2, "Should contain only the 2 real earphones");
  for (const p of products) {
    assert.ok(
      !p.affiliateUrl.includes("exemplo.com") && p.affiliateUrl !== "#",
      `Product ${p.id} must have a real affiliate URL`,
    );
  }
});

test("real earphones comparison identifies best performance vs lowest price and head-to-head winners", () => {
  const p30i = products.find((p) => p.id === "audio-anker-soundcore-p30i");
  const eletric = products.find((p) => p.id === "audio-eletric-teck-usbc");

  assert.ok(p30i && eletric, "Both real earphone models must exist");

  const cbAnalysis = analyzeComparison([p30i, eletric], "custo-beneficio");
  assert.ok(cbAnalysis);
  assert.equal(cbAnalysis.bestCostBenefit.id, "audio-anker-soundcore-p30i");
  assert.equal(cbAnalysis.bestPerformance.id, "audio-anker-soundcore-p30i");
  assert.equal(cbAnalysis.lowestPrice.id, "audio-eletric-teck-usbc");

  assert.ok(
    cbAnalysis.winningSpecLabelsByProductId["audio-anker-soundcore-p30i"].includes(
      "Cancelamento de Ruído (ANC)",
    ),
    "Soundcore P30i should win Cancelamento de Ruído (ANC)",
  );
  assert.ok(
    cbAnalysis.winningSpecLabelsByProductId["audio-eletric-teck-usbc"].includes(
      "Menor Preço",
    ),
    "Eletric Teck USB-C should win Menor Preço",
  );

  for (const spec of p30i.specs) {
    const note = getSpecPracticalExplanation(spec);
    assert.ok(note.length > 15, `Spec ${spec.key} must have a practical explanation`);
  }

  const econAnalysis = analyzeComparison([p30i, eletric], "economia");
  assert.ok(econAnalysis);
  assert.equal(econAnalysis.winner.id, "audio-eletric-teck-usbc");
});

test("calculatePriorityScore adapts dynamically to priority mode", () => {
  const highMobility: Product = {
    ...products[0],
    id: "test-mob",
    price: 250,
    metrics: {
      performance: 80,
      costBenefit: 85,
      battery: 98,
      mobility: 98,
      buildQuality: 90,
    },
  };
  const heavyPerf: Product = {
    ...products[0],
    id: "test-perf",
    price: 250,
    metrics: {
      performance: 98,
      costBenefit: 85,
      battery: 60,
      mobility: 60,
      buildQuality: 90,
    },
  };

  const mobScoreA = calculatePriorityScore(highMobility, "mobilidade", [
    highMobility,
    heavyPerf,
  ]);
  const mobScoreB = calculatePriorityScore(heavyPerf, "mobilidade", [
    highMobility,
    heavyPerf,
  ]);

  assert.ok(
    mobScoreA > mobScoreB,
    "High battery/mobility product must score higher on mobility mode",
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
    "https://meli.la/real-dell",
  );
  assert.equal(built.price, 3399);
  assert.equal(built.affiliateUrl, "https://meli.la/real-dell");
  assert.ok(built.image.startsWith("data:image/svg+xml"));
});

test("AI category advisor suggests new affiliate categories and product improvements", () => {
  const advice = heuristicSuggestCategories(products, categories);
  assert.ok(advice.newCategories.length >= 2);
  assert.ok(advice.productImprovements.length >= 2);
  assert.ok(advice.strategicSummary.length > 20);
});

test("meli.la USB-C earphone with compatibility text is classified as audio with real brand, price, and photo", () => {
  const title =
    "Fones De Ouvido Usb-c Tipo C Com Microfone Integrado Som Estéreo Alta Qualidade Controle Chamadas Compatível Com iPhone 15 16 17 18 Android Samsung Xiaomi Motorola PLUG & PLAY Premium Eletric Teck";
  const draft = heuristicAnalyzeProductInput(title, undefined, {
    originalUrl: "https://meli.la/2mHWbch",
    title,
    detectedPrice: 22.3,
    detectedOriginalPrice: 59.99,
    detectedBrand: "ELETRIC TECK",
    imageUrl:
      "https://http2.mlstatic.com/D_NQ_NP_2X_693659-MLA113618776783_062026-F.webp",
  });

  assert.equal(draft.category, "audio");
  assert.equal(draft.brand, "Eletric Teck");
  assert.equal(draft.price, 22.3);
  assert.equal(draft.originalPrice, 59.99);
  assert.equal(
    draft.image,
    "https://http2.mlstatic.com/D_NQ_NP_2X_693659-MLA113618776783_062026-F.webp",
  );
  assert.ok(draft.metrics.costBenefit >= 88);
});

test("meli.la Anker Soundcore P30i Bluetooth 5.4 ANC is analyzed without mid-word truncation and compared head-to-head", () => {
  const title =
    "Fone de Ouvido Bluetooth 5.4 soundcore P30i da Anker, Cancelamento de Ruído Adaptativo, Graves Poderosos, 45H de Reprodução, Estojo 2-em-1 com Suporte para Celular, IP54, Fone sem fio TWS, Preto";
  const draft = heuristicAnalyzeProductInput(title, undefined, {
    originalUrl: "https://meli.la/2YTze8J",
    title,
    detectedPrice: 199.5,
    detectedOriginalPrice: 389,
    detectedBrand: "Soundcore",
    imageUrl:
      "https://http2.mlstatic.com/D_NQ_NP_2X_760745-MLA95700724020_102025-F.webp",
  });

  assert.equal(draft.category, "audio");
  assert.equal(draft.brand, "Soundcore");
  assert.equal(draft.price, 199.5);
  assert.equal(draft.originalPrice, 389);
  assert.ok(
    !draft.name.endsWith("Cancelamen"),
    `Product name should not truncate mid-word: ${draft.name}`,
  );
  assert.ok(
    draft.shortName.toLowerCase().includes("p30i") ||
      draft.shortName.toLowerCase().includes("soundcore"),
    `shortName should preserve model/brand: ${draft.shortName}`,
  );

  const p30i = products.find((p) => p.id === "audio-anker-soundcore-p30i");
  const eletric = products.find((p) => p.id === "audio-eletric-teck-usbc");
  assert.ok(p30i && eletric, "Both user affiliate audio products must exist in catalog");

  const audioComparison = analyzeComparison([p30i, eletric], "desempenho");
  assert.ok(audioComparison);
  assert.equal(audioComparison.bestPerformance.id, "audio-anker-soundcore-p30i");
  assert.equal(audioComparison.lowestPrice.id, "audio-eletric-teck-usbc");
});
