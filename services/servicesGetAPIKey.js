#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

var amqpURL = 'amqps://sibnwyox:iVA9DcR9rL09CZNzAz2gUgrJ-s773rle@shark.rmq.cloudamqp.com/sibnwyox'

var args = process.argv.slice(2);

if (args.length != 2) {
  console.log("Usage: serviceCreateAPIKey.js name symbol");
  process.exit(1);
}

amqp.connect(amqpURL, function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    channel.assertQueue('', {
      exclusive: true
    }, function(error2, q) {
      if (error2) {
        throw error2;
      }
      var correlationId = generateUuid();
      var name = args[0];
      var symbol = args[1];
      var message = {name, symbol};

      console.log(' [x] Requesting createAPIKey(%s,%s)', name, symbol);

      channel.consume(q.queue, function(msg) {
        if (msg.properties.correlationId == correlationId) {
          console.log(' [.] Got %s', msg.content.toString());
          setTimeout(function() { 
            connection.close(); 
            process.exit(0) 
          }, 500);
        }
      }, {
        noAck: true
      });

      channel.sendToQueue('API_Key_queue',
        Buffer.from(JSON.stringify(message)),{ 
          correlationId: correlationId, 
          replyTo: q.queue });
    });
  });
});

function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}