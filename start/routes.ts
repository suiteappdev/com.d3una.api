/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'


Route.get('/', async ({ view }) => {
  return view.render('verify');
});


// ========================================================================
// rutas de registro y login ❤️                                       
// nombre del middleware - auth 🎃                          
// se hará uso de los eventos para que los correos se envíen asyncronos ✨   
// ========================================================================


Route.post('/login', 'UsersController.login').as('user.login');
Route.post('/register', 'UsersController.register').as('user.register');

//ruta para verificar el correo electrónico
Route.get('/register/verify/:code', 'UsersController.verify');

//rutas para recuperar contraseña
Route.post('/password/recover', 'UsersController.passwordRecover');
Route.post('/password/reset', 'UsersController.passwordReset');

//ruta no necesaria -- miren si la incluyen o no
Route.post('/password/check/code', 'UsersController.passwordCheckCode');

//login con google
Route.get('/google/redirect', 'UsersController.authGoogle').as('user.authGoogle');
Route.get('/google/callback', 'UsersController.callbackGoogle').as('user.callbackGoogle');

//rutas de perfil de usuario
Route.get('/profile', 'ProfilesController.index').as('profile.index').middleware('auth');
Route.post('/profile/store', 'ProfilesController.store').as('profile.store').middleware('auth');
Route.put('/profile/update', 'ProfilesController.update').as('profile.update').middleware('auth');
Route.put('/profile/update/image', 'ProfilesController.updateImage').as('profile.updateImage').middleware('auth');
