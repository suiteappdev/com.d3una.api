import Event from '@ioc:Adonis/Core/Event';

/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/
//evento para enviar correo de verificación
Event.on('new:verify_password', 'Verify.onNewUser');
Event.on('new:password_recover', 'RecoverPassword.onRecoverPassword');
Event.on('new:password_reset', 'RecoverPassword.onResetPassword');
