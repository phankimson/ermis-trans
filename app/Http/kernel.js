'use strict'

const Middleware = use('Middleware')

/*
|--------------------------------------------------------------------------
| Global Middleware
|--------------------------------------------------------------------------
|
| Global middleware are executed on every request and must be defined
| inside below array.
|
*/
const globalMiddleware = [
  'Adonis/Middleware/Cors',
  'Adonis/Middleware/BodyParser',
  'Adonis/Middleware/Shield',
  'Adonis/Middleware/Flash',
  'Adonis/Middleware/AuthInit',
  'App/Http/Middleware/ViewUrl',
  'App/Http/Middleware/ViewAssets',
  'App/Http/Middleware/ShortIf',
  'App/Http/Middleware/CurrentUrl',
  'App/Http/Middleware/Language',
  'App/Http/Middleware/GlobalVariable',
]

/*
|--------------------------------------------------------------------------
| Named Middleware
|--------------------------------------------------------------------------
|
| Named middleware are key/value pairs. Keys are later used on routes
| which binds middleware to specific routes.
|
*/
const namedMiddleware = {
  auth: 'Adonis/Middleware/Auth',
  auth_manage :  'App/Http/Middleware/Permission',
  auth_inventory :  'App/Http/Middleware/PermissionInventory',
  recaptcha: 'Adonis/Middleware/Recaptcha'
}

/*
|--------------------------------------------------------------------------
| Register Middleware
|--------------------------------------------------------------------------
|
| Here we finally register our defined middleware to Middleware provider.
|
*/
Middleware.global(globalMiddleware)
Middleware.named(namedMiddleware)
