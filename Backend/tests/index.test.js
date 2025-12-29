const request = require("supertest");
const server = require("../app");
const db = require("../db");

describe("Index Routes", () => {
    // Test user credentials
    const testUser = {
        username: "testuser_" + Date.now(),
        password: "testpassword123",
        confirm_password: "testpassword123"
    };
    beforeAll(async () => {
        // Create test user
        await request(server)
            .post("/signup")
            .send(testUser);
    });

    afterAll((done) => {
        // Clean up test user
        db.run("DELETE FROM users WHERE username = ?", [testUser.username], done);
    });

    describe("GET /", () => {
        test("should redirect to landing page when not authenticated", async () => {
            const response = await request(server)
                .get("/")
                .expect(200);
            expect(response.text).toContain("login");
        });

        test("should redirect to index page when authenticated", async () => {
            //Authenticate User
            const loginResponse = await request(server)
                .post("/login/password")
                .send({
                    username: testUser.username,
                    password: testUser.password
                })
                .expect(302);

            const sessionCookie = loginResponse.headers["set-cookie"];

            // Debug - check if cookie exists
            expect(sessionCookie).toBeDefined();
            //Expect langing page
            const response = await request(server)
                .get("/")
                .set("Cookie", sessionCookie)
                .expect(200);
            expect(response.text).toContain(testUser.username);
        });
    });
});
