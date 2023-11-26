const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';

function connectToDatabase() {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
            if (err) {
                reject(err);
            } else {
                resolve(client);
            }
        });
    });
}

function findDocuments(client) {
    return new Promise((resolve, reject) => {
        const db = client.db("mydb");
        const collection = db.collection('customers');
        const cursor = collection.find({}).limit(10);

        const documents = [];
        cursor.forEach(
            doc => documents.push(doc),
            err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(documents);
                }
            }
        );
    });
}

function closeConnection(client) {
    return new Promise((resolve, reject) => {
        client.close(err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function findAll() {
    connectToDatabase()
        .then(client => {
            console.log('1');
            return findDocuments(client);
        })
        .then(documents => {
            console.log('2');
            documents.forEach(doc => console.log(doc));
            console.log('5');
        })
        .catch(err => {
            console.log(err);
        })
        .finally(() => {
            closeConnection(client)
                .then(() => console.log('Connection closed'))
                .catch(err => console.log('Error closing connection:', err));
        });
}

setTimeout(() => {
    findAll();
    console.log('iter');
}, 5000);
