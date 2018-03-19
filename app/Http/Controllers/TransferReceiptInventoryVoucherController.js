'use strict'
const Antl = use('Antl')
const Helpers = use('Helpers')
const Menu = use('App/Model/Menu')
const Inventory = use('App/Model/Inventory')  // EDIT
const Goods = use('App/Model/Goods')  // EDIT
const Company = use('App/Model/Company')  // EDIT
const Option = use('App/Model/Option')  // EDIT
const Closing = use('App/Model/Closing')  // EDIT
const PrintTemplate = use('App/Model/PrintTemplate')  // EDIT
const General = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const HistoryAction = use('App/Classes/HistoryAction')  // EDIT
const HistoryGoods = use('App/Classes/HistoryGoods')  // EDIT
const Database = use('Database')
var moment = require('moment')

class TransferReceiptInventoryVoucherController{
  constructor () {
      this.type = 3  // EDIT Receipt = 1 , Issue = 2 , Transfer = 3
      this.key = "transfer-receipt-inventory-voucher"  // EDIT
      this.menu = "pos_transfer_receipt_inventory_voucher"
      this.voucher = 'INVENTORY_TRANSFER_ISSUE_%'
      this.print = 'PCK%'
    }

    * show (request, response){
        const title = Antl.formatMessage('transfer_receipt_inventory_voucher.title')  // EDIT
        const print = yield PrintTemplate.query().where('code', 'LIKE', this.print).fetch()
        const show = yield response.view('pos/pages/transfer_receipt_inventory_voucher', {key : this.key ,title: title ,  print : print.toJSON() })  // EDIT
        response.send(show)
    }

    * scan (request, response){
      const data = JSON.parse(request.input('data'))
      var arr = null
      try{
        if(data.id){
          arr = yield Detail.query()
          .where('general',data.id)
          .where('code',data.value)
          .first()
        }
        //if(arr == null){
        //  arr = yield Goods.query().where('code',data.value)
      //    .where("inventory",inventory)
      //    .where("transport_station_receive",data.inventory_receipt)
        //  .select("id as item_id","goods.*").first()
      //  }
        if(arr){
            response.json({ status: true  , data : arr })
        }else{
            response.json({ status: false , message: Antl.formatMessage('messages.barcode_not_found')  })
        }
      } catch (e) {
        response.json({ status: false , error : true,  message: Antl.formatMessage('messages.error') + ' '+e.message })
      }
    }

    * save (request, response){
       try {
            const data = JSON.parse(request.input('data'))
            const inventory = yield request.session.get('inventory')
            if(data){
              const closing = yield Closing.query().where('date',moment(data.date_voucher,"YYYY-MM-DD").format("MM/YYYY")).count('* as total')
              if(closing[0].total == 0){
                  const general = yield General.find(data.id)
                  var action = 4
                  general.traders = data.traders
                  general.status = data.status
                  yield general.save()
                  for(var d of data.detail){
                    var detail = yield Detail.find(d.detail)
                    const goods = yield Goods.find(detail.item_id)
                    goods.inventory = inventory
                    goods.status = 3
                    yield goods.save()
                    // Lưu lịch sử hàng gửi
                    let hg = new HistoryGoods()
                    var rg = hg.insertRecord(goods.id,inventory,3)
                    yield rg.save()
                    //
                    detail.quantity_receipt = d.quantity_receipt
                    detail.status = d.status
                    yield detail.save()
                  }

                  // Lưu lịch sử
                  const menu = yield Menu.query().where('code',this.menu).first()
                  let hs = new HistoryAction()
                  var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(general)+'@'+JSON.stringify(detail))
                  yield rs.save()
                  //
                  response.json({ status: true  , message: Antl.formatMessage('messages.update_success') })
              }else{
               response.json({ status: false , message: Antl.formatMessage('messages.locked_period') })
              }
            }else{
            response.json({ status: false  , message: Antl.formatMessage('messages.update_fail')})
            }
        } catch (e) {
        response.json({ status: false , message: Antl.formatMessage('messages.update_error')})
        }
    }
    * bind (request, response){
      try {
      const data = JSON.parse(request.input('data'))
        if(data){
          var general = yield General.find(data)
              general = yield General.query()
              .innerJoin('inventory', 'inventory.id', 'pos_general.inventory_issue')
              .innerJoin('driver', 'driver.id', 'pos_general.driver')
              .innerJoin('transport', 'transport.id', 'pos_general.transport')
              .where('pos_general.id',data).select('pos_general.*','inventory.name as inventory_issue','driver.name as driver','transport.number_plates as transport').first()
              var detail = yield Detail.query().where("general",general.id)
                  .innerJoin('goods','goods.id','pos_detail.item_id')
                  .select("pos_detail.*","pos_detail.id as detail","goods.transport_station_receive","goods.date_voucher").orderBy('pos_detail.id', 'desc').fetch()
        response.json({ status: true  , general : general , detail : detail.toJSON() })
        }else{
        response.json({ status: false  , message: Antl.formatMessage('messages.update_fail')})
        }
      } catch (e) {
        response.json({ status: false , message: Antl.formatMessage('messages.update_error')})
      }
    }
}
module.exports = TransferReceiptInventoryVoucherController
