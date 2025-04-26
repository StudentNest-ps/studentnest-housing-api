app.post('/api/signup', async (req, res) => {
    const { email, username, phoneNumber, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' });

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already registered.' });

        const newUser = new User({ email, username, phoneNumber, password, role });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});
