const express = require('express');
const multer = require('multer');
const path = require('path');
const File = require('./models/file');
const { v4: uuidv4 } = require('uuid');

const app = express();


app.use(express.static('public'));

const connectDB = require('./config/db');
connectDB();

app.use(express.json());

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.sendFile('index.html');
})

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/') ,
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
              cb(null, uniqueName)
    } ,
});

let upload = multer({ storage, limits:{ fileSize: 1000000 * 100 }, }).single('myfile'); //100mb

app.post('/', (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).send({ error: err.message });
      }
        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size
        });
        const response = await file.save();
        res.json({ file: `localhost:3000/files/${response.uuid}` });
      });
});

app.get('/files/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        // Link expired
        if(!file) {
            return res.render('download', { error: 'Link has been expired.'});
        } 
        return res.render('download', { uuid: file.uuid, fileName: file.filename, fileSize: file.size, downloadLink: `http://localhost:3000/files/download/${file.uuid}` });
    } catch(err) {
        return res.render('download', { error: 'Something went wrong.'});
    }
});

app.get('/files/download/:uuid', async (req, res) => {
    // Extract link and get file from storage send download stream 
    const file = await File.findOne({ uuid: req.params.uuid });
    // Link expired
    if(!file) {
         return res.render('download', { error: 'Link has been expired.'});
    } 
    const response = await file.save();
    const filePath = `${__dirname}/${file.path}`;
    res.download(filePath,(err) => {
        if (err) {
            res.send({
                error : err,
                msg   : "Problem downloading the file"
            })
        }});
 });

app.listen(3000, console.log(`Listening on port 3000`));