import { axios } from "../axios"; 

describe("Authorization Route", () => {
    const date = new Date()
    const newUser = {
        username: "testuser"+ date.toISOString(),
        password: "TestPass123!"
    };

    test("Sign up to be 200 for new User", async () => {
        const res = await axios.post("/auth/signup", newUser)
        expect(res.status).toBe(201);
    });

    test("Login to be 200 for user correct credential and get accessToken and refreshToken", async () => {
        const res = await axios.post("/auth/login", newUser)

        expect(res.status).toBe(200);
        expect(res.data.data).toHaveProperty("accessToken");
        expect(res.data.data).toHaveProperty("refreshToken");
    });

    test("Login to be 400 for invalid input schema", async () => {
        const res = await axios.post("/auth/login", { username: "invalid-user" })

        expect(res.status).toBe(400);
    });

    test("Login to be 400 for user invalid credential", async () => {
        const res = await axios.post("/auth/login", { username: newUser.username, password: "WrongPassword" })

        expect(res.status).toBe(400);
    });

    test("Login to be 404 for user not found", async () => {
        const res = await axios.post("/auth/login", { username: "notfound", password: "AnyPass123!" })

        expect(res.status).toBe(404);
    });
});