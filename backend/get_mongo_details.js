const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        const client = mongoose.connection.getClient();
        const servers = client.topology.s.seedlist;
        const replicaSet = client.topology.s.options.replicaSet;

        if (servers && replicaSet) {
            const hostString = servers.map(s => `${s.host}:${s.port}`).join(',');
            const standardURI = `mongodb://${process.env.MONGO_URI.split('://')[1].split('@')[0]}@${hostString}/?ssl=true&replicaSet=${replicaSet}&authSource=admin&retryWrites=true&w=majority`;
            fs.writeFileSync('mongo_uri.txt', standardURI);
            console.log('URI written to mongo_uri.txt');
        } else {
            console.log('Error: Missing details');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
