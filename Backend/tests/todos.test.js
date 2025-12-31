const request = require("supertest");
const server = require("../app");
const db = require("../db");

describe("Todos routes /todo", () => {
    // Test user credentials
    const testUser = {
        username: "testuser_" + Date.now(),
        password: "testpassword123",
        confirm_password: "testpassword123"
    };
    let sessionCookie;

    beforeAll(async () => {
        const signupResponse = await request(server)
            .post("/signup")
            .send(testUser);

        sessionCookie = signupResponse.headers["set-cookie"];
        expect(sessionCookie).toBeDefined();
    });

    describe("GET /new", () => {
        test("should redirect to login page when not logged in", async () => {
            const response = await request(server)
                .get("/todo/new")
                .expect("Location", "/login")
                .expect(302);
        });
        test("should render new form page when logged in", async () => {
            const response = await request(server)
                .get("/todo/new")
                .set("Cookie", sessionCookie)
                .expect(200);
        });
    });

    // Helper to look up a todo by title
    function findTodoByTitle(title) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM todos WHERE title = ?',
                [title],
                (err, row) => (err ? reject(err) : resolve(row))
            );
        });
    }

    describe("POST /create", () => {
        const title = `Test‑Todo-${Date.now()}`;

        afterEach(async () => {
            db.run('DELETE FROM todos WHERE title LIKE "Test‑Todo‑%"');
        });

        test("should redirect to login when not logged in", async () => {
            const response = await request(server)
                .post("/todo/create")
                .send({ title })
                .expect("Location", "/login")
                .expect(302);

            //Ensure new todo DID NOT persist in the DB
            const row = await findTodoByTitle(title);
            expect(row).toBeUndefined();
        });
        test("should redirect to home page when logged in", async () => {
            const response = await request(server)
                .post("/todo/create")
                .send({ title })
                .set("Cookie", sessionCookie)
                .expect("Location", "/")
                .expect(302);
            
            //Ensure new todo persisted in the DB
            const row = await findTodoByTitle(title);

            expect(row).toBeDefined();
            expect(row.title).toBe(title);
            expect(row.completed).toBe(0);
            expect(row.owner_id).toBeGreaterThan(0);
        });
    });

});