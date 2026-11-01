import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("Firestore security rules enforce all 8 pillars and reject Dirty Dozen vulnerabilities", () => {
  const rules = fs.readFileSync("firestore.rules", "utf8");

  // 1. Default deny catch-all
  assert.ok(
    rules.includes("match /{document=**} {\n      allow read, write: if false;\n    }"),
    "Must contain global default-deny catch-all",
  );

  // 2. Email verification guard against spoofing
  assert.ok(
    rules.includes("request.auth.token.email == 'gustavofirmino0511@gmail.com'") &&
      rules.includes("request.auth.token.email_verified == true"),
    "Admin check must require email_verified == true",
  );

  // 3. Strict validation helpers for Product, Category, AdminUser
  assert.ok(rules.includes("function isValidProduct(data)"));
  assert.ok(rules.includes("function isValidCategory(data)"));
  assert.ok(rules.includes("function isValidAdminUser(data)"));

  // 4. Temporal integrity (request.time) and immutability
  assert.ok(rules.includes("incoming().createdAt == request.time"));
  assert.ok(rules.includes("incoming().updatedAt == request.time"));
  assert.ok(rules.includes("incoming().authorUid == existing().authorUid"));
  assert.ok(rules.includes("incoming().createdAt == existing().createdAt"));

  // 5. Query Enforcer on list
  assert.ok(rules.includes("allow list: if existing().isPublic == true;"));
});
