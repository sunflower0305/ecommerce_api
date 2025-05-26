# 电商API服务

## API文档

本项目使用Swagger/OpenAPI生成API文档。

### 查看API文档

1. 启动服务器：
```
npm start
```

2. 在浏览器中访问：
```
http://localhost:3000/api-docs
```

### 添加新的API文档

在`swagger-routes.js`文件中使用JSDoc格式添加API注释。

示例：
```javascript
/**
 * @swagger
 * /api/endpoint:
 *   get:
 *     summary: 接口描述
 *     tags: [分类]
 *     responses:
 *       200:
 *         description: 成功响应
 */
```