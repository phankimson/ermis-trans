'use strict'
const Hash = use('Hash')
const Data = use('App/Model/User')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Inventory = use('App/Model/Inventory')  // EDIT

class PosUserManagerController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "user"  // EDIT
      this.download = "User.xlsx"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('user.title')  // EDIT
      const data = yield Data.query().where('role','>','1').orderBy('id', 'desc').fetch()
      const inventory = yield Inventory.query().where('active', 1).fetch()
      const show = yield response.view('pos/pages/user', {key : this.key ,title: title , data: data.toJSON() , inventory :inventory.toJSON()  })  // EDIT
      response.send(show)
  }

  * save (request, response){
      try {
    const data = JSON.parse(request.input('data'))
    if(data){
      const check = yield Data.query().where('username',data.username).orWhere('email',data.email).first()
      if(check && check.id != data.id){
        response.json({ status: false, message: Antl.formatMessage('messages.duplicate_username')  })
      }else{
      var result = ''
        if(data.id != null){
          result =  yield Data.findBy('id', data.id)
          result.password = (data.password != "") ? yield Hash.make(data.password) : result.password
         }else{
          result = new Data()
           result.password = data.password
         }
          result.barcode = data.barcode
          result.username = data.username
          result.fullname = data.fullname
          result.firstname = data.firstname
          result.lastname = data.lastname
          result.identity_card = data.identity_card
          result.birthday = data.birthday?data.birthday:'0000-00-00'
          result.phone = data.phone
          result.email = data.email
          result.address = data.address
          result.city = data.city
          result.jobs = data.jobs
          result.country = data.country
          result.about = data.about
          result.role = data.role
          result.stock_default = data.stock_default
          result.active = data.active
          yield result.save()
       response.json({ status: true , message: Antl.formatMessage('messages.update_success') , data : result})
     }
    }else{
      response.json({ status: false , message: Antl.formatMessage('messages.update_fail')})
    }
    } catch (e) {
    response.json({ status: false , message: Antl.formatMessage('messages.please_fill_field')})
    }
  }
  * delete (request, response){
    const data = request.input('data')
    if(data){
        const arr = yield Data.findBy('id', data)
        yield arr.delete()
        response.json({ status: true , message: Antl.formatMessage('messages.delete_success')})
    }else{
        response.json({ status: false  ,message: Antl.formatMessage('messages.delete_fail')})
    }
  }
  * downloadExcel (request, response){
    response.download(Helpers.storagePath(this.download))
  }

  * import (request, response){

    const file = request.file('files', {
      allowedExtensions: ['xls', 'xlsx']
    })

    var XLSX = require('xlsx')
    var workbook = XLSX.readFile(file[1].tmpPath())
    var sheet_name_list = workbook.SheetNames
    const arr = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
    if(arr){
      let arr_push = []
      for(let data of arr){
        var result = new Data()
        result.code = data.code
        result.username = data.username
        result.password = data.password
        result.fullname = data.fullname
        result.firstname = data.firstname
        result.lastname = data.lastname
        result.identity_card = data.identity_card
        result.birthday = data.birthday?data.birthday:'0000-00-00'
        result.phone = data.phone
        result.email = data.email
        result.address = data.address
        result.city = data.city
        result.jobs = data.jobs
        result.country = data.country
        result.about = data.about
        result.role = data.role
        result.stock_default = data.stock_default
        result.active = data.active
        yield result.save()
        arr_push.push(result)
      }
      response.json({ status: true , message: Antl.formatMessage('messages.success_import') , data : arr_push})
    }else{
      response.json({ status: false , message: Antl.formatMessage('messages.failed_import')})
    }

    yield file[1].delete()
  }
}
module.exports = PosUserManagerController
