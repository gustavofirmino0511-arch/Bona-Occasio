import assert from "node:assert/strict";
import test from "node:test";
import {
  filterAndRankMinedDeals,
  parsePromobitDealsFromMarkdown,
  parseZoomDealsFromMarkdown,
} from "./dealMiner";

test("parsePromobitDealsFromMarkdown extracts live affordable deals under maxPrice", () => {
  const sampleMarkdown = `
[![Image 7: Imagem da oferta Fone De Ouvido Bluetooth Xiaomi Redmi Buds 6 Play Preto](https://i.promobit.com.br/120/831392805517937412427355526831.png) R$119,90 R$78,00 Fone De Ouvido Bluetooth Xiaomi Redmi Buds 6 Play Preto Mercado Livre 1 ![Image 8: Autor Clara](https://i.promobit.com.br/static/p/36/939.png) Clara há 3 h 0](https://www.promobit.com.br/oferta/fone-de-ouvido-bluetooth-xiaomi-redmi-buds-6-play-preto-3168905/)
[![Image 9: Imagem da oferta Fone Caro Topo de Linha](https://i.promobit.com.br/120/827.jpg) R$950,00 R$721,05 Fone Caro Amazon](https://www.promobit.com.br/oferta/fone-caro-123/)
  `;

  const under100 = parsePromobitDealsFromMarkdown(sampleMarkdown, 100);
  assert.equal(under100.length, 1);
  assert.equal(under100[0].price, 78);
  assert.equal(under100[0].originalPrice, 119.9);
  assert.equal(under100[0].brand, "Xiaomi");
  assert.equal(under100[0].storeName, "Mercado Livre");
  assert.ok(under100[0].discountPercent >= 30);
  assert.ok(under100[0].mercadoLivreSearchUrl.includes("mercadolivre.com.br"));
});

test("parseZoomDealsFromMarkdown extracts lowest-price items under maxPrice", () => {
  const sampleZoom = `
[![Image 6: Imagem de Fone Ouvido I12 Fone Bluetooth Touch I12 Recarregável - TWS](https://i.zst.com.br/thumbs/45/0/1b/-1378478803.jpg) ## Fone Ouvido I12 Fone Bluetooth Touch I12 Recarregável - TWS Via Magazine Luiza **R$ 42,50** 1% de volta](https://www.zoom.com.br/fone-de-ouvido-e-headset/fone-ouvido-i12)
  `;

  const under50 = parseZoomDealsFromMarkdown(sampleZoom, 50);
  assert.equal(under50.length, 1);
  assert.equal(under50[0].price, 42.5);
  assert.equal(under50[0].category, "audio");
});

test("filterAndRankMinedDeals enforces strict price ceiling and category/query filters", () => {
  const under50Deals = filterAndRankMinedDeals([], {
    maxPrice: 50,
    categoryFilter: "all",
  });

  assert.ok(under50Deals.length >= 3, "Should return multiple curated gems under R$ 50");
  for (const deal of under50Deals) {
    assert.ok(
      deal.price <= 50,
      `Deal ${deal.title} (${deal.price}) must be <= R$ 50`,
    );
    assert.ok(deal.bargainScore >= 85);
  }

  const audioUnder100 = filterAndRankMinedDeals([], {
    maxPrice: 100,
    categoryFilter: "audio",
  });
  assert.ok(audioUnder100.length >= 2);
  for (const deal of audioUnder100) {
    assert.equal(deal.category, "audio");
    assert.ok(deal.price <= 100);
  }
});
