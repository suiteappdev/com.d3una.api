// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

//importar los squemas de validaciones y las reglas de validación
import { schema, rules } from "@ioc:Adonis/Core/Validator";

import Application from '@ioc:Adonis/Core/Application';

//drive para recuperar las imagenes
import Drive from '@ioc:Adonis/Core/Drive';

//importar el modelo Profile
const Profile = require('../../../models/Profile');

//recordar importar el modelo relacionado
const User = require('../../../models/User');

export default class ProfilesController {

    //crear un perfil para el usuario

    public async index( { request, response } ){

        const profile = await Profile.findOne( { user: request.user.id } ).populate('user');

        let img = await Drive.get(profile.imagen);

        response.status(200).send({
            success: profile,
            imagen : img
         });
    }

    //registra el perfil del usuario autenticado
    public async store( { request, response } ){

        const { accountType } = request.all();

        //si el tipo de cuenta es de empresa entonces
        if( accountType == "enterprise" ){

            //armar el esquema de validaciones
            const enterpriseSchema = schema.create({
                mobile      : schema.string({ }, [rules.required(), rules.minLength(8)]),
                address     : schema.string({ }, [rules.required()]),
                company_name: schema.string({ }, [rules.required()]),
            });

            //ejecutar las validaciones del squema
            const profileEnterpriseSchema = await request.validate( { schema: enterpriseSchema } );

            //armar el perfil en un objeto
            let profile = new Profile({
                type             :  "enterprise",
                mobile           :  profileEnterpriseSchema.mobile,
                address          :  profileEnterpriseSchema.address,
                company_name     :  profileEnterpriseSchema.company_name,
                user             :  request.user.id
            });

            const resp = await profile.save();

            if(resp){
                response.status(200).send( { success: "profile created successfully" } );
            }else{
                response.status(500).send( { danger : "profile could not be created" } );
            }

        }else if( accountType == "individual" ){

            //armar el squema de validación
            const individualSchema = schema.create({
                mobile        : schema.string({ }, [rules.required(), rules.minLength(8)]),
                address       : schema.string({ }, [rules.required()]),
                occupation    : schema.string({ }, [rules.required()]),
                experience    : schema.string({ }, [rules.required()]),
                age           : schema.number()
            });

            //ejecutar el squema de validación

            const profileIndividualSchema = await request.validate( { schema: individualSchema } );

            let profile = new Profile({
                type             : "individual",
                mobile           : profileIndividualSchema.mobile,
                address          : profileIndividualSchema.address,
                occupation       : profileIndividualSchema.occupation,
                experience       : profileIndividualSchema.experience,
                age              : profileIndividualSchema.age,
                user             : request.user.id
            });

            const resp = await profile.save();

            if(resp){
                response.status(200).send( { success: "profile created successfully"} );
            }else{
                response.status(500).send( { danger : "profile could not be created"} );
            }

        }else{
            response.status(400).send({danger: "profile type not found"});
        }
    }

    //actualizar perfil
    public async update( { request, response } ){

        const profile = await Profile.findOne( { user: request.user.id } ); 
        const query = { user: request.user.id };

        //si el tipo de cuenta es de empresa entonces
        if( profile.type == "enterprise" ){

            //armar el esquema de validaciones
            const enterpriseSchema = schema.create({
                mobile      : schema.string({ }, [rules.required(), rules.minLength(8)]),
                address     : schema.string({ }, [rules.required()]),
                company_name: schema.string({ }, [rules.required()]),
            });

            //ejecutar las validaciones del squema
            const profileEnterpriseSchema = await request.validate( { schema: enterpriseSchema } );

            const profile = await Profile.updateOne(query, {
                mobile           :  profileEnterpriseSchema.mobile,
                address          :  profileEnterpriseSchema.address,
                company_name     :  profileEnterpriseSchema.company_name,
            });

            if(profile.modifiedCount > 0){
                response.status(200).send( { success: "profile updated successfully"} );
            }else{
                response.status(500).send( { danger: "profile could not be updated"} );
            }

        }else if( profile.type == "individual" ){

            //armar el squema de validación
            const individualSchema = schema.create({
                mobile        : schema.string({ }, [rules.required(), rules.minLength(8)]),
                address       : schema.string({ }, [rules.required()]),
                occupation    : schema.string({ }, [rules.required()]),
                experience    : schema.string({ }, [rules.required()]),
                age           : schema.number()
            });

            //ejecutar el squema de validación
            const profileIndividualSchema = await request.validate( { schema: individualSchema } );

            const profile = await Profile.updateOne(query, {
                mobile           : profileIndividualSchema.mobile,
                address          : profileIndividualSchema.address,
                occupation       : profileIndividualSchema.occupation,
                experience       : profileIndividualSchema.experience,
                age              : profileIndividualSchema.age,
            });

            if(profile.modifiedCount > 0){
                response.status(200).send( { success: "profile updated successfully"} );
            }else{
                response.status(500).send( { danger: "profile could not be updated"} );
            }

        }
    }

    //aqui llega la ruta del bucket s3 para la imagen
    public async updateImage( { request, response } ){

        const { url } = request.all();

        if (url) {

            const query = { user: request.user.id };

            const profile = await Profile.updateOne(query, { imagen: url } );

            if(profile.modifiedCount > 0){
                
                response.status(200).send( { success: "image updated successfully"} );

            }else{

                response.status(500).send( { danger: "image could not be updated"} );

            }
        }else{
                response.status(400).send( { warning: "please upload a valid image"} );
        }
    }

}
