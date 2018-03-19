'use strict'
const Customer = use('App/Model/Customer')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const SalesStaff = use('App/Model/SalesStaff')  // EDIT

var moment = require('moment')

class ReportListCustomerController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-list-customer"  // EDIT
      this.room = "report_list_customer"  // EDIT
      this.subject_key = "suplier"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_list_customer.title')  // EDIT
      const sales = yield SalesStaff.query().where('active',1).fetch()
      const show = yield response.view('pos/pages/report_list_customer', {key : this.key ,title: title, sales:sales.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        // Lấy số đầu kỳ
        const arr = yield Customer.query().TypeWhere('customer.sales_staff',data.sales)
        .select('customer.*')
        .fetch()
        response.json({ status: true , data : arr.toJSON()})
      }catch(e){
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message})
      }
  }

}
module.exports = ReportListCustomerController
