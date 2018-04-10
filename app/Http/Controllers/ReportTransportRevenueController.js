'use strict'
const PosGeneral = use('App/Model/PosGeneral')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Transport = use('App/Model/Transport')  // EDIT
const Suplier = use('App/Model/Suplier')  // EDIT

var moment = require('moment')

class ReportTransportRevenueController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-revenue-transport"  // EDIT
      this.room = "report_revenue_transport"  // EDIT
      this.subject_key = "suplier"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_transport_revenue.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const subject = yield Suplier.query().where('active',1).fetch()
      const transport = yield Transport.query().where('active',1).fetch()
      const show = yield response.view('pos/pages/report_transport_revenue', {key : this.key ,title: title, transport : transport.toJSON(), start_date:start_date  , end_date:end_date , subject:subject.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        // Lấy số đầu kỳ
        const arr = yield PosGeneral.query()
        .whereBetween('pos_general.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
        .where('type',3)
        .innerJoin('suplier','suplier.id','pos_general.subject')
        .innerJoin('transport','transport.id','pos_general.transport')
        .TypeWhere('pos_general.subject',data.subject).where('pos_general.subject_key',this.subject_key)
        .TypeWhere('pos_general.transport',data.transport)
        .TypeWhere('pos_general.active',data.active)
        .select('suplier.code as code_suplier','transport.code as transport')
        .groupBy('pos_general.transport')
        .sum('pos_general.total_amount as cost').sum('pos_general.revenue as revenue').sum('pos_general.profit as profit')
        .fetch()
        response.json({ status: true , data : arr.toJSON()})
      }catch(e){
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message })
      }
  }

}
module.exports = ReportTransportRevenueController
