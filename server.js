const http = require('http');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'webtech'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Helper function to parse JSON body
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                resolve({});
            }
        });
    });
}

// Helper function to send JSON response
function sendJsonResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

// Serve static files
function serveStaticFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            sendJsonResponse(res, 404, { error: 'File not found' });
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        sendJsonResponse(res, 200, {});
        return;
    }

    // Serve static HTML files
    if (pathname === '/' || pathname === '/index.html') {
        serveStaticFile(res, './index.html', 'text/html');
        return;
    }
    
    if (pathname === '/login.html') {
        serveStaticFile(res, './login.html', 'text/html');
        return;
    }
    
    if (pathname === '/signup.html') {
        serveStaticFile(res, './signup.html', 'text/html');
        return;
    }
    
    if (pathname === '/explore.html') {
        serveStaticFile(res, './explore.html', 'text/html');
        return;
    }
    
    if (pathname === '/services.html') {
        serveStaticFile(res, './services.html', 'text/html');
        return;
    }
    
    if (pathname === '/review.html') {
        serveStaticFile(res, './review.html', 'text/html');
        return;
    }
    
    if (pathname === '/blog.html') {
        serveStaticFile(res, './blog.html', 'text/html');
        return;
    }
    
    if (pathname === '/contact.html') {
        serveStaticFile(res, './contact.html', 'text/html');
        return;
    }
    
    if (pathname === '/journal.html') {
        serveStaticFile(res, './journal.html', 'text/html');
        return;
    }
    
    if (pathname === '/test.html') {
        serveStaticFile(res, './test.html', 'text/html');
        return;
    }

    // Serve CSS and JS files
    if (pathname === '/style.css') {
        serveStaticFile(res, './style.css', 'text/css');
        return;
    }
    
    if (pathname === '/index.js') {
        serveStaticFile(res, './index.js', 'application/javascript');
        return;
    }

    // Serve images
    if (pathname.startsWith('/images/')) {
        const imagePath = '.' + pathname;
        const ext = path.extname(pathname).toLowerCase();
        let contentType = 'image/jpeg';
        
        if (ext === '.png') contentType = 'image/png';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.avif') contentType = 'image/avif';
        
        serveStaticFile(res, imagePath, contentType);
        return;
    }

    // Simple test route
    if (pathname === '/api/test' && method === 'GET') {
        sendJsonResponse(res, 200, { message: 'API is working!', timestamp: new Date().toISOString() });
        return;
    }

    // API Routes
    if (pathname === '/api/member/register' && method === 'POST') {
        try {
            const body = await parseBody(req);
            const { username, email, password } = body;
            
            if (!username || !email || !password) {
                sendJsonResponse(res, 400, { error: 'All fields are required' });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            
            db.query(
                'INSERT INTO members (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword],
                (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            sendJsonResponse(res, 400, { error: 'Username or email already exists' });
    } else {
                            sendJsonResponse(res, 500, { error: 'Registration failed' });
                        }
                        return;
                    }
                    sendJsonResponse(res, 201, { message: 'Member registered successfully', id: result.insertId });
                }
            );
        } catch (error) {
            sendJsonResponse(res, 500, { error: 'Server error' });
        }
        return;
    }

    if (pathname === '/api/member/login' && method === 'POST') {
        try {
            const body = await parseBody(req);
            const { email, password } = body;
            
            if (!email || !password) {
                sendJsonResponse(res, 400, { error: 'Email and password are required' });
                return;
            }

            db.query(
                'SELECT * FROM members WHERE email = ?',
                [email],
                async (err, results) => {
                    if (err || results.length === 0) {
                        sendJsonResponse(res, 401, { error: 'Invalid credentials' });
                        return;
                    }

                    const member = results[0];
                    const isValidPassword = await bcrypt.compare(password, member.password);
                    
                    if (!isValidPassword) {
                        sendJsonResponse(res, 401, { error: 'Invalid credentials' });
                        return;
                    }

                    sendJsonResponse(res, 200, { 
                        message: 'Login successful',
                        member: {
                            id: member.id,
                            username: member.username,
                            email: member.email
                        }
                    });
                }
            );
        } catch (error) {
            sendJsonResponse(res, 500, { error: 'Server error' });
        }
        return;
    }

    if (pathname === '/api/admin/login' && method === 'POST') {
        try {
            const body = await parseBody(req);
            const { email, password } = body;
            
            if (!email || !password) {
                sendJsonResponse(res, 400, { error: 'Email and password are required' });
                return;
            }

            db.query(
                'SELECT * FROM admin WHERE email = ?',
                [email],
                async (err, results) => {
                    if (err || results.length === 0) {
                        sendJsonResponse(res, 401, { error: 'Invalid credentials' });
                        return;
                    }

                    const admin = results[0];
                    const isValidPassword = await bcrypt.compare(password, admin.password);
                    
                    if (!isValidPassword) {
                        sendJsonResponse(res, 401, { error: 'Invalid credentials' });
                        return;
                    }

                    sendJsonResponse(res, 200, { 
                        message: 'Admin login successful',
                        admin: {
                            id: admin.id,
                            username: admin.username,
                            email: admin.email
                        }
                    });
                }
            );
        } catch (error) {
            sendJsonResponse(res, 500, { error: 'Server error' });
        }
        return;
    }

    if (pathname === '/api/forgot-password' && method === 'POST') {
        try {
            const body = await parseBody(req);
            const { email, userType } = body;
            
            if (!email || !userType) {
                sendJsonResponse(res, 400, { error: 'Email and user type are required' });
                return;
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

            const table = userType === 'admin' ? 'admin' : 'members';
            
            db.query(
                `UPDATE ${table} SET reset_token = ?, reset_token_expiry = ? WHERE email = ?`,
                [resetToken, resetTokenExpiry, email],
                (err, result) => {
                    if (err || result.affectedRows === 0) {
                        sendJsonResponse(res, 404, { error: 'Email not found' });
                        return;
                    }
                    
                    // In a real app, you would send this token via email
                    // For this project, we'll just return it
                    sendJsonResponse(res, 200, { 
                        message: 'Password reset token generated',
                        resetToken: resetToken // Remove this in production
                    });
                }
            );
        } catch (error) {
            sendJsonResponse(res, 500, { error: 'Server error' });
        }
        return;
    }

    if (pathname === '/api/reset-password' && method === 'POST') {
        try {
            const body = await parseBody(req);
            const { email, resetToken, newPassword, userType } = body;
            
            if (!email || !resetToken || !newPassword || !userType) {
                sendJsonResponse(res, 400, { error: 'All fields are required' });
                return;
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const table = userType === 'admin' ? 'admin' : 'members';
            
            db.query(
                `UPDATE ${table} SET password = ?, reset_token = NULL, reset_token_expiry = NULL 
                 WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW()`,
                [hashedPassword, email, resetToken],
                (err, result) => {
                    if (err || result.affectedRows === 0) {
                        sendJsonResponse(res, 400, { error: 'Invalid or expired reset token' });
                        return;
                    }
                    
                    sendJsonResponse(res, 200, { message: 'Password reset successfully' });
                }
            );
        } catch (error) {
            sendJsonResponse(res, 500, { error: 'Server error' });
        }
        return;
    }

    if (pathname === '/api/reviews' && method === 'GET') {
        db.query(
            'SELECT r.*, m.username, m.email FROM reviews r JOIN members m ON r.member_id = m.id ORDER BY r.created_at DESC',
            (err, results) => {
                if (err) {
                    sendJsonResponse(res, 500, { error: 'Failed to fetch reviews' });
                    return;
                }
                sendJsonResponse(res, 200, { reviews: results });
            }
        );
        return;
    }

    if (pathname === '/api/reviews' && method === 'POST') {
        try {
            const body = await parseBody(req);
            const { memberId, title, content, rating } = body;

            if (!memberId || !title || !content || !rating) {
                sendJsonResponse(res, 400, { error: 'All fields are required' });
                return;
            }

            // Get member's username and email
            db.query(
                'SELECT username, email FROM members WHERE id = ?',
                [memberId],
                (err, results) => {
                    if (err || results.length === 0) {
                        sendJsonResponse(res, 400, { error: 'Member not found' });
                        return;
                    }
                    const { username, email } = results[0];

                    db.query(
                        'INSERT INTO reviews (member_id, title, content, rating, username, email) VALUES (?, ?, ?, ?, ?, ?)',
                        [memberId, title, content, rating, username, email],
                        (err, result) => {
                            if (err) {
                                sendJsonResponse(res, 500, { error: 'Failed to add review' });
                                return;
                            }
                            sendJsonResponse(res, 201, { message: 'Review added successfully', id: result.insertId });
                        }
                    );
                }
            );
        } catch (error) {
            sendJsonResponse(res, 500, { error: 'Server error' });
        }
        return;
    }

    if (pathname.startsWith('/api/reviews/') && method === 'PUT') {
        const reviewId = pathname.split('/')[3];
        
        try {
            const body = await parseBody(req);
            const { title, content, rating, location } = body;
            
            if (!title || !content || !rating) {
                sendJsonResponse(res, 400, { error: 'Title, content and rating are required' });
                return;
            }

            db.query(
                'UPDATE reviews SET title = ?, content = ?, rating = ?, location = ? WHERE id = ?',
                [title, content, rating, location, reviewId],
                (err, result) => {
                    if (err) {
                        sendJsonResponse(res, 500, { error: 'Failed to update review' });
                        return;
                    }
                    if (result.affectedRows === 0) {
                        sendJsonResponse(res, 404, { error: 'Review not found' });
                        return;
                    }
                    sendJsonResponse(res, 200, { message: 'Review updated successfully' });
                }
            );
        } catch (error) {
            sendJsonResponse(res, 500, { error: 'Server error' });
        }
        return;
    }

    if (pathname.startsWith('/api/reviews/') && method === 'DELETE') {
        const reviewId = pathname.split('/')[3];
        
        db.query(
            'DELETE FROM reviews WHERE id = ?',
            [reviewId],
            (err, result) => {
                if (err || result.affectedRows === 0) {
                    sendJsonResponse(res, 404, { error: 'Review not found' });
                    return;
                }
                sendJsonResponse(res, 200, { message: 'Review deleted successfully' });
            }
        );
        return;
    }

    if (pathname === '/api/blog' && method === 'GET') {
        db.query(
            'SELECT b.*, m.username FROM blog b JOIN members m ON b.member_id = m.id ORDER BY b.created_at DESC',
            (err, results) => {
                if (err) {
                    sendJsonResponse(res, 500, { error: 'Failed to fetch blog posts' });
                    return;
                }
                sendJsonResponse(res, 200, { blog: results });
            }
        );
        return;
    }

    if (pathname === '/api/blog' && method === 'POST') {
        try {
            const body = await parseBody(req);
            const { memberId, title, content, imageUrl } = body;
            
            if (!memberId || !title || !content) {
                sendJsonResponse(res, 400, { error: 'Title and content are required' });
                return;
            }

            db.query(
                'INSERT INTO blog (member_id, title, content, image_url) VALUES (?, ?, ?, ?)',
                [memberId, title, content, imageUrl],
                (err, result) => {
                    if (err) {
                        sendJsonResponse(res, 500, { error: 'Failed to add blog post' });
                        return;
                    }
                    sendJsonResponse(res, 201, { message: 'Blog post added successfully', id: result.insertId });
                }
            );
        } catch (error) {
            sendJsonResponse(res, 500, { error: 'Server error' });
        }
        return;
    }

    if (pathname.startsWith('/api/blog/') && method === 'DELETE') {
        const blogId = pathname.split('/')[3];
        
        db.query(
            'DELETE FROM blog WHERE id = ?',
            [blogId],
            (err, result) => {
                if (err || result.affectedRows === 0) {
                    sendJsonResponse(res, 404, { error: 'Blog post not found' });
                    return;
                }
                sendJsonResponse(res, 200, { message: 'Blog post deleted successfully' });
            }
        );
        return;
    }

    // JOURNAL ENTRIES ENDPOINTS
    const journalFields = ['id', 'name', 'email', 'title', 'location', 'category', 'content', 'photos', 'created_at'];

    // Get all journal entries
    if (pathname === '/api/journal' && method === 'GET') {
        db.query('SELECT * FROM journal_entries ORDER BY created_at DESC', (err, results) => {
            if (err) sendJsonResponse(res, 500, { error: 'Database error' });
            sendJsonResponse(res, 200, results);
        });
        return;
    }

    // Add a new journal entry (members or admins)
    if (pathname === '/api/journal' && method === 'POST') {
        try {
            const body = await parseBody(req);
            const { name, email, title, location, category, content } = body;
            let { photos } = body;
            if (!name || !email || !content) {
                sendJsonResponse(res, 400, { error: 'Name, email, and content are required' });
                return;
            }
            if (typeof photos !== 'string') photos = '';
            const sql = 'INSERT INTO journal_entries (name, email, title, location, category, content, photos) VALUES (?, ?, ?, ?, ?, ?, ?)';
            db.query(sql, [name, email, title, location, category, content, photos], (err, result) => {
                if (err) {
                    console.error('MySQL error:', err);
                    sendJsonResponse(res, 500, { error: 'Database error' });
                    return;
                }
                sendJsonResponse(res, 201, { success: true, id: result.insertId });
            });
        } catch (error) {
            sendJsonResponse(res, 500, { error: 'Server error' });
        }
        return;
    }

    // Delete a journal entry (admin only)
    if (pathname.startsWith('/api/journal/') && method === 'DELETE') {
        const journalId = pathname.split('/')[3];
        // Simple admin check: require adminData in localStorage (for demo/class project)
        // In real app, use sessions/JWT
        const isAdmin = req.headers['x-admin'] === 'true';
        if (!isAdmin) {
            sendJsonResponse(res, 403, { error: 'Admin only' });
            return;
        }
        db.query('DELETE FROM journal_entries WHERE id = ?', [journalId], (err, result) => {
            if (err) sendJsonResponse(res, 500, { error: 'Database error' });
            if (result.affectedRows === 0) sendJsonResponse(res, 404, { error: 'Entry not found' });
            sendJsonResponse(res, 200, { success: true });
        });
        return;
    }

    // POST /api/contact - anyone can send a message
    if (pathname === '/api/contact' && method === 'POST') {
        try {
            const body = await parseBody(req);
            const { name, email, message } = body;
            if (!name || !email || !message) {
                sendJsonResponse(res, 400, { error: 'Name, email and message are required' });
                return;
            }
            db.query(
                'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
                [name, email, message],
                (err, result) => {
                    if (err) {
                        sendJsonResponse(res, 500, { error: 'Failed to send message' });
                        return;
                    }
                    sendJsonResponse(res, 201, { message: 'Message sent successfully' });
                }
            );
        } catch (error) {
            sendJsonResponse(res, 500, { error: 'Server error' });
        }
        return;
    }

    // GET /api/contact?email=... - user fetches their messages and replies
    if (pathname === '/api/contact' && method === 'GET' && parsedUrl.query.email) {
        db.query(
            'SELECT id, message, reply, created_at FROM contact_messages WHERE email = ? ORDER BY created_at DESC',
            [parsedUrl.query.email],
            (err, results) => {
                if (err) {
                    sendJsonResponse(res, 500, { error: 'Failed to fetch messages' });
                    return;
                }
                sendJsonResponse(res, 200, { messages: results });
            }
        );
        return;
    }

    // GET /api/contact - admin fetches all messages
    if (pathname === '/api/contact' && method === 'GET') {
        db.query(
            'SELECT * FROM contact_messages ORDER BY created_at DESC',
            (err, results) => {
                if (err) {
                    sendJsonResponse(res, 500, { error: 'Failed to fetch contact messages' });
                    return;
                }
                sendJsonResponse(res, 200, { messages: results });
            }
        );
        return;
    }

    // POST /api/contact/reply - admin replies to a message
    if (pathname === '/api/contact/reply' && method === 'POST') {
        try {
            const body = await parseBody(req);
            const { id, reply } = body;
            if (!id || !reply) {
                sendJsonResponse(res, 400, { error: 'Message ID and reply required' });
                return;
            }
            db.query(
                'UPDATE contact_messages SET reply = ? WHERE id = ?',
                [reply, id],
                (err, result) => {
                    if (err) {
                        sendJsonResponse(res, 500, { error: 'Failed to send reply' });
                        return;
                    }
                    sendJsonResponse(res, 200, { message: 'Reply sent!' });
                }
            );
        } catch (error) {
            sendJsonResponse(res, 500, { error: 'Server error' });
        }
        return;
    }

    // Default route
    sendJsonResponse(res, 404, { error: 'Route not found' });
});

const port = 3000;
const host = 'localhost';

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});
