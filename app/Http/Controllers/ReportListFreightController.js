'use strict'
const Goods = use('App/Model/Goods')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Customer = use('App/Model/Customer')  // EDIT

var moment = require('moment')

class ReportListFreightController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-list-freight"  // EDIT
      this.room = "report_list_freight"  // EDIT
      this.subject_key = "customer"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_list_freight.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const subject = yield Customer.query().where('active',1).fetch()
      const show = yield response.view('pos/pages/report_list_freight', {key : this.key ,title: title, start_date:start_date  , end_date:end_date , subject:subject.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        // Lấy số đầu kỳ
        const arr = yield Goods.query()
        .whereBetween('goods.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
        .innerJoin('payment','payment.goods','goods.id')
        .innerJoin('pos_detail','pos_detail.item_id','goods.id')
        .innerJoin('pos_general','pos_general.id','pos_detail.general')
        .leftJoin('transport','transport.id','pos_general.transport')
        .leftJoin('surcharge','surcharge.id','goods.surcharge')
        .TypeWhere('payment.subject',data.subject)
        .where('payment.subject_key',this.subject_key)
        .TypeWhere('goods.active',data.active)
        .select('goods.*','transport.code as transport_code','surcharge.name as surcharge')
        .fetch()
        response.json({ status: true , data : arr.toJSON()})
      }catch(e){
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message })
      }
  }

}
module.exports = ReportListFreightController
