#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

var amqpURL = 'amqps://sibnwyox:iVA9DcR9rL09CZNzAz2gUgrJ-s773rle@shark.rmq.cloudamqp.com/sibnwyox'

amqp.connect(amqpURL, function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'hello';
        var msg = 'Hello World!';

        channel.assertQueue(queue, {
            durable: false
        });
        channel.sendToQueue(queue, Buffer.from(msg));

        console.log(" [x] Sent %s", msg);
    });
    setTimeout(function() {
        connection.close();
        process.exit(0);
    }, 500);
});