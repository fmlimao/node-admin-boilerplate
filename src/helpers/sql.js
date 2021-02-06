const knex = require('../database/connection');

async function getAll(query, args) {
    try {
        const ret = (await knex.raw(query, args))[0].map(row => {
            return JSON.parse(JSON.stringify(row));
        });

        return ret;
    } catch (err) {
        console.log(`getAll() ERROR: ${err.message}`);
        return false;
    }
}

async function getOne(query, args) {
    try {
        const ret = (await knex.raw(query, args))[0].map(row => {
            return JSON.parse(JSON.stringify(row));
        });

        return ret.length ? ret[0] : false;
    } catch (err) {
        console.log(`getAll() ERROR: ${err.message}`);
        return false;
    }
}

async function insert(query, args) {
    try {
        const insertId = (await knex.raw(query, args))[0].insertId;
        return insertId;
    } catch (err) {
        console.log(`getAll() ERROR: ${err.message}`);
    }
}

async function update(query, args) {
    try {
        await knex.raw(query, args)
    } catch (err) {
        console.log(`getAll() ERROR: ${err.message}`);
    }
}

module.exports = {
    getAll,
    getOne,
    insert,
    update,
};
