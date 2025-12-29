const request = require("supertest");
const server = require("../app");
const db = require("../db");

describe("Auth Routes", () => {
  // Test user credentials
  const testUser = {
    username: "testuser_" + Date.now(),
    password: "testpassword123",
    confirm_password: "testpassword123"
  };

  afterAll((done) => {
    // Clean up test user
    db.run("DELETE FROM users WHERE username = ?", [testUser.username], () => {
      db.close();
      server.close(done);
    });
  });

  describe("GET /login", () => {
    test("should render login page for unauthenticated users", async () => {
      const response = await request(server)
        .get("/login")
        .expect(200);
      
      expect(response.text).toContain("login");
    });

    test("should redirect authenticated users to home", async () => {
      // First, sign up
      const signupRes = await request(server)
        .post("/signup")
        .send(testUser);
      
      const cookie = signupRes.headers["set-cookie"];

      // Try to access login page while authenticated
      const response = await request(server)
        .get("/login")
        .set("Cookie", cookie)
        .expect(302)
        .expect("Location", "/");
    });
  });

  describe("POST /login/password", () => {
    beforeAll(async () => {
      // Create a test user for login tests
      await request(server)
        .post("/signup")
        .send(testUser);
    });

    test("should login with correct credentials", async () => {
      const response = await request(server)
        .post("/login/password")
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect(302)
        .expect("Location", "/");
      
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    test("should fail login with incorrect password", async () => {
      const response = await request(server)
        .post("/login/password")
        .send({
          username: testUser.username,
          password: "wrongpassword"
        })
        .expect(302)
        .expect("Location", "/login");
    });

    test("should fail login with non-existent username", async () => {
      const response = await request(server)
        .post("/login/password")
        .send({
          username: "nonexistent_user",
          password: "somepassword"
        })
        .expect(302)
        .expect("Location", "/login");
    });

    test("should fail login with missing credentials", async () => {
      const response = await request(server)
        .post("/login/password")
        .send({})
        .expect(302)
        .expect("Location", "/login");
    });
  });

  describe("GET /signup", () => {
    test("should render signup page for unauthenticated users", async () => {
      const response = await request(server)
        .get("/signup")
        .expect(200);
      
      expect(response.text).toContain("signup");
    });

    test("should redirect authenticated users to home", async () => {
      // Login first
      const loginRes = await request(server)
        .post("/login/password")
        .send({
          username: testUser.username,
          password: testUser.password
        });
      
      const cookie = loginRes.headers["set-cookie"];

      // Try to access signup page while authenticated
      const response = await request(server)
        .get("/signup")
        .set("Cookie", cookie)
        .expect(302)
        .expect("Location", "/");
    });
  });

  describe("POST /signup", () => {
    test("should create a new user with valid data", async () => {
      const newUser = {
        username: "newuser_" + Date.now(),
        password: "password123",
        confirm_password: "password123"
      };

      const response = await request(server)
        .post("/signup")
        .send(newUser)
        .expect(302)
        .expect("Location", "/");
      
      // Should set session cookie
      expect(response.headers["set-cookie"]).toBeDefined();

      // Clean up
      db.run("DELETE FROM users WHERE username = ?", [newUser.username]);
    });

    test("should fail when passwords do not match", async () => {
      const response = await request(server)
        .post("/signup")
        .send({
          username: "testuser2",
          password: "password123",
          confirm_password: "password456"
        })
        .expect(302)
        .expect("Location", "/signup");
    });

    test("should fail with duplicate username", async () => {
      const duplicateUser = {
        username: testUser.username,
        password: "password123",
        confirm_password: "password123"
      };

      const response = await request(server)
        .post("/signup")
        .send(duplicateUser)
        .expect(500); // Should return error
    });

    test("should fail with missing fields", async () => {
      const response = await request(server)
        .post("/signup")
        .send({
          username: "testuser3"
          // missing password fields
        })
        .expect(500); // Server error due to missing required fields
    });
  });

  describe("POST /logout", () => {
    test("should logout authenticated user", async () => {
      // Login first
      const loginRes = await request(server)
        .post("/login/password")
        .send({
          username: testUser.username,
          password: testUser.password
        });
      
      const cookie = loginRes.headers["set-cookie"];

      // Logout
      const response = await request(server)
        .post("/logout")
        .set("Cookie", cookie)
        .expect(302)
        .expect("Location", "/");
    });

    test("should handle logout for unauthenticated user", async () => {
      const response = await request(server)
        .post("/logout")
        .expect(302)
        .expect("Location", "/");
    });
  });

  describe("Authentication Flow Integration", () => {
    test("should complete full signup -> logout -> login cycle", async () => {
      const cycleUser = {
        username: "cycleuser_" + Date.now(),
        password: "password123",
        confirm_password: "password123"
      };

      // 1. Signup
      const signupRes = await request(server)
        .post("/signup")
        .send(cycleUser)
        .expect(302)
        .expect("Location", "/");
      
      let cookie = signupRes.headers["set-cookie"];
      expect(cookie).toBeDefined();

      // 2. Logout
      const logoutRes = await request(server)
        .post("/logout")
        .set("Cookie", cookie)
        .expect(302)
        .expect("Location", "/");

      // 3. Login again
      const loginRes = await request(server)
        .post("/login/password")
        .send({
          username: cycleUser.username,
          password: cycleUser.password
        })
        .expect(302)
        .expect("Location", "/");
      
      expect(loginRes.headers["set-cookie"]).toBeDefined();

      // Clean up
      db.run("DELETE FROM users WHERE username = ?", [cycleUser.username]);
    });
  });
});
