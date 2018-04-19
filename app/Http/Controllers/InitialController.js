'use strict'
const Data = use('App/Model/Initial')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const HistoryAction = use('App/Classes/HistoryAction')
const Menu = use('App/Model/Menu')
const NumberIncreases = use('App/Model/NumberIncreases')
const Stock = use('App/Model/Inventory')  // EDIT
//const GoodsSize = use('App/Model/GoodsSize')  // EDIT
const Suplier = use('App/Model/Suplier')  // EDIT
const Customer = use('App/Model/Customer')  // EDIT
//const GoodsInventory = use('App/Model/GoodsInventory')  // EDIT

class InitialController{
  constructor () {
      this.type = "1"  // EDIT
      this.key = "initial"  // EDIT
      this.menu = "pos_initial"  // EDIT
      this.room = "initial"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('initial.title')  // EDIT
      const inventory = yield request.session.get('inventory')
      const data2 =  yield Customer.query()
      .where('customer.active',1)
      .leftJoin('initial', function () {
          this
            .on('initial.item', 'customer.id')
            .on('initial.type', 3)
        })
        .select("customer.id","customer.code","customer.name","customer.tax_code","customer.address","initial.debt_account","initial.credit_account").fetch()
      const data3 = yield Suplier.query()
      .where('suplier.active',1)
      .leftJoin('initial', function () {
          this
            .on('initial.item', 'suplier.id')
            .on('initial.type', 2)
        })
        .select("suplier.id","suplier.code","suplier.name","suplier.tax_code","suplier.address","initial.debt_account","initial.credit_account").fetch()

      const stock = yield Stock.query().where('active',1).orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/initial', {key : this.key ,title: title , data2: data2,data3: data3, stock : stock.toJSON() })  // EDIT
      response.send(show)
  }
  * cancel (request, response){
    try{
    const data = JSON.parse(request.input('data'))
    var arr = []
    if(data.type == 2){
      arr = yield Suplier.query()
      .where('suplier.active',1)
      .leftJoin('initial', function () {
          this
            .on('initial.item', 'suplier.id')
            .on('initial.type', 2)
        })
        .select("suplier.id","suplier.code","suplier.name","suplier.tax_code","suplier.address","initial.debt_account","initial.credit_account").fetch()
    }else if(data.type == 3){
      arr =  yield Customer.query()
      .where('customer.active',1)
      .leftJoin('initial', function () {
          this
            .on('initial.item', 'customer.id')
            .on('initial.type', 3)
        })
        .select("customer.id","customer.code","customer.name","customer.tax_code","customer.address","initial.debt_account","initial.credit_account").fetch()
    }

    if(arr){
        response.json({ status: true  , data : arr})
    }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data') })
    }
  }catch(e){
    response.json({ status: false ,error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
  }
  }

  * load (request, response){
    try{
    const data = JSON.parse(request.input('data'))
      const arr = yield GoodsSize.query()
      .where('goods_size.active',1)
      .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
      .whereIn('marial_goods.nature',[1,2])
      .innerJoin('unit', 'unit.id', 'marial_goods.unit')
      .innerJoin('size', 'size.id', 'goods_size.size')
      .leftJoin('initial', function () {
          this
            .on('initial.item', 'goods_size.id')
            .on('initial.type', 1)
            .on('initial.inventory', eval(data))
        })
      .select("goods_size.id","marial_goods.nature","goods_size.barcode as barcode","marial_goods.name as name","unit.name as unit","size.name as size","initial.quantity","initial.amount").fetch()
    if(arr){
        response.json({ status: true  , data : arr})
    }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data')  })
    }
  }catch(e){
    response.json({ status: false ,error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
  }
  }

  * save (request, response){
    try {
    const data = JSON.parse(request.input('data'))
    const permission = JSON.parse(yield request.session.get('permission'))
    if(permission.a || permission.e){
    if(data){
      if(data.type == 2){
          for(let d of data.suplier){
                var result = []
            if(d.debt_account != null || d.credit_account != null){
              result =yield Data.query().where('type',2).where('item',d.id).first()
              if(result){
                result.debt_account = d.debt_account?d.debt_account:0
                result.credit_account = d.credit_account?d.credit_account:0
              }else{
                result = new Data()
                result.type = 2
                result.item = d.id
                result.debt_account = d.debt_account?d.debt_account:0
                result.credit_account = d.credit_account?d.credit_account:0
              }
              yield result.save()
            }
          }
      }else if(data.type == 3){
          for(let d of data.customer){
                var result = []
            if(d.debt_account != null || d.credit_account != null){
               result =yield Data.query().where('type',3).where('item',d.id).first()
              if(result){
                result.debt_account = d.debt_account?d.debt_account:0
                result.credit_account = d.credit_account?d.credit_account:0
              }else{
                result = new Data()
                result.type = 3
                result.item = d.id
                result.debt_account = d.debt_account?d.debt_account:0
                result.credit_account = d.credit_account?d.credit_account:0
              }
              yield result.save()
            }
          }
      }
          // Lưu lịch sử
          const menu = yield Menu.query().where('code',this.menu).first()
          let hs = new HistoryAction()
          var rs = hs.insertRecord(6,request.currentUser.id,menu.id,JSON.stringify(result))
          yield rs.save()
          //
       response.json({ status: true , message: Antl.formatMessage('messages.update_success')})
    }else{
      response.json({ status: false , message: Antl.formatMessage('messages.no_data') })
      }
    }else{
       response.json({ status: false , message: Antl.formatMessage('messages.you_not_permission') })
     }
    } catch (e) {
    response.json({ status: false , message: Antl.formatMessage('messages.update_error')+' '+e.message})
    }
  }


  * downloadExcelSuplier (request, response){
    response.download(Helpers.storagePath("SuplierBalance.xlsx"))
  }
  * downloadExcelCustomer (request, response){
    response.download(Helpers.storagePath("CustomerBalance.xlsx"))
  }



  * importSuplier (request, response){
    try{
    const file = request.file('files', {
      allowedExtensions: ['xls', 'xlsx']
    })

    var XLSX = require('xlsx')
    var workbook = XLSX.readFile(file[1].tmpPath())
    var sheet_name_list = workbook.SheetNames
    const arr = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
    if(arr){
      for(let d of arr){
        var result = new Data()
        if (d.debt_account != null || d.credit_account != null ){
          result.type = 2
          result.item = d.id
          result.debt_account = d.debt_account
          result.credit_account = d.credit_account
          yield result.save()
        }
      }
      // Lưu lịch sử
      const menu = yield Menu.query().where('code',this.menu).first()
      let hs = new HistoryAction()
      var rs = hs.insertRecord(6,request.currentUser.id,menu.id,JSON.stringify(arr))
      yield rs.save()
      //
      const arr_push = yield Suplier.query()
        .where('suplier.active',1)
        .leftJoin('initial', function () {
            this
              .on('initial.item', 'suplier.id')
              .on('initial.type', 2)
          })
          .select("suplier.id","suplier.code","suplier.name","suplier.tax_code","suplier.address","initial.debt_account","initial.credit_account").fetch()

      response.json({ status: true , message: Antl.formatMessage('messages.success_import') , data : arr_push})
    }else{
      response.json({ status: false , message: Antl.formatMessage('messages.failed_import')})
    }

    yield file[1].delete()
  }catch(e){
    response.json({ status: false ,error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
  }
  }

  * importCustomer (request, response){
    try{
    const file = request.file('files', {
      allowedExtensions: ['xls', 'xlsx']
    })

    var XLSX = require('xlsx')
    var workbook = XLSX.readFile(file[1].tmpPath())
    var sheet_name_list = workbook.SheetNames
    const arr = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
    if(arr){
      for(let d of arr){
        var result = new Data()
        if (d.debt_account != null || d.credit_account != null ){
          result.type = 3
          result.item = d.id
          result.debt_account = d.debt_account
          result.credit_account = d.credit_account
          yield result.save()
        }
      }
      // Lưu lịch sử
      const menu = yield Menu.query().where('code',this.menu).first()
      let hs = new HistoryAction()
      var rs = hs.insertRecord(6,request.currentUser.id,menu.id,JSON.stringify(arr))
      yield rs.save()
      //
      const arr_push = yield Customer.query()
      .where('customer.active',1)
      .leftJoin('initial', function () {
          this
            .on('initial.item', 'customer.id')
            .on('initial.type', 3)
        })
        .select("customer.id","customer.code","customer.name","customer.tax_code","customer.address","initial.debt_account","initial.credit_account").fetch()

      response.json({ status: true , message: Antl.formatMessage('messages.success_import') , data : arr_push})
    }else{
      response.json({ status: false , message: Antl.formatMessage('messages.failed_import')})
    }

    yield file[1].delete()
  }catch(e){
    response.json({ status: false ,error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
  }
  }
}
module.exports = InitialController
