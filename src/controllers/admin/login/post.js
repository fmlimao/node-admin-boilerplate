const axios = require('axios');
const checkAjaxResponse = require('../../../helpers/check-ajax-response');

module.exports = async (req, res) => {
    function callback(response) {
        if (!checkAjaxResponse(response)) {
            // console.log('response', response);
            ret.setError(true);
            ret.setCode(400);
            ret.addMessage('Erro interno.');
            return res.status(ret.getCode()).json(ret.generate());
        }

        ret.setError(response.error);

        for (let i in response.messages) {
            ret.addMessage(response.messages[i]);
        }

        for (let fieldId in response.form) {
            ret.setFieldError(fieldId, response.form[fieldId].error);
            ret.addFieldMessage(fieldId, response.form[fieldId].messages);
        }


        if (response.content.token) {
            console.log('token', response.content.token);
            res.cookie('auth', {
                token: response.content.token,
            });
        }

        res.status(ret.getCode()).json(ret.generate());
    }

    let ret = req.ret;

    try {
        ret.addFields(['email', 'password']);

        let { email, password } = req.body;

        const url = `${process.env.APP_HOST}/api/auth`;

        axios.post(url, {
            email,
            password,
        })
            .then(response => {
                callback(response.data);
            })
            .catch(err => {
                callback(err.response.data);
            });

        // res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
    //     console.log('catch response', err.response.data);
        ret.setError(true);
        ret.setCode(400);
    //     ret.addContent('response', err.response.data);
        res.status(ret.getCode()).json(ret.generate());
    }
};
