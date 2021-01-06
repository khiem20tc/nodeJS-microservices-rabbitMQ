const amqp = require('amqplib/callback_api');
const amqpURL = 'amqps://sibnwyox:iVA9DcR9rL09CZNzAz2gUgrJ-s773rle@shark.rmq.cloudamqp.com/sibnwyox'

exports.send = async (data, nameQueue) => {
    let returnData;
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
      
            console.log(' [x] Requesting service ');
            console.log('Data send', data);
      
            channel.consume(q.queue, function(msg) {
              if (msg.properties.correlationId == correlationId) {
                console.log(' [.] Got %s', msg.content.toString());
                returnData = msg.content.toString();
                setTimeout(function() { 
                  connection.close(); 
                  process.exit(0) 
                }, 500); //500 miliseconds
              }
            }, {
              noAck: true
            });
      
            channel.sendToQueue(nameQueue,
              Buffer.from(JSON.stringify(data)),{ 
                correlationId: correlationId, 
                replyTo: q.queue });
          });
        });
      });
      
      const generateUuid = () => {
        return Math.random().toString() +
               Math.random().toString() +
               Math.random().toString();
      }
      return returnData;
}

exports.receive = async (funcname, nameQueue) => {
    amqp.connect(amqpURL, function(error0, connection) {
        if (error0) {
          throw error0;
        }
        connection.createChannel(function(error1, channel) {
          if (error1) {
            throw error1;
          }
          const queue = nameQueue;
      
          channel.assertQueue(queue, {
            durable: false
          });
          channel.prefetch(1);
          console.log(' [x] Awaiting RPC requests');

          channel.consume(queue, function reply(msg) {
            const message = JSON.parse(msg.content)
      
            console.log("Data receive: ", message)
      
            let res;

            if (funcname && (typeof funcname == "function")) {
                res = funcname(message);   
             }
      
            channel.sendToQueue(msg.properties.replyTo,
              Buffer.from(res), {
                correlationId: msg.properties.correlationId
              });
      
            channel.ack(msg);
          });
        });
      });
}