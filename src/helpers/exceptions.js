function RegisterNotFound(message) {
    const error = new Error(message);

    error.name = 'RegisterNotFound';
    error.code = 404;
    error.message = message;

    return error;
}

RegisterNotFound.prototype = Object.create(Error.prototype);

module.exports = {
    RegisterNotFound,
};
