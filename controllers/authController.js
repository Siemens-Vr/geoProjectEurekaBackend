const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ firstName, lastName, email, password: hashedPassword, role:"user" });
        
        await user.save();
        console.log("New user created !!")
        res.status(200).json({ message: 'User created' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
};

// Login an existing user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        const userInfo = {
            id: user._id,
            email: user.email,
            username: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
            
        };
        console.log("User " + userInfo.username + " connected !")
        res.status(200).json({ message: "Authentication successful!", token, user: userInfo, refreshToken });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.role = async (req, res) => {
    try {   
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        const user = await User.findById(decoded.id);   
        res.status(200).json(user.role);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
};