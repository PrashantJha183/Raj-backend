import { api } from "./testApp.js";

let token;

beforeAll(async () => {
  token = "TEST_TOKEN";
});

describe("AUTH – Get Me", () => {
  it("should return logged-in user", async () => {
    const res = await api
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toBeDefined();
  });

  it("should fail without token", async () => {
    const res = await api.get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });
});
