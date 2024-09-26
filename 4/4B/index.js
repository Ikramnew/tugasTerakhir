const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

// Database setup
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'finaltask',
    password: 'ikramnf123',
});

// Middleware
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('uploads')); // Serve static files from uploads directory
app.use(session({
    secret: 'ikramnf123',
    resave: false,
    saveUninitialized: true,
}));

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Set the filename
    }
});

const upload = multer({ storage: storage });

// Routes

// Home Page
app.get('/', isAuthenticated, async (req, res) => {
    const provinsi = await pool.query('SELECT * FROM provinsi_tb');
    res.render('index', { provinsi: provinsi.rows, userId: req.session.userId });
});

// Register Page
app.get('/register', (req, res) => {
    res.render('register');
});

// Register User
app.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users_tb (email, username, password) VALUES ($1, $2, $3)', [email, username, hashedPassword]);
    res.redirect('/login');
});

// Login Page
app.get('/login', (req, res) => {
    res.render('login');
});

// Login User
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await pool.query('SELECT * FROM users_tb WHERE username = $1', [username]);

    if (user.rows.length > 0 && await bcrypt.compare(password, user.rows[0].password)) {
        req.session.userId = user.rows[0].id;
        res.redirect('/provinsi');
    } else {
        res.redirect('/login');
    }
});

// Provinsi Page
app.get('/provinsi', isAuthenticated, async (req, res) => {
    const provinsi = await pool.query('SELECT * FROM provinsi_tb');
    res.render('provinsi', { provinsi: provinsi.rows });
});

// Add Provinsi Page
app.get('/addprovinsi', isAuthenticated, (req, res) => {
    res.render('addProvinsi');
});
app.get('/addkabupaten', isAuthenticated, (req, res) => {
    res.render('addkabupaten');
});

// Add Provinsi
app.post('/addprovinsi', isAuthenticated, upload.single('photo'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Please upload a file.');
    }

    const { nama, diresmikan, pulau } = req.body;
    const photo = req.file.filename; // Get the filename from Multer
    const user_id = req.session.userId; // Get user_id from session

    try {
        await pool.query('INSERT INTO provinsi_tb (user_id, nama, diresmikan, photo, pulau) VALUES ($1, $2, $3, $4, $5)', [user_id, nama, diresmikan, photo, pulau]);
        res.redirect('/provinsi');
    } catch (error) {
        console.error(error);
        res.send('Error saving to the database');
    }
});


// Detail Provinsi
app.get('/provinsi/:id', isAuthenticated, async (req, res) => {
    const provinsi = await pool.query('SELECT * FROM provinsi_tb WHERE id = $1', [req.params.id]);
    const kabupaten = await pool.query('SELECT * FROM kabupaten_tb WHERE provinsi_id = $1', [req.params.id]);
    res.render('detailProvinsi', { provinsi: provinsi.rows[0], kabupaten: kabupaten.rows });
});

// Edit Provinsi
app.get('/provinsi/edit/:id', isAuthenticated, async (req, res) => {
    const provinsi = await pool.query('SELECT * FROM provinsi_tb WHERE id = $1', [req.params.id]);
    res.render('addProvinsi', { provinsi: provinsi.rows[0] });
});

// Update Provinsi
app.post('/provinsi/edit/:id', isAuthenticated, upload.single('photo'), async (req, res) => {
    const { nama, diresmikan, pulau } = req.body;
    const photo = req.file ? req.file.filename : req.body.existingPhoto; // Use existing photo if not uploading a new one
    await pool.query('UPDATE provinsi_tb SET nama = $1, diresmikan = $2, photo = $3, pulau = $4 WHERE id = $5', [nama, diresmikan, photo, pulau, req.params.id]);
    res.redirect('/provinsi');
});

// Delete Provinsi
app.post('/provinsi/delete/:id', isAuthenticated, async (req, res) => {
    await pool.query('DELETE FROM provinsi_tb WHERE id = $1', [req.params.id]);
    res.redirect('/provinsi');
});

// Kabupaten Page
app.get('/kabupaten', isAuthenticated, async (req, res) => {
    const kabupaten = await pool.query('SELECT * FROM kabupaten_tb');
    res.render('kabupaten', { kabupaten: kabupaten.rows });
});

// Add Kabupaten
app.post('/addkabupaten', isAuthenticated, upload.single('photo'), async (req, res) => {
    const { nama, provinsi_id, diresmikan } = req.body;
    const photo = req.file.filename; 
    await pool.query('INSERT INTO kabupaten_tb (nama, provinsi_id, diresmikan, photo) VALUES ($1, $2, $3, $4)', [nama, provinsi_id, diresmikan, photo]);
    res.redirect('/kabupaten');
});

// Detail Kabupaten
// Route to display the detail page of a specific kabupaten
app.get('/kabupaten/:id', isAuthenticated, async (req, res) => {
    try {
        // Fetch the kabupaten details using the kabupaten id
        const kabupatenResult = await pool.query('SELECT * FROM kabupaten_tb WHERE id = $1', [req.params.id]);
        const kabupaten = kabupatenResult.rows[0];

        if (!kabupaten) {
            return res.send('Kabupaten not found');
        }

        // Fetch the associated provinsi using provinsi_id from the kabupaten
        const provinsiResult = await pool.query('SELECT * FROM provinsi_tb WHERE id = $1', [kabupaten.provinsi_id]);
        const provinsi = provinsiResult.rows[0];

        if (!provinsi) {
            return res.send('Provinsi not found');
        }

        // Render the detailKabupaten template with the kabupaten and provinsi data
        res.render('detailKabupaten', { kabupaten, provinsi });
    } catch (error) {
        console.error(error);
        res.send('Error fetching data');
    }
});


// Edit Kabupaten
app.get('/kabupaten/edit/:id', isAuthenticated, async (req, res) => {
    const kabupaten = await pool.query('SELECT * FROM kabupaten_tb WHERE id = $1', [req.params.id]);
    res.render('addKabupaten', { kabupaten: kabupaten.rows[0] });
});

// Update Kabupaten
app.post('/kabupaten/edit/:id', isAuthenticated, upload.single('photo'), async (req, res) => {
    const { nama, provinsi_id, diresmikan } = req.body;
    const photo = req.file ? req.file.filename : req.body.existingPhoto; // Use existing photo if not uploading a new one
    await pool.query('UPDATE kabupaten_tb SET nama = $1, provinsi_id = $2, diresmikan = $3, photo = $4 WHERE id = $5', [nama, provinsi_id, diresmikan, photo, req.params.id]);
    res.redirect('/kabupaten');
});

// Delete Kabupaten
app.post('/kabupaten/delete/:id', isAuthenticated, async (req, res) => {
    await pool.query('DELETE FROM kabupaten_tb WHERE id = $1', [req.params.id]);
    res.redirect('/kabupaten');
});

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
