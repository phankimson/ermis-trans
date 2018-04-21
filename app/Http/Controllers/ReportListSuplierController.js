'use strict'
const Payment = use('App/Model/Payment')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Suplier = use('App/Model/Suplier')  // EDIT
const Data = use('App/Model/PosDetail')  // EDIT

var moment = require('moment')

class ReportListSuplierController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-list-suplier"  // EDIT
      this.room = "report-debt"  // EDIT
      this.subject_key = "suplier"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_list_suplier.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const subject = yield Suplier.query().where('active',1).fetch()
      const show = yield response.view('pos/pages/report_list_suplier', {key : this.key ,title: title ,end_date:end_date , start_date :start_date , subject:subject.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        // Lấy số đầu kỳ
        const arr = yield Data.query()
       .innerJoin('pos_general','pos_general.id','pos_detail.general')
       .innerJoin('goods','goods.id','pos_detail.item_id')
       .innerJoin('unit','unit.id','goods.unit_quantity')
       .innerJoin('transport','transport.id','pos_general.transport')
       .where('pos_general.subject',data.subject).where('pos_general.subject_key',this.subject_key).where('pos_general.active',data.active)
       .TypeWhere('pos_general.transport',data.transport)
       .whereBetween('pos_general.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
       .where('pos_general.type',3)
       .select('goods.code','pos_general.date_voucher','pos_general.date_voucher','transport.code as transport_code','goods.sender_fullname','goods.quantity','unit.name as quantity_unit','goods.invoice','goods.invoice_up_cont','goods.invoice_down_cont','goods.total_amount')
       .fetch()
        response.json({ status: true , data : arr.toJSON()})
      }catch(e){
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message })
      }
  }

}
module.exports = ReportListSuplierController
