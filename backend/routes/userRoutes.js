router.get("/getUserByFirebaseUID/:firebaseUID", async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.params.firebaseUID });
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ _id: user._id, name: user.name, email: user.email });
    } catch (error) {
        console.error("❌ Error fetching user by Firebase UID:", error);
        res.status(500).json({ message: "Server error" });
    }
});
