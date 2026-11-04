import assert from "node:assert/strict";
import test from "node:test";
import {
  hashPasswordSha256,
  isSafePublicHttpUrl,
  sanitizeAffiliateUrl,
  sanitizeImageUrl,
  sanitizePlainText,
} from "./security";

test("isSafePublicHttpUrl allows valid external store links and blocks SSRF / internal IPs", () => {
  assert.equal(isSafePublicHttpUrl("https://meli.la/2YTze8J"), true);
  assert.equal(
    isSafePublicHttpUrl("https://www.mercadolivre.com.br/p/MLB123456"),
    true,
  );
  assert.equal(isSafePublicHttpUrl("http://localhost:3000/admin"), false);
  assert.equal(isSafePublicHttpUrl("http://127.0.0.1:8080/secret"), false);
  assert.equal(
    isSafePublicHttpUrl("http://169.254.169.254/latest/meta-data/"),
    false,
  );
  assert.equal(isSafePublicHttpUrl("http://192.168.1.1/router"), false);
  assert.equal(isSafePublicHttpUrl("http://10.0.0.1/internal"), false);
  assert.equal(isSafePublicHttpUrl("http://172.16.0.5/admin"), false);
  assert.equal(isSafePublicHttpUrl("javascript:alert(1)"), false);
  assert.equal(isSafePublicHttpUrl("https://user:pass@meli.la/2YTze8J"), false);
});

test("sanitizeAffiliateUrl enforces HTTPS and blocks XSS/protocol injection", () => {
  assert.equal(
    sanitizeAffiliateUrl("https://meli.la/2mHWbch"),
    "https://meli.la/2mHWbch",
  );
  assert.equal(
    sanitizeAffiliateUrl("http://meli.la/2mHWbch"),
    "https://meli.la/2mHWbch",
  );
  assert.equal(
    sanitizeAffiliateUrl("javascript:alert(document.cookie)"),
    "https://exemplo.com",
  );
  assert.equal(
    sanitizeAffiliateUrl("data:text/html,<script>alert(1)</script>"),
    "https://exemplo.com",
  );
  assert.equal(
    sanitizeAffiliateUrl("http://127.0.0.1:3000"),
    "https://exemplo.com",
  );
});

test("sanitizeImageUrl allows HTTPS and clean SVG data URIs while blocking malicious SVG scripts", () => {
  const validMlImage =
    "https://http2.mlstatic.com/D_NQ_NP_2X_760745-MLA95700724020_102025-F.webp";
  assert.equal(sanitizeImageUrl(validMlImage), validMlImage);

  const cleanSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'></svg>";
  assert.equal(sanitizeImageUrl(cleanSvg), cleanSvg);

  const xssSvg =
    "data:image/svg+xml;utf8,<svg onload=alert(1)><script>evil()</script></svg>";
  assert.equal(sanitizeImageUrl(xssSvg, "https://fallback.com/a.svg"), "https://fallback.com/a.svg");
});

test("sanitizePlainText strips dangerous script tags and event handlers", () => {
  const dirty =
    'Fone Anker <script>fetch("https://evil.com")</script> onclick=alert(1) Bluetooth 5.4';
  const clean = sanitizePlainText(dirty, 160);
  assert.ok(!clean.includes("<script>"));
  assert.ok(!clean.includes("onclick="));
  assert.ok(clean.includes("Fone Anker"));
  assert.ok(clean.includes("Bluetooth 5.4"));
});

test("hashPasswordSha256 produces deterministic 64-char hex digest and never exposes plaintext", async () => {
  const hash1 = await hashPasswordSha256("minhaSenhaForte2026");
  const hash2 = await hashPasswordSha256("minhaSenhaForte2026");
  const hashDiff = await hashPasswordSha256("outraSenha");

  assert.equal(hash1.length, 64);
  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hashDiff);
  assert.ok(!hash1.includes("minhaSenhaForte2026"));
});
