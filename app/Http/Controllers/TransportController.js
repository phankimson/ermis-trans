'use strict'
const Data = use('App/Model/Transport')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const HistoryAction = use('App/Classes/HistoryAction')
const Menu = use('App/Model/Menu')
const Type = use('App/Model/TypeTransport')
const Option = use('App/Model/Option')
const Suplier = use('App/Model/Suplier')

const fs = require('fs')

class TypeTransportController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "transport"  // EDIT
      this.menu = "trans_transport"  // EDIT
      this.download = "Transport.xlsx"  // EDIT
      this.room = "transport"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('transport.title')  // EDIT
      const data = yield Data.query().orderBy('id', 'desc').fetch()
      const type = yield Type.query().orderBy('id', 'desc').where('active',1).fetch()
      const suplier = yield Suplier.query().orderBy('id', 'desc').where('active',1).fetch()
      const show = yield response.view('pos/pages/transport', {key : this.key ,title: title, suplier : suplier.toJSON() , type_transport : type.toJSON() , data: data.toJSON()})  // EDIT
      response.send(show)
  }

  * save (request, response){
     try {
    const data = JSON.parse(request.input('data'))
    const permission = JSON.parse(yield request.session.get('permission'))
    const image = request.file('image', {
      maxSize: '2mb',
      allowedExtensions: ['jpg', 'png', 'jpeg']
    })
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
          result.type_transport = data.type_transport
          result.code = data.code
          result.name = data.name
          result.name_en = data.name_en
          result.number_plates = data.number_plates
          result.registry = data.registry
          result.size = data.size
          result.owner = data.owner
          result.weight = data.weight
          result.suplier = data.suplier
          result.active = data.active
          yield result.save()

          // Lưu hình ảnh
        if(image){
          const option = yield Option.query().where("code","PATH_UPLOAD_IMAGE").first()

          const fileName = `${new Date().getTime()}.${image.extension()}`
          const path_upload = option.value + result.id +'/'+ fileName
          yield image.move(Helpers.publicPath(option.value + result.id+'/'), fileName)

          if (!image.moved()) {
            response.badRequest(image.errors())
            return
          }

          // delete old avatar
          if(result.image){
             fs.unlink(Helpers.publicPath(result.image), (err) => {});
          }

          result.image = path_upload
          yield result.save()
        }

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
        result.type_transport = data.type_transport
        result.code = data.code
        result.name = data.name
        result.name_en = data.name_en
        result.number_plates = data.number_plates
        result.registry = data.registry
        result.size = data.size
        result.owner = data.owner
        result.weight = data.weight
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
module.exports = TypeTransportController
