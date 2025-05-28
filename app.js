const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

//crud
// 全局配置变量
const SERVER_HOST = 'localhost'; // 服务器IP地址
const BASE_URL = `http://${SERVER_HOST}:${port}`; // 完整的基础URL

// 导入 multer 和 path 模块
const multer = require('multer');
const path = require('path');
app.use(express.json()); // 使用 Express 的内置中间件来解析传入的 JSON 请求体。
app.use(express.static('public'));

//创建 dbUsers数据库
const dbUsers = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('连接 users 数据库时出错:', err.message);
    } else {
        console.log('已连接到 users 数据库。');

        // 创建user表
        dbUsers.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            avatar_url TEXT
        )`, (err) => {
            if (err) {
                console.error('创建 users 表时出错:', err.message);
            } else {
                console.log('Users 表已检查/创建。');
            }
        });

        // 创建 products 表
        dbUsers.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            image TEXT,
            review TEXT,
            seller TEXT,
            price REAL,
            colors TEXT,
            category TEXT,
            rate REAL,
            quantity INTEGER DEFAULT 1,
            stock INTEGER DEFAULT 4
        )`, (err) => {
            if (err) {
                console.error('创建 products 表时出错:', err.message);
            } else {
                console.log('Products 表已检查/创建。');
            }
        });

        // 创建 reviews 表
        dbUsers.run(`CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            rating INTEGER CHECK(rating >= 1 AND rating <= 5),
            comment_text TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id) 
        )`, (err) => {
            if (err) {
                console.error('创建 reviews 表时出错:', err.message);
            } else {
                console.log('Reviews 表已检查/创建。');
            }
        });

        // 创建 orders 表
        dbUsers.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            order_details TEXT NOT NULL,
            total_amount REAL NOT NULL,
            status TEXT NOT NULL DEFAULT '待支付',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            user_order_sequence INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) {
                console.error('创建 orders 表时出错:', err.message);
            } else {
                console.log('Orders 表已检查/创建。');
            }
        });

        // 创建 news 表
        dbUsers.run(`CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image TEXT,
            newsImage TEXT,
            newsTitle TEXT NOT NULL,
            newsCategories TEXT,
            time TEXT,
            date TEXT,
            color TEXT,
            description TEXT
        )`, (err) => {
            if (err) {
                console.error('创建 news 表时出错:', err.message);
            } else {
                console.log('News 表已检查/创建。');
            }
        });
    }
});

// 商品搜索
app.get('/search', (req, res) => {
    const query = req.query.query;
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder || 'ASC';

    let searchQuery = `SELECT * FROM products`;
    const params = [];

    if (query) {
        searchQuery += ` WHERE title LIKE ? OR description LIKE ?`;
        const searchValue = `%${query}%`;
        params.push(searchValue, searchValue);
    }

    if (sortBy) {
        const allowedSortBy = ['price', 'rate'];
        const allowedSortOrder = ['ASC', 'DESC'];

        if (allowedSortBy.includes(sortBy) && allowedSortOrder.includes(sortOrder.toUpperCase())) {
            searchQuery += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
        }
    }

    dbUsers.all(searchQuery, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 用户注册
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) { 
        return res.status(400).json({ error: '用户名和密码是必填项。' }); 
    }

    try { 
        const sql = `INSERT INTO users (username, password_hash) VALUES (?, ?)`; 
        
        dbUsers.run(sql, [username, password], function(err) { 
            if (err) { 
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: '用户名已存在。' }); 
                }
                return res.status(500).json({ error: '注册用户时出错: ' + err.message }); 
            }
            res.status(201).json({ message: '用户注册成功。', userId: this.lastID }); 
        });
    } catch (error) { 
        res.status(500).json({ error: '服务器注册过程中出错: ' + error.message }); 
    }
});

// 用户登录
app.post('/login', (req, res) => { 
    const { username, password } = req.body; 

    if (!username || !password) { 
        return res.status(400).json({ error: '用户名和密码是必填项。' });
    }

    const sql = `SELECT * FROM users WHERE username = ?`; 
    dbUsers.get(sql, [username], async (err, user) => { 
        if (err) { 
            return res.status(500).json({ error: '登录时出错: ' + err.message });
        }
        if (!user) {
            return res.status(401).json({ error: '无效的用户名或密码。' }); 
        }

        try { 
            if (password === user.password_hash) { 
                res.status(200).json({ 
                    message: '登录成功。', 
                    userId: user.id, 
                    username: user.username, 
                    avatarUrl: user.avatar_url 
                });
            } else { 
                res.status(401).json({ error: '无效的用户名或密码。' }); 
            }
        } catch (error) {
            res.status(500).json({ error: '服务器登录过程中出错: ' + error.message }); 
        }
    });
});

// 创建订单
app.post('/create_order', (req, res) => {
    const { userId, items, totalAmount } = req.body;

    if (!userId || !items || items.length === 0 || totalAmount == null) {
        return res.status(400).json({ error: '缺少必要的订单信息。' });
    }

    dbUsers.serialize(() => {
        dbUsers.run('BEGIN TRANSACTION');
        
        // 检查库存和创建订单的逻辑
        // 简化版实现
        const orderDetails = JSON.stringify(items);
        const status = '待支付';
        
        dbUsers.run(
            `INSERT INTO orders (user_id, order_details, total_amount, status) VALUES (?, ?, ?, ?)`,
            [userId, orderDetails, totalAmount, status],
            function(err) {
                if (err) {
                    dbUsers.run('ROLLBACK');
                    return res.status(500).json({ error: '创建订单失败: ' + err.message });
                }
                
                dbUsers.run('COMMIT');
                res.status(201).json({ 
                    message: '订单创建成功。', 
                    orderId: this.lastID
                });
            }
        );
    });
});

// 获取用户订单
app.get('/my_orders/:userId', (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ error: '用户ID是必填项。' });
    }

    const sql = `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`;
    dbUsers.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: '获取订单列表失败: ' + err.message });
        }
        
        const orders = rows.map(order => ({
            ...order,
            order_details: JSON.parse(order.order_details || '[]')
        }));
        res.status(200).json(orders);
    });
});

// 更新订单状态
app.put('/update_order_status/:orderId', (req, res) => {
    console.log(`收到 PUT 请求到 /update_order_status/${req.params.orderId}`);
    const orderId = req.params.orderId;
    const newStatus = req.body.status;

    if (!newStatus) {
        return res.status(400).json({ error: '缺少新的订单状态' });
    }

    const sql = `UPDATE orders SET status = ? WHERE id = ?`;
    dbUsers.run(sql, [newStatus, orderId], function(err) {
        if (err) {
            console.error('更新订单状态错误:', err.message);
            return res.status(500).json({ error: '更新订单状态失败', details: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: '未找到指定订单或状态已是最新' });
        }

        console.log(`订单 ${orderId} 状态已更新为 ${newStatus}`);
        res.json({ message: `订单 ${orderId} 状态已更新为 ${newStatus}` });
    });
});

// 获取用户评论 API
app.get('/user/comments/:userId', (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ error: '缺少用户ID。' });
    }

    // 修改 SQL 查询，通过 product_id 关联 products 表获取商品标题
    const sql = `
        SELECT
            r.id,
            r.user_id,
            u.username,
            u.avatar_url,
            r.product_id,
            p.title AS productTitle,
            r.rating,
            r.comment_text,
            r.created_at
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN products p ON r.product_id = p.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
    `;

    dbUsers.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error('获取用户评论时数据库出错:', err.message);
            return res.status(500).json({ error: '获取用户评论失败: ' + err.message });
        }
        res.status(200).json(rows);
    });
});

// 提交商品评价
app.post('/submit_review', (req, res) => {
    const { userId, productId, rating, commentText } = req.body;

    if (!userId || !productId || rating == null || rating < 1 || rating > 5) {
        return res.status(400).json({ error: '缺少必要的评价信息。' });
    }

    const sql = `INSERT INTO reviews (user_id, product_id, rating, comment_text) VALUES (?, ?, ?, ?)`;
    dbUsers.run(sql, [userId, productId, rating, commentText], function(err) {
        if (err) {
            return res.status(500).json({ error: '提交评价失败: ' + err.message });
        }
        res.status(201).json({ message: '评价提交成功。', reviewId: this.lastID });
    });
});

// 获取商品评价
app.get('/product_reviews/:productId', (req, res) => {
    const productId = req.params.productId;

    if (!productId) {
        return res.status(400).json({ error: '缺少商品ID。' });
    }

    const sql = `
        SELECT
            r.id,
            r.user_id,
            u.username,
            u.avatar_url,
            r.product_id,
            r.rating,
            r.comment_text,
            r.created_at
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
    `;

    dbUsers.all(sql, [productId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: '获取商品评价失败: ' + err.message });
        }
        res.status(200).json(rows);
    });
});

// 头像上传配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'public', 'avatars');
        require('fs').mkdir(uploadPath, { recursive: true }, (err) => {
            if (err) {
                console.error('创建上传目录失败:', err);
                return cb(err, null);
            }
            cb(null, uploadPath);
        });
    },
    filename: function (req, file, cb) {
        const userId = req.body.userId;
        if (!userId) {
             return cb(new Error('用户ID未提供'), null);
        }
        const ext = path.extname(file.originalname);
        const filename = `${userId}-${Date.now()}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

// 头像上传
app.post('/upload_avatar', upload.single('avatar'), (req, res) => {
    const userId = req.body.userId;
    const avatarFile = req.file;

    if (!userId || !avatarFile) {
        return res.status(400).json({ success: false, message: '缺少必要参数。' });
    }

    const avatarUrl = `${BASE_URL}/avatars/${avatarFile.filename}`;
    const sql = `UPDATE users SET avatar_url = ? WHERE id = ?`;
    
    dbUsers.run(sql, [avatarUrl, userId], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: '更新头像失败: ' + err.message });
        }
        res.status(200).json({ success: true, message: '头像更新成功！', avatarUrl: avatarUrl });
    });
});

// 获取新闻列表
app.get('/news', (req, res) => {
    const sql = `SELECT * FROM news ORDER BY date DESC, time DESC`;
    dbUsers.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: '获取新闻列表失败: ' + err.message });
        }
        res.status(200).json(rows);
    });
});

// 获取商品库存
app.get('/product_stock/:productId', (req, res) => {
    const productId = req.params.productId;
    
    const sql = `SELECT stock FROM products WHERE id = ?`;
    dbUsers.get(sql, [productId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: '获取库存失败' });
        }
        if (!row) {
            return res.status(404).json({ error: '商品不存在' });
        }
        res.json({ productId, stock: row.stock });
    });
});

// 批量检查库存
app.post('/check_stock', (req, res) => {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: '无效的商品列表' });
    }
    
    const productIds = items.map(item => item.productId);
    const placeholders = productIds.map(() => '?').join(',');
    
    const sql = `SELECT id, stock FROM products WHERE id IN (${placeholders})`;
    dbUsers.all(sql, productIds, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: '检查库存失败' });
        }
        
        const stockInfo = {};
        rows.forEach(row => {
            stockInfo[row.id] = row.stock;
        });
        
        const result = items.map(item => {
            const availableStock = stockInfo[item.productId] || 0;
            return {
                productId: item.productId,
                requestedQuantity: item.quantity,
                availableStock,
                hasEnoughStock: availableStock >= item.quantity
            };
        });
        
        res.json(result);
    });
});


// 管理员登录 API
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: '管理员用户名和密码是必填项。' });
    }

    const sql = `SELECT id, username, password_hash FROM admins WHERE username = ?`;
    dbUsers.get(sql, [username], async (err, admin) => {
        if (err) {
            console.error('管理员登录时数据库出错:', err.message);
            return res.status(500).json({ error: '管理员登录失败: ' + err.message });
        }
        if (!admin) {
            return res.status(401).json({ error: '无效的管理员用户名或密码。' });
        }

        try {
            // 注意：这里直接比较明文密码，生产环境应使用 bcrypt 等库进行哈希比较
            if (password === admin.password_hash) {
                // TODO: 在生产环境中，这里应该生成并返回 JWT 或其他会话标识
                res.status(200).json({
                    message: '管理员登录成功。',
                    adminId: admin.id,
                    username: admin.username
                });
            } else {
                res.status(401).json({ error: '无效的管理员用户名或密码。' });
            }
        } catch (error) {
            console.error('服务器管理员登录过程中出错:', error.message);
            res.status(500).json({ error: '服务器管理员登录过程中出错: ' + error.message });
        }
    });
});


// 新增：管理员商品管理 API
// 获取所有商品
app.get('/admin/products', (req, res) => {
    const sql = `SELECT * FROM products`;
    dbUsers.all(sql, [], (err, rows) => {
        if (err) {
            console.error('管理员获取商品列表时数据库出错:', err.message);
            return res.status(500).json({ error: '获取商品列表失败: ' + err.message });
        }
        res.status(200).json(rows);
    });
});

// 新增商品
app.post('/admin/products', (req, res) => {
    const { title, description, price, category, image, rate, stock } = req.body;
    if (!title || !price || !stock) {
        return res.status(400).json({ error: '商品标题、价格和库存是必填项。' });
    }

    const sql = `INSERT INTO products (title, description, price, category, image, rate, stock) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    dbUsers.run(sql, [title, description, price, category, image, rate, stock], function(err) {
        if (err) {
            console.error('管理员新增商品时数据库出错:', err.message);
            return res.status(500).json({ error: '新增商品失败: ' + err.message });
        }
        res.status(201).json({ message: '商品新增成功。', productId: this.lastID });
    });
});

// 修改商品
app.put('/admin/products/:productId', (req, res) => {
    const productId = req.params.productId;
    const { title, description, price, category, image, rate, stock } = req.body;

    if (!title && !description && price == null && !category && !image && rate == null && stock == null) {
        return res.status(400).json({ error: '没有提供要更新的商品信息。' });
    }

    let updates = [];
    let params = [];
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (price !== undefined) { updates.push('price = ?'); params.push(price); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (image !== undefined) { updates.push('image = ?'); params.push(image); }
    if (rate !== undefined) { updates.push('rate = ?'); params.push(rate); }
    if (stock !== undefined) { updates.push('stock = ?'); params.push(stock); }

    if (updates.length === 0) {
         return res.status(400).json({ error: '没有提供有效的更新字段。' });
    }

    const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
    params.push(productId);

    dbUsers.run(sql, params, function(err) {
        if (err) {
            console.error('管理员修改商品时数据库出错:', err.message);
            return res.status(500).json({ error: '修改商品失败: ' + err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: '未找到指定商品或没有信息被修改。' });
        }
        res.status(200).json({ message: '商品修改成功。' });
    });
});

// 删除商品
app.delete('/admin/products/:productId', (req, res) => {
    const productId = req.params.productId;

    const sql = `DELETE FROM products WHERE id = ?`;
    dbUsers.run(sql, [productId], function(err) {
        if (err) {
            console.error('管理员删除商品时数据库出错:', err.message);
            return res.status(500).json({ error: '删除商品失败: ' + err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: '未找到指定商品。' });
        }
        res.status(200).json({ message: '商品删除成功。' });
    });
});


// 导出 app 对象
module.exports = app;