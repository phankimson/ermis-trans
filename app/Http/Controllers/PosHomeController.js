'use strict'
const Inventory = use('App/Model/Inventory')

class PosHomeController{

    * show (request, response){
        const index = yield response.view('pos.pages.index')
        response.send(index)
    }
     * login (request, response){
        const session = request.currentUser
        if(!session){
        const inventory = yield Inventory.query().where('active',1).fetch()
        const index = yield response.view('pos/pages/login',{ inventory: inventory.toJSON() })
        response.send(index)
        }else{
        response.redirect('index')
        }
    }

}
module.exports = PosHomeController
