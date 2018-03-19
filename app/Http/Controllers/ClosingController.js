'use strict'
const Data = use('App/Model/Closing')  // EDIT
const General = use('App/Model/InventoryGeneral')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
var moment = require('moment')

class ClosingController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "closing"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('closing.title')  // EDIT
      const data = yield Data.query().orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/closing', {key : this.key ,title: title , data: data.toJSON()})  // EDIT
      response.send(show)
  }

  * save (request, response){
    try{
    const data = JSON.parse(request.input('data'))
    if(data){
      const check = yield Data.query().where('date',data.date).first()
      var startDate = moment([moment(data.date,"MM/YYYY").format('YYYY'), moment(data.date,"MM/YYYY").format('MM') - 1]).format("YYYY-MM-DD")
      var endDate = moment(startDate).endOf('month').format("YYYY-MM-DD")
      const general = yield General.query().whereBetween('date_voucher',[startDate,endDate ]).where('active',0).first()
      if(check && check.id != data.id){
        response.json({ status: false, message: Antl.formatMessage('messages.duplicate_date')  })
      }else if (general){
        response.json({ status: false, message: Antl.formatMessage('messages.voucher_not_active')  })
      }else{
      var result = ''
        if(data.id != null){
         result =  yield Data.findBy('id', data.id)
        }else{
         result = new Data()
         result.name = "Khóa kỳ "+data.date
         result.name_en = "Lock period "+data.date
         result.date = data.date
        }
          result.active = 1
          yield result.save()
       response.json({ status: true , message: Antl.formatMessage('messages.update_success') , data : result})
     }
    }else{
      response.json({ status: false  , message: Antl.formatMessage('messages.update_fail')  })
    }
  }catch(e){
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error')+' ' + e.message })
  }
  }
  * delete (request, response){
    try{
      const data = request.input('data')
      if(data){
          const arr = yield Data.findBy('id', data)
          yield arr.delete()
          response.json({ status: true , message: Antl.formatMessage('messages.delete_success')})
      }else{
          response.json({ status: false , message: Antl.formatMessage('messages.delete_success') })
      }
    }catch(e){
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error')+' ' + e.message })
    }

  }

}
module.exports = ClosingController
