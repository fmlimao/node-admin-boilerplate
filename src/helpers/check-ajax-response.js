module.exports = (response) => {
    return (
        typeof response.code !== 'undefined'
        && typeof response.error !== 'undefined'
    );
};
