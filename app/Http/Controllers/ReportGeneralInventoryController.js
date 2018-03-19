'use strict'
const Data = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Goods = use('App/Model/Goods')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
var moment = require('moment')

class ReportGeneralInventoryController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-general-inventory"  // EDIT
      this.room = "report-inventory"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_general_inventory.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const item = yield Goods.query().where('active',1).orderBy('id', 'desc').fetch()
      const stock = yield Inventory.query().where('active',1).orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/report_general_inventory', {key : this.key ,title: title , end_date:end_date , start_date :start_date  , item : item.toJSON() , stock: stock.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        const good = yield Goods.query()
        .TypeWhere('id',data.item)
        .where('active',1)
        .has('detail')
        .fetch()
        var arr = []
            for(var d of good.toJSON()){
                if(arr.filter(x => x.id === d.id).length == 0){
                   // Số đầu kỳ
                   const opening_receipt = yield Detail.query().where('pos_detail.item_id',d.id)
                  .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general')
                  .TypeWhereNot('pos_general.inventory_receipt',data.inventory).where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
                  .where('pos_general.date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
                  .sum('pos_detail.quantity as q')
                   const opening_issue = yield Detail.query().where('pos_detail.item_id',d.id)
                  .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general')
                  .TypeWhereNot('pos_general.inventory_issue',data.inventory).where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
                  .where('pos_general.date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
                  .sum('pos_detail.quantity as q')
                   // Số phát sinh nhập
                   const receipt_inventory = yield Detail.query().where('pos_detail.item_id',d.id)
                  .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general')
                  .TypeWhereNot('pos_general.inventory_receipt',data.inventory).where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
                  .whereBetween('pos_general.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
                  .sum('pos_detail.quantity as q')
                  // Số phát sinh xuất
                  const issue_inventory = yield Detail.query().where('pos_detail.item_id',d.id)
                 .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general')
                 .TypeWhereNot('pos_general.inventory_issue',data.inventory).where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
                 .whereBetween('pos_general.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
                 .sum('pos_detail.quantity as q')
                 // Số cuối kỳ
                 const closing_balance_quantity = opening_receipt[0].q - opening_issue[0].q + receipt_inventory[0].q - issue_inventory[0].q
                   if((opening_receipt[0].q + opening_issue[0].q + receipt_inventory[0].q + issue_inventory[0].q) > 0 ){
                     arr.push({id : d.id ,
                               barcode : d.code ,
                               item : d.name,
                               quantity_opening : opening_receipt[0].q - opening_issue[0].q,
                               quantity_receipt : receipt_inventory[0].q ,
                               quantity_issue : issue_inventory[0].q ,
                               quantity_closing: closing_balance_quantity
                   })
                 }
                }
              }
        response.json({ status: true  , data : arr})
      }catch(e){
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message})
      }
  }

}
module.exports = ReportGeneralInventoryController
