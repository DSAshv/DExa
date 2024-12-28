import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path from "path";
import { getUserById } from "../../database/database-crud-utils.js";
import { fileURLToPath } from "url";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { JWT_SECRET, ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } = process.env;


const generateTokens = (id) => {
    const accessToken = jwt.sign(
        { id },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRATION },
    );

    const refreshToken = jwt.sign(
        { id },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRATION },
    );

    return {
        accessToken,
        refreshToken,
    };
};

const decodeToken = (token) => {
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        return {
            isValid: true,
            payload,
        };
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return {
                isValid: false,
                isSignatureExpired: true,
            };
        } else {
            return {
                isValid: false,
                isInvalidToken: true,
            };
        }
    }
};

const isAccessTokenValid = (accessToken) => {
    const accessTokenInfo = decodeToken(accessToken);
    return accessTokenInfo.isValid;
};

const generateAccessToken = async(refreshToken) => {
    const refreshTokenInfo = decodeToken(refreshToken);
    const userInfo = await getUserById(refreshTokenInfo.payload.id);
    if (refreshTokenInfo.isValid && userInfo) {
        const accessToken = jwt.sign(
            { id: refreshTokenInfo.payload.id },
            JWT_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRATION },
        );
        return {
            isValid: true,
            accessToken,
            id: refreshTokenInfo.payload.id,
            userInfo,
        };
    } else {
        return {
            isValid: false,
        };
    }
};

const isValidRequest = async(tokens = {}) => {
    const validationObj = {
        isValid: false,
        cookies: [
            { key: "dat", value: "", maxAge: -1 },
            { key: "drt", value: "", maxAge: -1 },
        ],
    };

    if (!tokens.dat || !tokens.drt) {
        return validationObj;
    }

    const accessTokenInfo = decodeToken(tokens.dat);
    if (accessTokenInfo.isValid) {
        const userInfo = await getUserById(accessTokenInfo.payload.id);
        if (userInfo) {
            validationObj.isValid = true;
            validationObj.userInfo = userInfo;
        }
        validationObj.cookies = [];
    } else if (accessTokenInfo.isSignatureExpired) {
        const newAccessTokenInfo = await generateAccessToken(tokens.drt);
        validationObj.isValid = newAccessTokenInfo.isValid;
        validationObj.userInfo = newAccessTokenInfo.userInfo;
        if (newAccessTokenInfo.isValid) {
            validationObj.cookies = [
                { key: "dat", value: newAccessTokenInfo.accessToken, maxAge: 24 * 60 * 60 },
            ];
        }
    }

    return validationObj;
};

const validateRequest = async(tokens) => {
    const validationObj = await isValidRequest(tokens);
    return validationObj;
};

export {
    validateRequest,
    generateTokens,
    decodeToken,
    isAccessTokenValid,
    generateAccessToken,
    isValidRequest,
};
