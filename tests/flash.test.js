const flash = require("../middlewares/flash");

function requestWithSession() {
  const req = { session: {} };

  flash()(req, {}, () => {});

  return req;
}

describe("flash middleware", () => {
  it("queues a message and reports the queue length", () => {
    const req = requestWithSession();

    expect(req.flash("error", "first")).toBe(1);
    expect(req.flash("error", "second")).toBe(2);
  });

  it("returns the messages of one type and clears them", () => {
    const req = requestWithSession();

    req.flash("error", "boom");
    req.flash("info", "hello");

    expect(req.flash("error")).toEqual(["boom"]);
    expect(req.flash("error")).toEqual([]);
    expect(req.flash("info")).toEqual(["hello"]);
  });

  it("returns every type at once and clears them", () => {
    const req = requestWithSession();

    req.flash("error", "boom");
    req.flash("info", "hello");

    expect(req.flash()).toEqual({ error: ["boom"], info: ["hello"] });
    expect(req.flash()).toEqual({});
  });

  it("accepts an array of messages", () => {
    const req = requestWithSession();

    expect(req.flash("error", ["one", "two"])).toBe(2);
    expect(req.flash("error")).toEqual(["one", "two"]);
  });

  it("returns an empty list for a type that was never used", () => {
    expect(requestWithSession().flash("nothing")).toEqual([]);
  });

  it("keeps an existing flash implementation in place", () => {
    const existing = () => "existing";
    const req = { session: {}, flash: existing };

    flash()(req, {}, () => {});

    expect(req.flash).toBe(existing);
  });

  it("refuses to run without a session", () => {
    const req = {};

    flash()(req, {}, () => {});

    expect(() => req.flash("error", "boom")).toThrow("req.flash() requires a session.");
  });
});
