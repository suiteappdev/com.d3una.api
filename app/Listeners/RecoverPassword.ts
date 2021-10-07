import { EventsList } from '@ioc:Adonis/Core/Event'

const axios = require('axios');

export default class RecoverPassword {

    public async onRecoverPassword(data: EventsList['new:password_recover']) {
        //aqui va la petición a la otra api
        await axios.post(process.env.URL_NOTIFICATIONS+'password/recover/email', {
            data: data
        });
    }

    public async onResetPassword(data: EventsList['new:password_reset']) {
        //aqui va la petición a la otra api
        await axios.post(process.env.URL_NOTIFICATIONS+'password/reset', {
            data: data
        });
    }


}
