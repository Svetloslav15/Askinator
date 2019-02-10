module.exports = {
    development: {
        port: 1000,
        dbPath: 'mongodb://localhost:27017/askinator'
    },
    production: {
        port: process.env.PORT,
        dbPath: 'mongodb://Anonymous:veryhardpass11@ds127535.mlab.com:27535/askinator'
    }
};