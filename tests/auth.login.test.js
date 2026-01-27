import { api } from "./testApp.js";

describe("AUTH – Login (Send OTP)", () => {
  it("should send OTP to registered email", async () => {
    const res = await api.post("/api/auth/login").send({
      email: "testuser@example.com",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should fail for unregistered user", async () => {
    const res = await api.post("/api/auth/login").send({
      email: "unknown@example.com",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
