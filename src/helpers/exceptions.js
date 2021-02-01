function RegisterNotFound(message) {
    const error = new Error(message);

    error.name = 'RegisterNotFound';
    error.code = 404;
    error.message = message;

    return error;
}

RegisterNotFound.prototype = Object.create(Error.prototype);

function InvalidForm(message) {
    const error = new Error(message);

    error.name = 'InvalidForm';
    error.code = 404;
    error.message = message;

    return error;
}

InvalidForm.prototype = Object.create(Error.prototype);

module.exports = {
    RegisterNotFound,
    InvalidForm,
};
