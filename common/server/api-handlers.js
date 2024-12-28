// const { generateTokens } = require("../utils/token-utils");
import { API_RESPONSE } from "../constants/common-constants.js";
import dbClient from "../../database/database-crud-utils.js";
import { generateTokens } from "./authenticator.js";


async function handleSignIn(request, response) {
    try {
        const email = request.body.email;
        const password = request.body.password;

        if (email && password) {
            const user = await dbClient.getUserByEmail(email, { includePassword: true });
            if (user && user.password === password) {
                const tokens = generateTokens(user._id);
                response.cookie("dat", tokens.accessToken, { maxAge: 24 * 60 * 60 * 1000 });
                response.cookie("drt", tokens.refreshToken, { maxAge: 24 * 60 * 60 * 1000 });
                return response.status(200).json({
                    result: API_RESPONSE.SUCCESS,
                    data: {
                        message: "Sign In successful - Signing In",
                        id: user._id,
                    },
                });
            } else if (user && user.password !== password) {
                return response.status(200).json({
                    result: API_RESPONSE.FAILURE,
                    data: {
                        message: "Sign In failed - Incorrect password",
                    },
                });
            } else {
                return response.status(200).json({
                    result: API_RESPONSE.FAILURE,
                    data: {
                        message: "Sign In failed - User not found",
                    },
                });
            }
        } else {
            return response.status(200).json({
                result: API_RESPONSE.FAILURE,
                data: {
                    message: "Sign In failed - Invalid credentials",
                },
            });
        }
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            result: API_RESPONSE.FAILURE,
            data: {
                message: "Sign-in failed - Internal Server Error",
            },
        });
    }
}


async function handleSignUp(request, response) {
    try {
        const name = request.body.name;
        const email = request.body.email;
        const password = request.body.password;
        const dateOfBirth = request.body.dateOfBirth;
        const location = request.body.location;
        const pincode = request.body.pincode;

        if (email && password && name && dateOfBirth && location && pincode) {
            const user = await dbClient.getUserByEmail(email);
            if (user) {
                return response.status(200).json({
                    result: API_RESPONSE.FAILURE,
                    data: {
                        message: "Sign Up failed - User already exists",
                    },
                });
            } else {
                const createdUser = await dbClient.createUser({ name, email, password, role: "student", dateOfBirth, location, pincode });
                if (createdUser) {
                    const tokens = generateTokens(createdUser.insertedId);
                    response.cookie("dat", tokens.accessToken, { maxAge: 24 * 60 * 60 * 1000 });
                    response.cookie("drt", tokens.refreshToken, { maxAge: 24 * 60 * 60 * 1000 });
                    return response.status(200).json({
                        result: API_RESPONSE.SUCCESS,
                        data: {
                            message: "Sign Up successful - User created",
                        },
                    });
                } else {
                    return response.status(200).json({
                        result: API_RESPONSE.FAILURE,
                        data: {
                            message: "Sign Up failed - User creation failed",
                        },
                    });
                }
            }
        } else {
            return response.status(200).json({
                result: API_RESPONSE.FAILURE,
                data: {
                    message: "Sign Up failed - Invalid credentials",
                },
            });
        }
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            result: API_RESPONSE.FAILURE,
            data: {
                message: "Sign-up failed - Internal Server Error",
            },
        });
    }
}


async function handleLogout(request, response) {
    try {
        response.clearCookie("dat");
        response.clearCookie("drt");
        return response.status(200).json({
            result: API_RESPONSE.SUCCESS,
            data: {
                message: "Logout successful",
            },
        });
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            result: API_RESPONSE.FAILURE,
            data: {
                message: "Logout failed - Internal Server Error",
            },
        });
    }
}


export {
    handleSignIn,
    handleSignUp,
    handleLogout,
};
