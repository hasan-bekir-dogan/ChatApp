const request = require("supertest");
const { app } = require("../app");

describe("access control", () => {
  const protectedEndpoints = [
    ["get", "/chat"],
    ["post", "/chat/detail"],
    ["post", "/chat/check-exist"],
    ["post", "/chat/search"],
    ["post", "/message/send"],
    ["delete", "/message/delete"],
    ["get", "/person/list"],
    ["post", "/person/create"],
    ["delete", "/person/delete"],
    ["get", "/profile"],
    ["put", "/profile/update"],
  ];

  it.each(protectedEndpoints)(
    "answers 401 for an anonymous %s %s",
    async (method, endpoint) => {
      const response = await request(app)[method](endpoint).send({});

      expect(response.status).toBe(401);
    }
  );

  it("redirects an anonymous visitor from the index page to the login page", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
  });

  it("renders a 404 page for an unknown route", async () => {
    const response = await request(app).get("/no-such-page");

    expect(response.status).toBe(404);
  });
});
