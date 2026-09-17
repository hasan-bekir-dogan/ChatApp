const request = require("supertest");
const { app } = require("../app");

const DEFAULT_PASSWORD = "sup3rsecret";

/**
 * Registers a user and returns a supertest agent that keeps the session
 * cookie, so the returned agent is authenticated for later requests.
 */
async function signIn(agent, { name, email, password = DEFAULT_PASSWORD }) {
  await agent
    .post("/users/signup")
    .type("form")
    .send({ name, email, password, confirmPassword: password });

  await agent.post("/users/login").type("form").send({ email, password });

  return agent;
}

function newAgent() {
  return request.agent(app);
}

module.exports = { signIn, newAgent, DEFAULT_PASSWORD };
