import request from "supertest";
import app from "../../src/app";

describe("User API Endpoints (Supertests)", () => {

    // Test data
    const testUser = {
        email: "test@example.com",
        name: "Test User",
        username: "testuser"
    };

    const updateData = {
        name: "Updated Name",
        image: "https://example.com/image.jpg",
        bio: "This is a test bio"
    };

    // 1. Test POST /user - Create a new user
    describe("POST /user", () => {
        it("should create a new user with valid data", async () => {
            const res = await request(app)
                .post("/user")
                .send(testUser);

            expect(res.status).toBe(201);
            expect(res.body).not.toHaveProperty("id");
            expect(res.body.email).toBe(testUser.email);
            expect(res.body.name).toBe(testUser.name);
            expect(res.body.username).toBe(testUser.username);
        });

        it("should return 400 if required fields are missing", async () => {
            const res = await request(app)
                .post("/user")
                .send({
                    email: "test2@example.com",
                    // Missing name and username
                });

            expect(res.status).toBe(400);
        });

        it("should return 400 if email is invalid", async () => {
            const res = await request(app)
                .post("/user")
                .send({
                    email: "invalid-email",
                    name: "Test User",
                    username: "testuser2"
                });

            expect(res.status).toBe(400);
        });
    });

    // 2. Test GET /user - List all users
    describe("GET /user", () => {
        it("should return a list of all users", async () => {
            // First create a user to ensure there's data
            await request(app)
                .post("/user")
                .send(testUser);

            const res = await request(app)
                .get("/user");

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);

            // Users in the list should not contain IDs for security
            res.body.forEach((user: any) => {
                expect(user).not.toHaveProperty("id");
            });
        });
    });

    // 3. Test GET /user/:id - Get user by ID
    describe("GET /user/:id", () => {
        let testUserId: string;

        beforeAll(async () => {
            testUserId = "known-test-id";
        });

        it("should return a user by ID", async () => {
            const res = await request(app)
                .get(`/user/${testUserId}`);

            expect(res.status).toBe(200);
            expect(res.body).not.toHaveProperty("id");
            expect(res.body).toHaveProperty("email");
            expect(res.body).toHaveProperty("name");
            expect(res.body).toHaveProperty("bio");
            expect(res.body).toHaveProperty("image");
        });

        it("should return 404 for non-existent user ID", async () => {
            const res = await request(app)
                .get("/user/" + testUserId);

            expect(res.status).toBe(404);
        });
    });

    // 4. Test PUT /user/:id - Update user by ID
    describe("PUT /user/:id", () => {
        let testUserId: string;

        beforeAll(async () => {
            testUserId = "known-test-id";
        });

        it("should update a user with valid data", async () => {
            const res = await request(app)
                .put(`/user/${testUserId}`)
                .send(updateData);

            expect(res.status).toBe(200);
            expect(res.body).not.toHaveProperty("id");
            expect(res.body.name).toBe(updateData.name);
            expect(res.body.image).toBe(updateData.image);
            expect(res.body.bio).toBe(updateData.bio);
        });

        it("should update a user with partial data", async () => {
            const res = await request(app)
                .put(`/user/${testUserId}`)
                .send({
                    name: "Partially Updated Name"
                });

            expect(res.status).toBe(200);
            expect(res.body.name).toBe("Partially Updated Name");
        });

        it("should return 404 for non-existent user ID", async () => {
            const res = await request(app)
                .put(`/user/${testUserId}`)
                .send(updateData);

            expect(res.status).toBe(404);
        });
    });

    // 5. Test DELETE /user/:id - Delete user by ID
    describe("DELETE /user/:id", () => {
        let testUserId: string;

        beforeEach(async () => {
            testUserId = await createTestUserForDeletion();
        });

        it("should delete a user by ID", async () => {
            const res = await request(app)
                .delete(`/user/${testUserId}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message", "User deleted successfully");
        });

        it("should return 404 when trying to delete non-existent user", async () => {
            const res = await request(app)
                .delete("/user/nonexistent-id");

            expect(res.status).toBe(404);
        });
    });
});

async function createTestUserForDeletion() {
    return "test-user-id";
}
