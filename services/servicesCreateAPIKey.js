#!/usr/bin/env node
const generator = require('generate-password');
const cryptoJS = require('crypto-js');

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
    var queue = 'API_Key_queue';

    channel.assertQueue(queue, {
      durable: false
    });
    channel.prefetch(1);
    console.log(' [x] Awaiting RPC requests');
    channel.consume(queue, function reply(msg) {
      //var n = parseInt(msg.content.toString());
      var message = JSON.parse(msg.content)

      console.log(" [.] getAPIKey(%s,%s)", message.name, message.symbol);

      var res = getAPIKey(message.name,message.symbol);

      channel.sendToQueue(msg.properties.replyTo,
        Buffer.from(res), {
          correlationId: msg.properties.correlationId
        });

      channel.ack(msg);
    });
  });
});

function getAPIKey(name,symbol) {
  const APIKey = generator.generate({
    length: 20,
    numbers: true,
    uppercase: false
  })

  // Encrypt
  //var encrypt = cryptoJS.AES.encrypt(APIKey, 'hknee').toString();
  return (JSON.stringify({"APIKey": APIKey, "name": name, "symbol": symbol}));
}