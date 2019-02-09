module.exports = {
    development: {
        port: 3000,
        dbPath: 'mongodb://localhost:27017/askinator'
    },
    production: {
        port: process.env.PORT,
        dbPath: ''
    }
};