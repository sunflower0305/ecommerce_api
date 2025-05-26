const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '电商API文档',
      version: '1.0.0',
      description: '电商应用的API接口文档'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发服务器'
      },
      {
        url: 'http://localhost:3000',
        description: '测试服务器'
      }
    ]
  },
  apis: ['./swagger-routes.js'], // 指向包含Swagger注释的文件
};

const specs = swaggerJsdoc(options);
module.exports = specs;