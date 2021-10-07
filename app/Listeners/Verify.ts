import { EventsList } from '@ioc:Adonis/Core/Event'

const axios = require('axios');

export default class Verify {

    public async onNewUser(data: EventsList['new:verify_password']) {
        //aqui va la petición a la otra api
        await axios.post(process.env.URL_NOTIFICATIONS+'confirmation/code/email', {
            data: data
        });
    }

}
