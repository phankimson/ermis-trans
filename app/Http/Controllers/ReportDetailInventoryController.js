'use strict'
const Data = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Goods = use('App/Model/Goods')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
var moment = require('moment')

class ReportDetailInventoryController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-detail-inventory"  // EDIT
      this.room = "report-inventory"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_detail_inventory.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const stock = yield Inventory.query().where('active',1).orderBy('id', 'desc').fetch()
      const item = yield Goods.query().where('active',1)
      .select('id','code','name as name')
      .fetch()
      const show = yield response.view('pos/pages/report_detail_inventory', {key : this.key ,room : this.room ,title: title , end_date:end_date , start_date :start_date , item : item.toJSON() , stock : stock.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        if(data.item){
          // Lấy số đầu kỳ
          const opening_receipt = yield Detail.query().where('pos_detail.item_id',data.item)
         .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general')
         .TypeWhereNot('pos_general.inventory_receipt',data.inventory).where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
         .where('pos_general.date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
         .sum('pos_detail.quantity as q')
          const opening_issue = yield Detail.query().where('pos_detail.item_id',data.item)
         .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general')
         .TypeWhereNot('pos_general.inventory_issue',data.inventory).where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
         .where('pos_general.date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
         .sum('pos_detail.quantity as q')

          const detail = yield Detail.query()
          .where('pos_detail.item_id',data.item)
         .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general')
         .where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
         .whereBetween('pos_general.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
         .OrTypeWhereMuti('pos_general.inventory_issue','pos_general.inventory_receipt',data.inventory,data.inventory)
         .fetch()
          var arr = []
          var quantity_receipt =0
          var quantity_issue = 0
              arr.push({
                description : Antl.formatMessage('report_inventory.opening_balance'),
                date_voucher : null,
                quantity_receipt : 0,
                quantity_issue : 0,
                quantity_balance : opening_receipt[0].q - opening_issue[0].q
              })
              for(var d of detail.toJSON()){
                var a = (d.inventory_receipt == data.inventory)? d.quantity : 0
                var b = (d.inventory_issue == data.inventory)? d.quantity : 0
                // Số đầu kỳ
                  arr.push({
                    id : d.id,
                    date_voucher : d.date_voucher,
                    voucher : d.voucher,
                    description : d.description,
                    quantity_receipt : a ,
                    quantity_issue : b ,
                    quantity_balance : 0,
                  })
                //
                quantity_receipt += a
                quantity_issue += b
              }

              arr.push({
                date_voucher : null,
                description : Antl.formatMessage('report_inventory.closing_balance'),
                quantity_receipt : 0,
                quantity_issue : 0,
                quantity_balance : opening_receipt[0].q - opening_issue[0].q+quantity_receipt-quantity_issue,
              })
              response.json({ status: true  , data : arr})
        }else{
              response.json({ status: false  , message: Antl.formatMessage('messages.please_choose_item')})
        }
      }catch(e){
          response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message})
      }
  }
}
module.exports = ReportDetailInventoryController
