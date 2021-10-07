import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

const jwt = require('jsonwebtoken');

export default class Auth {
  
  public async handle ({request, response}: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    
    const token = request.header('auth-token');

    if(!token){
      return response.status(401).json({error: "access denied"});
    }
    
    try {
      
      const verified = jwt.verify(token, process.env.TOKEN_SECRET);

      request.user = verified;

      await next()

    } catch (error) {

      return response.status(401).json( { error: error} );
      
    }

  }
}
