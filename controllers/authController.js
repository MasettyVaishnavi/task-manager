const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        db.query(sql, [name, email, hashedPassword], (err, result) => {
            if (err) {
                return res.status(400).json({ message: "Email already exists" });
            }
            res.json({ message: "User registered successfully ✅" });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// LOGIN
exports.login = (req, res) => {
    const { email, password } = req.body;

    console.log("LOGIN EMAIL:", email);
    console.log("LOGIN PASSWORD:", password);

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        console.log("DB RESULT:", results);

        if (err || results.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = results[0];

        console.log("DB PASSWORD HASH:", user.password);

        const isMatch = await bcrypt.compare(password, user.password);

        console.log("PASSWORD MATCH:", isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful ✅",
            token
        });
    });
};