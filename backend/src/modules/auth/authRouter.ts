import express from "express";
import * as model from "./authModel";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const result = await model.register(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const result = await model.login(req.body);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
    });

    res.json({ accessToken: result.accessToken });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// REFRESH TOKEN
router.post("/refresh-token", async (req, res) => {
  try {
    const result = await model.refreshToken(req);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

// LOGOUT (เฉพาะ user.id)
router.post("/logout/:id", async (req, res) => {
  const userIdFromUrl = req.params.id;
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(400).json({ error: "No refresh token found" });
  }

  try {
    const result = await model.logout(userIdFromUrl, token);
    res.clearCookie("refreshToken");
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;