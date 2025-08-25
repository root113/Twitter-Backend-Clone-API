import request from "supertest";
import app from "../../src/app";

describe("Tweet API Endpoints", () => {
    let createdTweetId: any;
    let testUserId: any;

    // Test data
    const testUser = {
        email: "testuser@example.com",
        name: "Test User",
        username: "testuser"
    };

    const testTweet = {
        content: "This is a test tweet",
        image: "https://example.com/image.jpg",
        userId: "" // Will be set after user creation
    };

    const updateData = {
        content: "Updated tweet content",
        image: "https://example.com/updated-image.jpg"
    };

    // Setup: Create a user first since tweets require a userId
    beforeAll(async () => {
        // Create a user for testing (using your user creation endpoint)
        const userRes = await request(app)
            .post("/user")
            .send(testUser);
    
        testUserId = "test-user-id"; // This would come from your test setup
        testTweet.userId = testUserId;
    });

    // 1. Test POST /tweet - Create a new tweet
    describe("POST /tweet", () => {
        it("should create a new tweet with valid data", async () => {
            const res = await request(app)
                .post("/tweet")
                .send(testTweet);

            expect(res.status).toBe(201);
            expect(res.body).not.toHaveProperty("id");
            expect(res.body.content).toBe(testTweet.content);
            expect(res.body.image).toBe(testTweet.image);
            
            createdTweetId = res.body.id;
        });

        it("should return 400 if required fields are missing", async () => {
            const res = await request(app)
                .post("/tweet")
                .send({
                    content: "Missing user ID",
                    // Missing userId
                });

            expect(res.status).toBe(400);
        });

        it("should return 400 if content is too long", async () => {
            const longContent = "a".repeat(281); // 280 character limit

            const res = await request(app)
                .post("/tweet")
                .send({
                    content: longContent,
                    userId: testUserId
            });

            expect(res.status).toBe(400);
        });
    });

    // 2. Test GET /tweet - List all tweets
    describe("GET /tweet", () => {
        it("should return a list of all tweets", async () => {
            const res = await request(app)
                .get("/tweet");

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it("should filter tweets by userId when query parameter is provided", async () => {
            const res = await request(app)
                .get("/tweet")
                .query({ userId: testUserId });

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            
            // All returned tweets should belong to the specified user
            res.body.forEach(tweet => {
                expect(tweet.userId).toBe(testUserId);
            });
        });

        it("should return empty array for non-existent userId", async () => {
            const res = await request(app)
                .get("/tweet")
                .query({ userId: "non-existent-user-id" });

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });
    });

    // 3. Test GET /tweet/:id - Get tweet by ID
    describe("GET /tweet/:id", () => {
        it("should return a tweet by ID", async () => {
            const res = await request(app)
                .get(`/tweet/${createdTweetId}`);

            expect(res.status).toBe(200);
            expect(res.body).not.toHaveProperty("id");
            expect(res.body.content).toBe(testTweet.content);
        });

        it("should return 404 for non-existent tweet ID", async () => {
            const res = await request(app)
                .get("/tweet/nonexistent-id");

            expect(res.status).toBe(404);
        });

        it("should return 400 for invalid tweet ID format", async () => {
            const res = await request(app)
                .get("/tweet/invalid-id-format");

            expect(res.status).toBe(400);
        });
    });

    // 4. Test PUT /tweet/:id - Update tweet by ID
    describe("PUT /tweet/:id", () => {
        it("should update a tweet with valid data", async () => {
            const res = await request(app)
                .put(`/tweet/${createdTweetId}`)
                .send(updateData);

            expect(res.status).toBe(200);
            expect(res.body).not.toHaveProperty("id");
            expect(res.body.content).toBe(updateData.content);
            expect(res.body.image).toBe(updateData.image);
        });

        it("should update a tweet with partial data", async () => {
            const res = await request(app)
                .put(`/tweet/${createdTweetId}`)
                .send({
                    content: "Only updating content"
                });

            expect(res.status).toBe(200);
            expect(res.body.content).toBe("Only updating content");
            expect(res.body.image).toBe(updateData.image);
        });

        it("should return 404 for non-existent tweet ID", async () => {
            const res = await request(app)
                .put("/tweet/nonexistent-id")
                .send(updateData);

            expect(res.status).toBe(404);
        });
    });

    // 5. Test DELETE /tweet/:id - Delete tweet by ID
    describe("DELETE /tweet/:id", () => {
        it("should delete a tweet by ID", async () => {
            const res = await request(app)
                .delete(`/tweet/${createdTweetId}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message", "Tweet deleted successfully");
        });

        it("should return 404 when trying to delete non-existent tweet", async () => {
            const res = await request(app)
                .delete("/tweet/nonexistent-id");

            expect(res.status).toBe(404);
        });

        it("should return 404 when trying to get deleted tweet", async () => {
            const res = await request(app)
                .get(`/tweet/${createdTweetId}`);

            expect(res.status).toBe(404);
        });
    });
});
