'use strict'
const Data = use('App/Model/SenderReceiver')  // EDIT
const Distric = use('App/Model/Distric')  // EDIT
const City = use('App/Model/City')  // EDIT
const HistoryAction = use('App/Classes/HistoryAction')
const Menu = use('App/Model/Menu')
const Customer = use('App/Model/Customer')
const Antl = use('Antl')
const Helpers = use('Helpers')

class SenderReceiverController{
  constructor () {
      this.type = 1  // EDIT
      this.key = "sender-receiver"  // EDIT
      this.menu = "trans_sender_receiver"  // EDIT
      this.download = "SenderReceiver.xlsx"  // EDIT
      this.room = "sender-receiver"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('sender_receiver.title')  // EDIT
      const data = yield Data.query().where('type',this.type).orderBy('id', 'desc').fetch()
      const distric = yield Distric.query().where('active',1).fetch()
      const customer = yield Customer.query().where('active',1).fetch()
      const city = yield City.query().where('active',1).fetch()
      const show = yield response.view('pos/pages/sender_receiver', {key : this.key ,title: title, customer : customer.toJSON(), city : city.toJSON(),distric : distric.toJSON() , data: data.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response){
    try{
      const data = JSON.parse(request.input('data'))
      const arr = yield Data.query().where('type',data).orderBy('id', 'desc').fetch()
      if(arr){
          response.json({ status: true  , data : arr})
      }else{
          response.json({ status: false ,  message: Antl.formatMessage('messages.no_data') })
      }
    }catch(e){
      response.json({ status: false , error: true,  message: Antl.formatMessage('messages.error') +' '+ e.message})
    }


  }
  * save (request, response){
    try{
   const permission = JSON.parse(yield request.session.get('permission'))
    const data = JSON.parse(request.input('data'))
    if(data){
      const check = yield Data.query().where('code',data.code).first()
      if(check && check.id != data.id){
        response.json({ status: false, message: Antl.formatMessage('messages.duplicate_code')  })
      }else{
      var result = ''
        var action = 0
        if(data.id != null){
         result =  yield Data.findBy('id', data.id)
         var action = 4
        }else{
         result = new Data()
         var action = 2
        }
          if(permission.a || permission.e){
          result.type = data.type
          result.code = data.code
          result.fullname = data.fullname
          result.phone = data.phone
          result.address = data.address
          result.email = data.email
          result.customer = data.customer
          result.city = data.city
          result.distric = data.distric
          result.active = data.active
          yield result.save()

          // Lưu lịch sử
          const menu = yield Menu.query().where('code',this.menu).first()
          let hs = new HistoryAction()
          var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(result))
          yield rs.save()
          //

          response.json({ status: true , message: Antl.formatMessage('messages.update_success') , data : result})
            }else{
              response.json({ status: false , message: Antl.formatMessage('messages.you_not_permission')})
            }
              }
         }else{
           response.json({ status: false, message: Antl.formatMessage('messages.no_data')  })
           }
         }catch(e){
           response.json({ status: false , message: Antl.formatMessage('messages.update_fail')})
         }
       }
       * delete (request, response){
        try{
         const permission = JSON.parse(yield request.session.get('permission'))
         const data = request.input('data')
         if(data){
           if(permission.d){
             const arr = yield Data.findBy('id', data)
             yield arr.delete()
             // Lưu lịch sử
             const menu = yield Menu.query().where('code',this.menu).first()
             let hs = new HistoryAction()
             var rs = hs.insertRecord(5,request.currentUser.id,menu.id,JSON.stringify(arr))
             yield rs.save()
             //

             response.json({ status: true , message: Antl.formatMessage('messages.delete_success')})
           }else{
             response.json({ status: false , message: Antl.formatMessage('messages.you_are_not_permission_delete')})
           }
         }else{
             response.json({ status: false   , message: Antl.formatMessage('messages.no_data')})
           }
         }catch(e){
           response.json({ status: false , message: Antl.formatMessage('messages.delete_fail')})
         }
       }
  * downloadExcel (request, response){
    response.download(Helpers.storagePath(this.download))
  }

  * import (request, response){
    try{
  const permission = JSON.parse(yield request.session.get('permission'))
  if(permission.a){
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
        result.type = data.type
        result.code = data.code
        result.fullname = data.fullname
        result.phone = data.phone
        result.address = data.address
        result.email = data.email
        result.customer = data.customer
        result.city = data.city
        result.distric = data.distric
        result.active = data.active
        yield result.save()
        arr_push.push(result)
      }
      // Lưu lịch sử
      const menu = yield Menu.query().where('code',this.menu).first()
      let hs = new HistoryAction()
      var rs = hs.insertRecord(6,request.currentUser.id,menu.id,JSON.stringify(arr))
      yield rs.save()
      //
      response.json({ status: true , message: Antl.formatMessage('messages.success_import') , data : arr_push})
    }else{
      response.json({ status: false , message: Antl.formatMessage('messages.no_data')})
    }
          yield file[1].delete()
        }else{
          response.json({ status: false , message: Antl.formatMessage('messages.you_are_not_permission_add')})
        }
        }catch(e){
          response.json({ status: false , message: Antl.formatMessage('messages.failed_import')})
        }
      }
    }
module.exports = SenderReceiverController
