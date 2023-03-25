const mongoose = require('mongoose');
require('dotenv').config()
const app = require('./app');

const URI = process.env.DB

mongoose.connect(URI, {
    useNewUrlParser: true,
}).then(()=> console.log('Database connected successfully.'))

const PORT = process.env.PORT || 3030

const server = app.listen(PORT, ()=> console.log(`Server is listing on port ${PORT}`))