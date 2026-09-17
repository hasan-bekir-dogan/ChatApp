const { asString, asObjectId, escapeRegExp } = require("../utils/query");

describe("query helpers", () => {
  describe("asString", () => {
    it("trims a string", () => {
      expect(asString("  hello  ")).toBe("hello");
    });

    it("discards anything that is not a string", () => {
      expect(asString({ $ne: null })).toBe("");
      expect(asString(["a"])).toBe("");
      expect(asString(undefined)).toBe("");
      expect(asString(42)).toBe("");
    });
  });

  describe("asObjectId", () => {
    it("accepts a well formed id", () => {
      expect(asObjectId("507f1f77bcf86cd799439011")).toBe("507f1f77bcf86cd799439011");
    });

    it("returns null for anything else", () => {
      expect(asObjectId("not-an-id")).toBeNull();
      expect(asObjectId({ $gt: "" })).toBeNull();
      expect(asObjectId(null)).toBeNull();
    });
  });

  describe("escapeRegExp", () => {
    it("escapes regex metacharacters", () => {
      expect(escapeRegExp("a.*b")).toBe("a\\.\\*b");
      expect(escapeRegExp("(a|b)+")).toBe("\\(a\\|b\\)\\+");
    });

    it("builds a pattern that matches the literal text only", () => {
      const pattern = new RegExp(escapeRegExp(".*"), "i");

      expect(pattern.test("anything")).toBe(false);
      expect(pattern.test("a.*b")).toBe(true);
    });
  });
});
