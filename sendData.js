const rabbitMQ = require("./rabbitMQ.config")

rabbitMQ.send("Do something", "RPC");