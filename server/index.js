const express = require('express');
const path = require('path')
const resolve = args => path.resolve(__dirname, args)
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const swaggerTools = require('./swaggerTools')
const app = express();
const port = '8000'

app.use(fileUpload({
    createParentPath: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(resolve('./../public/index.html'))
})
app.use(express.static('public', { dotfiles: 'ignore' }))

app.post('/api/uploadDoc', async (req, res) => {
    try {
        if (!req.files) {
            res.send({
                code: '-1',
                message: 'No file uploaded'
            });
        } else {
            let doc = req.files.doc;
            doc.mv('./uploads/' + doc.name);
            //send response
            res.send({
                code: '200',
                message: 'File is uploaded',
                data: {
                    name: doc.name,
                    mimetype: doc.mimetype,
                    size: doc.size
                }
            });
        }
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
})
// Start the server
app.listen(port, function () {
    console.log(`The server is now running at http://localhost:${port}`);
});