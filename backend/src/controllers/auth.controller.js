import * as authService from "../services/auth.service.js";
import generateToken from "../utils/generateToken.js";
import { authCookieOptions, clearAuthCookieOptions } from "../config/cookies.js";
import asyncHandler from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
    const user = await authService.registerUser(req.body);
    const token = generateToken(user.id);
    res.cookie("token", token, authCookieOptions);

    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user,
    });
});

export const login = asyncHandler(async (req, res) => {
    const user = await authService.loginUser(req.body);
    const token = generateToken(user.id);
    res.cookie("token", token, authCookieOptions);

    return res.status(200).json({
        success: true,
        message: "Login successful",
        user,
    });
});

export const logout = async (req, res) => {
    res.clearCookie("token", clearAuthCookieOptions);
    return res.status(200).json({
        success: true,
        message: "Logout successful"
    });
};

export const getMe = asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.userId);

    return res.status(200).json({
        success: true,
        user,
    });
});
