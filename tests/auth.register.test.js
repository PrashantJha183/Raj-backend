import { api } from "./testApp.js";

describe("AUTH – Register", () => {
  it("should register a new user", async () => {
    const res = await api.post("/api/auth/register").send({
      name: "Test User",
      email: "testuser@example.com",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should fail if user already exists", async () => {
    const res = await api.post("/api/auth/register").send({
      name: "Test User",
      email: "testuser@example.com",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
