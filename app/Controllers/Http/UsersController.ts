// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'


import { schema, rules } from "@ioc:Adonis/Core/Validator";

import { string, safeEqual, types  } from '@ioc:Adonis/Core/Helpers';

import Event from '@ioc:Adonis/Core/Event';

import Hash from "@ioc:Adonis/Core/Hash";

const jwt = require('jsonwebtoken');

const User = require('../../../models/User');

export default class UsersController {


    //registrar un nuevo usuario //hay que enviar el correo electrónico con la otra api 🔥
    public async register({ request, response}){

        const newUserSchema = schema.create({
            name    : schema.string({}, [ rules.required(), rules.minLength(5)]),
            email   : schema.string({}, [ rules.email(), rules.required() ]),
            password: schema.string({}, [ rules.required(), rules.minLength(8) ])
        });

        const data = await request.validate( { schema:newUserSchema,
            messages: {
                required: 'The {{ field }} is required to create a new account'
            } 
        } );

        const hashedPassword = await Hash.make(data.password);

        let user = new User({
            name    : data.name,
            email   : data.email,
            password: hashedPassword,
            confirmation_code: string.generateRandom(25)
        });

        const res = await user.save();

        if(res){

            //emitir el evento de verificación de correo
            await Event.emit('new:verify_password', res);

            const token = jwt.sign({
                id    : user._id,
                name  : user.name,
                email : user.email
            }, process.env.TOKEN_SECRET, { expiresIn:  '3h'}, process.env.TOKEN_SECRET);
        
            response.status(200).send({
                success: "user created successfully",
                token  : token
            });
        }

    }

    //método para el login de usuario 🍇
    public async login({ request, response }){

        const LoginSchema = schema.create({
            email   : schema.string({}, [ rules.email(), rules.required() ]),
            password: schema.string({}, [ rules.required(), rules.minLength(8) ])
        });

        const data = await request.validate({schema: LoginSchema});

        const user = await User.findOne({email: data.email});

        const validatePassword = await Hash.verify(user.password, data.password);

        if(!validatePassword){
            response.send({ danger: "invalid password" });
        }else{

            const token = jwt.sign({
                id   : user._id,
                name : user.name,
                email: user.email
            }, process.env.TOKEN_SECRET, {expiresIn: '3h'}, process.env.TOKEN_SECRET);

            response.status(200).header('auth-token', token).json({
                error:null,
                data :{
                    token
                }
            });
        }
    }

    //autenticación via google
    public async authGoogle( { ally } ){
        return ally.use('google').redirect();
    }

    //callback de la autenticación con google 🕊️
    public async callbackGoogle( { ally, response } ){

        const google = ally.use('google');

        if (google.accessDenied()) {
            return 'Access was denied'
        }

        if (google.stateMisMatch()) {
            return 'Request expired. Retry again'
        }

        if (google.hasError()) {
            return google.getError()
        }

        const user = await google.user()

        const usuario = await User.findOne({email: user.email});

        if(usuario){

            const token = jwt.sign({
                id: usuario._id,
                name: usuario.name, 
                email: usuario.email
            }, process.env.TOKEN_SECRET, { expiresIn: '3h' }, process.env.TOKEN_SECRET);
            
    
            response.header('auth-token', token).json({
                error:null,
                data: {token}
            });

        }else{

            let newUser = new User({
                name: user.name,
                email: user.email,
            });
    
            const res = await newUser.save();
    
            if(res){
                const token = jwt.sign({
                    id: user._id,
                    name: user.name, 
                    email: user.email
                }, process.env.TOKEN_SECRET, { expiresIn: '3h' }, process.env.TOKEN_SECRET);
    
                response.status(200).send({ 
                    success: "successfully authenticated user",
                    token  :  token
                });
            }
        }
    }

    //verifica el correo electrónico (le pone la fecha de verificación) 🐦
    public async verify( { request, response } ){

        const { code } = request.params();

        const query = { confirmation_code: code };

        const user = await User.updateOne(query, {
            verified_at      :  Date.now(),
            confirmation_code:  null
        });

        if(user.modifiedCount > 0){
            response.status(200).send( { success: "email verified successfully"} );
        }else{
            response.status(500).send( { danger : "email could not be updated"} );
        }

    }

    //agregar la notificación de correo electrónico 🐙
    public async passwordRecover( { request, response } ){

        const passwordSchema = schema.create({
            email   : schema.string({}, [ rules.email(), rules.required() ])
        });

        const data = await request.validate( { schema: passwordSchema } );

        const query = { email: data.email };

        const data_user = await User.findOne(query);

        if( types.isNull(data_user) ){
            response.status(500).send( { danger : "This email does not exist"} );
        }else{
            
            await User.updateOne(query, { password_reset_code      :  string.generateRandom(20) } );
            
            //emitir el evento de verificación de correo
            await Event.emit('new:password_recover', data_user);

            response.status(200).send( { success: "recovery code generated correctly"} );
        }

    }

    //migrar esto al servicio de notificaciones ❄️
    public async passwordCheckCode( { request, response } ){

        const passwordSchema = schema.create({
            email              : schema.string({}, [ rules.email(), rules.required() ]),
            code               : schema.string({}, [ rules.required()])
        });

        const data = await request.validate( { schema: passwordSchema } );

        const user = await User.findOne({email: data.email});

        if( safeEqual( user.password_reset_code, data.code ) ){

            response.send( { 
                success: "you can proceed with password change",
                email  : user.email, 
                code   : user.code 
            } );

        }else{

            response.send( { 
                danger : "the code is not valid"
            } ); 

        }

    }

    //migrar esto al servicio de notificaciones //aqui se vuelve a llamar a la api de correos ☃️
    public async passwordReset( { request, response } ){
        // validaciones del request mediante el schema ['🌟', '🌈2']
        const passwordSchema = schema.create({
            email              : schema.string({}, [ rules.email(), rules.required() ]),
            code               : schema.string({}, [ rules.required()]),
            password           : schema.string({}, [ rules.required(), rules.minLength(8)])
        });

        //validar el schema
        const data = await request.validate( { schema: passwordSchema } );

        //query de busqueda del usuario
        const query = { email: data.email, code: data.code };

        //hashear la contraseña
        const hashedPassword = await Hash.make(data.password);

        //buscar usuario y actualizar contraseña
        const user = await User.updateOne(query, {
            password           : hashedPassword,
            password_reset_code: null
        });

        //si hubo un cambio mandame el mensaje
        if(user.modifiedCount > 0){
            //buscar los datos del usuario
            const data_user = await User.findOne(query);

            let data_ = { name: data_user.name, email: data_user.email, password: data.password }

            // aqui va la otra petición a la api de notificaciones papu ['🦄', '🌈1']
            await Event.emit('new:password_reset', data_ );
              
            response.status(200).send( { success: "password changed successfull"} );
        }else{
            response.status(500).send( { danger : "could not update password"} );
        }

    }

}
