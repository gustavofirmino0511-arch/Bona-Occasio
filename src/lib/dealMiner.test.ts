import assert from "node:assert/strict";
import test from "node:test";
import { heuristicAnalyzeProductInput } from "./aiCurator";
import {
  filterAndRankMinedDeals,
  parseAmazonBestsellersFromMarkdown,
  parseBuscapeDealsFromMarkdown,
  parsePromobitDealsFromMarkdown,
  parseZoomDealsFromMarkdown,
} from "./dealMiner";

test("parsePromobitDealsFromMarkdown extracts live affordable deals under maxPrice and filters out old deals", () => {
  const sampleMarkdown = `
[![Image 7: Imagem da oferta Fone De Ouvido Bluetooth Xiaomi Redmi Buds 6 Play Preto](https://i.promobit.com.br/120/831392805517937412427355526831.png) R$119,90 R$78,00 Fone De Ouvido Bluetooth Xiaomi Redmi Buds 6 Play Preto Mercado Livre 1 ![Image 8: Autor Clara](https://i.promobit.com.br/static/p/36/939.png) Clara há 3 h 0](https://www.promobit.com.br/oferta/fone-de-ouvido-bluetooth-xiaomi-redmi-buds-6-play-preto-3168905/)
[![Image 8: Imagem da oferta Fone Antigo Expirado](https://i.promobit.com.br/120/827.jpg) R$99,00 R$49,00 Fone Antigo Expirado Amazon há 12 dias](https://www.promobit.com.br/oferta/fone-antigo-111/)
[![Image 9: Imagem da oferta Fone Caro Topo de Linha](https://i.promobit.com.br/120/827.jpg) R$950,00 R$721,05 Fone Caro Amazon](https://www.promobit.com.br/oferta/fone-caro-123/)
  `;

  const under100 = parsePromobitDealsFromMarkdown(sampleMarkdown, 100);
  assert.equal(under100.length, 1);
  assert.equal(under100[0].price, 78);
  assert.equal(under100[0].originalPrice, 119.9);
  assert.equal(under100[0].brand, "Xiaomi");
  assert.equal(under100[0].storeName, "Mercado Livre");
  assert.equal(under100[0].recencyLabel, "Postada há 3h");
  assert.ok(under100[0].discountPercent >= 30);
  assert.ok(under100[0].mercadoLivreSearchUrl.includes("mercadolivre.com.br"));
});

test("parseZoomDealsFromMarkdown and parseBuscapeDealsFromMarkdown extract store count and Oferta do Dia", () => {
  const sampleZoom = `
[![Image 6: Imagem de Fone Ouvido I12 Fone Bluetooth Touch I12 Recarregável - TWS](https://i.zst.com.br/thumbs/45/0/1b/-1378478803.jpg) **Oferta do dia** ## Fone Ouvido I12 Fone Bluetooth Touch I12 Recarregável - TWS Via Magazine Luiza **R$ 42,50** Compare em 4 lojas](https://www.zoom.com.br/fone-de-ouvido-e-headset/fone-ouvido-i12)
  `;
  const sampleBuscape = `
[![Image 5: Imagem de Tênis Masculino Olympikus Beats](https://i.zst.com.br/thumbs/45/30/36/-1318867415.jpg) **Oferta do dia** ## Tênis Masculino Olympikus Beats Via Magazine Luiza **R$ 139,50** Compare em 3 lojas](https://www.buscape.com.br/tenis/tenis-masculino-olympikus-beats)
  `;

  const under50 = parseZoomDealsFromMarkdown(sampleZoom, 50);
  assert.equal(under50.length, 1);
  assert.equal(under50[0].price, 42.5);
  assert.equal(under50[0].category, "audio");
  assert.ok(under50[0].radarSources?.[0].includes("4 lojas"));

  const buscapeDeals = parseBuscapeDealsFromMarkdown(sampleBuscape, 150);
  assert.equal(buscapeDeals.length, 1);
  assert.equal(buscapeDeals[0].price, 139.5);
  assert.equal(buscapeDeals[0].category, "moda");
  assert.ok(buscapeDeals[0].radarSources?.[0].includes("Buscapé"));
});

test("parseAmazonBestsellersFromMarkdown extracts hourly bestsellers with rank and reviews while skipping supermarket disposables", () => {
  const sampleAmazon = `
1. #1 [![Image 4: Detergente em Pó Ypê 1Kg](https://images-na.ssl-images-amazon.com/images/I/61Wa.jpg)](https://www.amazon.com.br/dp/B01) [_4,8 de 5 estrelas_ 9.100](https://www.amazon.com.br/product-reviews/B01) [R$14,90](https://www.amazon.com.br/dp/B01)
2. #2 [![Image 5: Mixer de mão Electrolux Preto 400W com Tecnologia TruFlow EIB05](https://images-na.ssl-images-amazon.com/images/I/41a6B611m5L._AC_UL600_SR600,400_.jpg)](https://www.amazon.com.br/Electrolux-EIB05/dp/B0CZMDXZ72) [_4,8 de 5 estrelas_ 333](https://www.amazon.com.br/product-reviews/B0CZMDXZ72) [R$119,90](https://www.amazon.com.br/Electrolux-EIB05/dp/B0CZMDXZ72)
  `;

  const bestsellers = parseAmazonBestsellersFromMarkdown(sampleAmazon, 150, "casa");
  assert.equal(bestsellers.length, 1);
  assert.equal(bestsellers[0].brand, "Electrolux");
  assert.equal(bestsellers[0].price, 119.9);
  assert.ok(bestsellers[0].radarSources?.[0].includes("#2"));
  assert.ok(bestsellers[0].trendingSignal?.includes("333 avaliações"));
});

test("filterAndRankMinedDeals returns ~20+ deals for every category including Casa and Moda", () => {
  for (const cat of ["all", "casa", "moda", "audio", "perifericos"] as const) {
    const deals = filterAndRankMinedDeals([], {
      maxPrice: 150,
      categoryFilter: cat,
    });
    assert.ok(
      deals.length >= 18,
      `Category ${cat} should have at least 18 deals to allow '5 visible + Mostrar mais', got ${deals.length}`,
    );
    if (cat !== "all") {
      for (const d of deals) {
        assert.equal(d.category, cat);
      }
    }
  }
});

test("filterAndRankMinedDeals handles Móveis, Cortinas, Cobertor, Coberta, Roupa de Cama, Tênis, Camisa queries", () => {
  const searchTerms = [
    "móveis",
    "móveis para casa",
    "cortinas",
    "cobertor",
    "coberta",
    "roupa de cama",
    "tênis",
    "camisa",
  ];

  for (const term of searchTerms) {
    const results = filterAndRankMinedDeals([], {
      maxPrice: 150,
      categoryFilter: "all",
      query: term,
    });
    assert.ok(
      results.length >= 10,
      `Search query "${term}" should return at least 10 options, got ${results.length}`,
    );
  }
});

test("heuristicAnalyzeProductInput classifies Moda and Casa/Móveis/Cama items accurately", () => {
  const sneakerDraft = heuristicAnalyzeProductInput(
    "Tênis Olympikus Corrida e Caminhada Masculino e Feminino Amortecimento EVASense",
    99.9,
  );
  assert.equal(sneakerDraft.category, "moda");
  assert.ok(sneakerDraft.specs.length >= 4);

  const curtainDraft = heuristicAnalyzeProductInput(
    "Cortina Blackout Corta Luz 2,80m x 1,80m Com Ilhós Sala e Quarto",
    49.9,
  );
  assert.equal(curtainDraft.category, "casa");
  assert.ok(curtainDraft.specs.length >= 4);
});
