export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { isValid: false, message: 'password must be at least 8 characters long 💀' };
    }
    if (!hasUppercase) {
        return { isValid: false, message: 'password needs at least one uppercase letter ↑' };
    }
    if (!hasLowercase) {
        return { isValid: false, message: 'password needs at least one lowercase letter ↓' };
    }
    if (!hasNumber) {
        return { isValid: false, message: 'password needs at least one number 1️⃣' };
    }
    if (!hasSpecialChar) {
        return { isValid: false, message: 'password needs at least one special character ✨' };
    }

    return { isValid: true };
};
