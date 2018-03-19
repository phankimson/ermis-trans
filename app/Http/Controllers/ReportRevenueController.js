'use strict'
const Goods = use('App/Model/Goods')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Customer = use('App/Model/Customer')  // EDIT
const SalesStaff = use('App/Model/SalesStaff')  // EDIT

var moment = require('moment')

class ReportRevenueController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-revenue-sale"  // EDIT
      this.room = "report_revenue-sale"  // EDIT
      this.subject_key = "customer"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_revenue.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const subject = yield Customer.query().where('active',1).fetch()
      const sale_staff = yield SalesStaff.query().where('active',1).fetch()
      const show = yield response.view('pos/pages/report_revenue', {key : this.key ,title: title, sale_staff : sale_staff.toJSON(), start_date:start_date  , end_date:end_date , subject:subject.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        // Lấy số đầu kỳ
        const arr = yield Goods.query()
        .whereBetween('goods.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
        .innerJoin('payment','payment.goods','goods.id')
        .innerJoin('customer','customer.id','payment.subject')
        .innerJoin('sales_staff','sales_staff.id','payment.sales_staff')
        .TypeWhere('payment.subject',data.subject).where('payment.subject_key',this.subject_key)
        .TypeWhere('payment.sales_staff',data.sale_staff)
        .TypeWhere('goods.active',data.active)
        .select('customer.code as code_customer','sales_staff.name as sale_staff')
        .groupBy('payment.subject')
        .sum('goods.total_amount as revenue')
        .fetch()
        response.json({ status: true , data : arr.toJSON()})
      }catch(e){
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message })
      }
  }

}
module.exports = ReportRevenueController
