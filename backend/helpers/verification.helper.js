// Store verification codes in memory
const verificationCodes = new Map();

// Generate a random 6-digit verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save verification code with timestamp
const saveVerificationCode = (email, code) => {
    verificationCodes.set(email, {
        code,
        timestamp: Date.now()
    });
};

// Verify the code with 5-minute expiration
const verifyCode = (email, code) => {
    const verification = verificationCodes.get(email);
    if (!verification) {
        return { valid: false, message: "No verification code found" };
    }

    // Check if code has expired (5 minutes = 300000 milliseconds)
    const timeElapsed = Date.now() - verification.timestamp;
    if (timeElapsed > 300000) {
        verificationCodes.delete(email); // Clean up expired code
        return { valid: false, message: "Verification code has expired" };
    }

    // Check if code matches
    if (verification.code !== code) {
        return { valid: false, message: "Invalid verification code" };
    }

    // Code is valid, clean up
    verificationCodes.delete(email);
    return { valid: true, message: "Code verified successfully" };
};

// Clean up verification code
const removeVerificationCode = (email) => {
    verificationCodes.delete(email);
};

export {
    generateVerificationCode,
    saveVerificationCode,
    verifyCode,
    removeVerificationCode
};
