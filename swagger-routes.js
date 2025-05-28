/**
 * @swagger
 * tags:
 *   - name: 用户
 *     description: 用户相关接口
 *   - name: 商品
 *     description: 商品相关接口
 *   - name: 评价
 *     description: 评价相关接口
 *   - name: 订单
 *     description: 订单相关接口
 *   - name: 新闻
 *     description: 新闻相关接口
 *   - name: 管理员
 *     description: 管理员相关接口
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         avatar_url:
 *           type: string
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         image:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *         rate:
 *           type: number
 *         stock:
 *           type: integer
 *     Admin:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: 用户注册
 *     tags: [用户]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: 注册成功
 *       409:
 *         description: 用户名已存在
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: 用户登录
 *     tags: [用户]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登录成功
 *       401:
 *         description: 无效的用户名或密码
 */

/**
 * @swagger
 * /search:
 *   get:
 *     summary: 搜索商品
 *     tags: [商品]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, rate]
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: 排序方向
 *     responses:
 *       200:
 *         description: 返回商品列表
 */

/**
 * @swagger
 * /product_reviews/{productId}:
 *   get:
 *     summary: 获取商品评价
 *     tags: [评价]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 返回评价列表
 */

/**
 * @swagger
 * /user/comments/{userId}:
 *   get:
 *     summary: 获取用户评论
 *     tags: [评价]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 返回用户评论列表
 *       400:
 *         description: 缺少用户ID
 *       500:
 *         description: 获取用户评论失败
 */

/**
 * @swagger
 * /submit_review:
 *   post:
 *     summary: 提交商品评价
 *     tags: [评价]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - productId
 *               - rating
 *             properties:
 *               userId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               commentText:
 *                 type: string
 *     responses:
 *       201:
 *         description: 评价提交成功
 */

/**
 * @swagger
 * /create_order:
 *   post:
 *     summary: 创建订单
 *     tags: [订单]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - items
 *               - totalAmount
 *             properties:
 *               userId:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *               totalAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: 订单创建成功
 */

/**
 * @swagger
 * /my_orders/{userId}:
 *   get:
 *     summary: 获取用户订单
 *     tags: [订单]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 返回订单列表
 */

/**
 * @swagger
 * /update_order_status/{orderId}:
 *   put:
 *     summary: 更新订单状态
 *     tags: [订单]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 description: 新的订单状态
 *                 example: 已支付
 *     responses:
 *       200:
 *         description: 订单状态更新成功
 *       400:
 *         description: 缺少新的订单状态
 *       404:
 *         description: 未找到指定订单
 *       500:
 *         description: 更新订单状态失败
 */

/**
 * @swagger
 * /news:
 *   get:
 *     summary: 获取新闻列表
 *     tags: [新闻]
 *     responses:
 *       200:
 *         description: 返回新闻列表
 */

/**
 * @swagger
 * /product_stock/{productId}:
 *   get:
 *     summary: 获取商品库存
 *     tags: [商品]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 返回商品库存信息
 */

/**
 * @swagger
 * /check_stock:
 *   post:
 *     summary: 批量检查库存
 *     tags: [订单]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: 返回库存检查结果
 */

/**
 * @swagger
 * /upload_avatar:
 *   post:
 *     summary: 上传用户头像
 *     tags: [用户]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - avatar
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: 用户ID
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: 头像图片文件
 *     responses:
 *       200:
 *         description: 头像上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 avatarUrl:
 *                   type: string
 *       400:
 *         description: 缺少用户ID或头像文件
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 上传头像失败
 */
/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: 管理员登录
 *     tags: [管理员]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 管理员登录成功
 *       401:
 *         description: 无效的管理员用户名或密码
 *       500:
 *         description: 服务器错误
 */

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: 获取所有商品列表
 *     tags: [管理员]
 *     responses:
 *       200:
 *         description: 返回所有商品列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: 服务器错误
 *   post:
 *     summary: 新增商品
 *     tags: [管理员]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - stock
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *               rate:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: 商品新增成功
 *       400:
 *         description: 缺少必要参数
 *       500:
 *         description: 服务器错误
 */

/**
 * @swagger
 * /admin/products/{productId}:
 *   put:
 *     summary: 修改商品信息
 *     tags: [管理员]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *               rate:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 商品修改成功
 *       400:
 *         description: 缺少必要参数
 *       404:
 *         description: 未找到指定商品
 *       500:
 *         description: 服务器错误
 *   delete:
 *     summary: 删除商品
 *     tags: [管理员]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 *     responses:
 *       200:
 *         description: 商品删除成功
 *       404:
 *         description: 未找到指定商品
 *       500:
 *         description: 服务器错误
 */

/**
 * @swagger
 * /upload_product_image:
 *   post:
 *     summary: 上传商品图片
 *     tags: [管理员]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - productImage
 *             properties:
 *               productImage:
 *                 type: string
 *                 format: binary
 *                 description: 商品图片文件
 *     responses:
 *       200:
 *         description: 图片上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 imageUrl:
 *                   type: string
 *       400:
 *         description: 缺少图片文件
 *       500:
 *         description: 上传图片失败
 */