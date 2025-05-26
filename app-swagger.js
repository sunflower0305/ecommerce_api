const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

// 导入原始app.js
const app = require('./app');

// 添加Swagger UI路由
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

module.exports = app;