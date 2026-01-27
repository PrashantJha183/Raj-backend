import { api } from "./testApp.js";

describe("AUTH – Refresh Token", () => {
  it("should refresh access token", async () => {
    const res = await api.post("/api/auth/refresh").send({
      refreshToken: "TEST_REFRESH",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });
});
