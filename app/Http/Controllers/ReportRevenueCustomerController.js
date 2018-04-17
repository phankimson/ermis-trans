'use strict'
const PosDetail = use('App/Model/PosDetail')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Customer = use('App/Model/Customer')  // EDIT
const SalesStaff = use('App/Model/SalesStaff')  // EDIT

var moment = require('moment')

class ReportRevenueCustomerController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-revenue-customer"  // EDIT
      this.room = "report_revenue-customer"  // EDIT
      this.subject_key = "customer"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_revenue_customer.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const subject = yield Customer.query().where('active',1).fetch()
      const sale_staff = yield SalesStaff.query().where('active',1).fetch()
      const show = yield response.view('pos/pages/report_revenue_customer', {key : this.key ,title: title, sale_staff : sale_staff.toJSON(), start_date:start_date  , end_date:end_date , subject:subject.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        // Lấy số đầu kỳ
        const arr = yield PosDetail.query()
        .innerJoin('pos_general','pos_general.id','pos_detail.general')
        .innerJoin('goods','goods.id','pos_detail.item_id')
        .where('pos_general.type',1)
        .whereBetween('pos_general.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
        .innerJoin('payment','payment.goods','goods.id')
        .innerJoin('customer','customer.id','payment.subject')
        .innerJoin('sales_staff','sales_staff.id','payment.sales_staff')
        .leftJoin('transport','transport.id','pos_general.transport')
        .leftJoin('suplier','suplier.id','transport.suplier')
        .leftJoin('pos_cash','pos_cash.reference_get','pos_detail.general')
        .TypeWhere('pos_general.subject',data.subject).where('pos_general.subject_key',this.subject_key)
        .TypeWhere('payment.sales_staff',data.sale_staff)
        .TypeWhere('goods.active',data.active)
        .select('goods.*','customer.name as company_name','sales_staff.name as sale_staff','transport.code as transport_code','suplier.name as suplier','pos_cash.invoice','pos_cash.total_amount as already_collected')
        .fetch()
        response.json({ status: true , data : arr.toJSON()})
      }catch(e){
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message })
      }
  }

}
module.exports = ReportRevenueCustomerController
