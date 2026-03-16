function serializeUser(user) {
    return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        username: user.username || "",
        role: user.role,
        plan: user.plan,
        planStatus: user.planStatus || "none",
        paymentStatus: user.paymentStatus || "none",
        status: user.status,
        phone: user.phone || "",
        authProvider: user.authProvider || "local",
        createdAt: user.createdAt,
        lastActivity: user.lastActivity
    };
}

module.exports = {
    serializeUser
};
