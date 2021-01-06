const rabbitMQ = require("./rabbitMQ.config")

const process = (param) => {
    return param;
}

rabbitMQ.receive(process, "RPC");

