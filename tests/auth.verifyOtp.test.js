import { api } from "./testApp.js";

describe("AUTH – Verify OTP", () => {
  it("should verify OTP and login", async () => {
    const res = await api.post("/api/auth/verify-otp").send({
      email: "testuser@example.com",
      otp: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });
});

if (process.env.NODE_ENV === "test") {
  return {
    accessToken: "TEST_TOKEN",
    refreshToken: "TEST_REFRESH",
    user,
  };
}
