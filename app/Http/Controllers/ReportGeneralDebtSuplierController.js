'use strict'
const Data = use('App/Model/PosGeneral')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Suplier = use('App/Model/Suplier')  // EDIT
const Initial = use('App/Model/Initial')  // EDIT

var moment = require('moment')

class ReportGeneralDebtSuplierController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-general-debt-suplier"  // EDIT
      this.room = "report-debt"  // EDIT
      this.subject_key = "suplier"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_general_debt_suplier.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const subject = yield Suplier.query().where('active',1).fetch()
      const show = yield response.view('pos/pages/report_general_debt_suplier', {key : this.key ,room : this.room ,title: title , end_date:end_date , start_date :start_date  , subject : subject.toJSON() })  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        const subject = yield Suplier.query()
        .TypeWhere('id',data.subject)
        .where('active',1)
        .has('detail')
        .fetch()
        var arr = []
            for(var d of subject.toJSON()){
                if(arr.filter(x => x.id === d.id).length == 0){
                  const opening_balance = yield Initial.query().where('item',d.id).where('type',2).sum('debt_account as q').sum('credit_account as a')
                   // Số đầu kỳ
                   const opening_receipt = yield Data.query()
                  .where('subject',d.id).where('subject_key',this.subject_key).where('active',data.active).where('type',3)
                  .where('date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
                  .sum('total_amount as q')
                  const opening_issue = yield Data.query()
                 .where('subject',d.id).where('subject_key',this.subject_key).where('active',data.active).where('type',8)
                 .where('date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
                 .sum('total_amount as q')
                   // Số phát sinh nhập
                   const receipt_inventory = yield Data.query().where('subject',d.id)
                  .where('subject',d.id).where('subject_key',this.subject_key).where('active',data.active).where('type',3)
                  .whereBetween('date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
                  .sum('total_amount as q')
                  // Số phát sinh xuất
                  const issue_inventory = yield Data.query()
                  .where('subject',d.id).where('subject_key',this.subject_key).where('active',data.active).where('type',8)
                 .whereBetween('date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
                 .sum('total_amount as q')
                 // Số cuối kỳ
                 const closing_balance_quantity = opening_balance[0].q + opening_receipt[0].q - opening_issue[0].q + receipt_inventory[0].q - issue_inventory[0].q - opening_balance[0].a
                   if((opening_receipt[0].q + opening_issue[0].q + receipt_inventory[0].q + issue_inventory[0].q) > 0 ){
                     arr.push({id : d.id ,
                               code : d.code ,
                               name : d.name,
                               amount_opening : opening_balance[0].q + opening_receipt[0].q - opening_issue[0].q - opening_balance[0].a,
                               amount_receipt : receipt_inventory[0].q ,
                               amount_issue : issue_inventory[0].q ,
                               amount_closing: closing_balance_quantity
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
module.exports = ReportGeneralDebtSuplierController
