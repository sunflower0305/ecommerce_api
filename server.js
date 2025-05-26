const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const app = require('./app'); // 导入 app.js 中的 app 对象
const port = 3000;

// 设置Swagger UI路由
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "电商API文档"
}));

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log(`API文档可在 http://localhost:${port}/api-docs 访问`);
});