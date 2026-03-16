function serializeUser(user) {
    return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        username: user.username || "",
        role: user.role,
        plan: user.plan,
        status: user.status,
        phone: user.phone || "",
        createdAt: user.createdAt,
        lastActivity: user.lastActivity
    };
}

module.exports = {
    serializeUser
};
