'use strict'
const Data = use('App/Model/AttachFile')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const HistoryAction = use('App/Classes/HistoryAction')
const Menu = use('App/Model/Menu')
const Customer = use('App/Model/Customer')
const Option = use('App/Model/Option')
const NumberIncreases = use('App/Model/NumberIncreases')

const fs = require('fs')

class AttachFileController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "attach-file"  // EDIT
      this.menu = "trans_attach_file"  // EDIT
      this.download = "AttachFile.xlsx"  // EDIT
      this.room = "attach_file"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('attach_file.title')  // EDIT
      const data = yield Data.query().orderBy('id', 'desc').fetch()
      const subject = yield Customer.query().orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/attach_file', {key : this.key,subject : subject.toJSON() ,title: title , data: data.toJSON()})  // EDIT
      response.send(show)
  }

  * save (request, response){
    try {
    const data = JSON.parse(request.input('data'))
    const image = request.file('image', {
      maxSize: '2mb',
      allowedExtensions: ['jpg', 'png', 'jpeg','pdf','doc','docx']
    })
    const permission = JSON.parse(yield request.session.get('permission'))
    if(data){
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
          result.subject = data.subject
          result.subject_key = data.subject_key
          yield result.save()

            var path_upload = ''
          if(image){
              const option = yield Option.query().where("code","PATH_UPLOAD_FILES").first()
              const fileName = `${new Date().getTime()}.${image.extension()}`
              path_upload = option.value + result.id +'/'+ fileName
              yield image.move(Helpers.publicPath(option.value + result.id+'/'), fileName)
              if (!image.moved()) {
                response.badRequest(image.errors())
                return
              }

               //delete old avatar
              if(result.file){
                 fs.unlink(Helpers.publicPath(result.file), (err) => {});
                }
                result.name = image.clientName()
                result.file = path_upload
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
        if(arr.file){
           fs.unlink(Helpers.publicPath(arr.file), (err) => {});
          }
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
module.exports = AttachFileController
