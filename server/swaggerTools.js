const express = require('express');
const path = require('path')
const resolve = args => path.resolve(__dirname, args)

const swaggerTools = require('swagger-tools');
const app = express();

const tools = (swaggerSpec) => new Promise((resolve, reject) => {
    swaggerTools.initializeMiddleware(swaggerSpec, function (middleware) {
        const options = {
            // controllers: './controllers',
            // useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
            useStubs: true
        };
        // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
        app.use(middleware.swaggerMetadata());

        // Validate Swagger requests
        app.use(middleware.swaggerValidator());

        // Route validated requests to appropriate controller
        app.use(middleware.swaggerRouter(options));

        // Serve the Swagger documents and Swagger UI
        app.use(middleware.swaggerUi());

        // Use security
        // app.use(middleware.swaggerSecurity({
        //     Bearer: auth.verifyToken
        // }));
        // Start the server
        resolve()
    });
})
const swaggerSpec = require(resolve('./../target/swagger.json'));
const port = "8000"
tools(swaggerSpec).then(// Start the server
    app.listen(port, function () {
        console.log(`The swagger ui is now running at http://localhost:${port}/docs`);
    }))
module.exports = tools