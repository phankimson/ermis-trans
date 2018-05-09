'use strict'
const Data = use('App/Model/ParcelVolumes')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const HistoryAction = use('App/Classes/HistoryAction')
const Menu = use('App/Model/Menu')
const NumberIncreases = use('App/Model/NumberIncreases')

class ParcelVolumesController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "parcel-volumes"  // EDIT
      this.menu = "trans_parcel_volumes"  // EDIT
      this.download = "ParcelVolumes.xlsx"  // EDIT
      this.room = "parcel-volumes"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('parcel_volumes.title')  // EDIT
      const data = yield Data.query().orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/parcel_volumes', {key : this.key ,room : this.room ,title: title , data: data.toJSON()})  // EDIT
      response.send(show)
  }

  * save (request, response){
      try {
    const data = JSON.parse(request.input('data'))
    const permission = JSON.parse(yield request.session.get('permission'))
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
          result.code = data.code
          result.name = data.name
          result.name_en = data.name_en
          result.description = data.description
          result.price_add = data.price_add
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
           response.json({ status: false , message: Antl.formatMessage('messages.you_not_permission') })
         }
        }
       }else{
         response.json({ status: false , message: Antl.formatMessage('messages.no_data') })
         }
       } catch (e) {
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
        // Lưu lịch sử
        const menu = yield Menu.query().where('code',this.menu).first()
        let hs = new HistoryAction()
        var rs = hs.insertRecord(5,request.currentUser.id,menu.id,JSON.stringify(arr))
        yield rs.save()
        //
        yield arr.delete()
        response.json({ status: true , message: Antl.formatMessage('messages.delete_success')})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.you_are_not_permission_delete')})
      }
    }else{
        response.json({ status: false ,message: Antl.formatMessage('messages.no_data')  })
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
        result.code = data.code
        result.name = data.name
        result.name_en = data.name_en
        result.description = data.description
        result.price_add = data.price_add
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
module.exports = ParcelVolumesController
