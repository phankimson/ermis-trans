'use strict'
const Transport = use('App/Model/Transport')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Suplier = use('App/Model/Suplier')  // EDIT

var moment = require('moment')

class ReportListTransportController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-list-transport"  // EDIT
      this.room = "report_list_transport"  // EDIT
      this.subject_key = "suplier"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_list_transport.title')  // EDIT
      const subject = yield Suplier.query().where('active',1).fetch()
      const show = yield response.view('pos/pages/report_list_transport', {key : this.key ,room : this.room,title: title, subject:subject.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        // Lấy số đầu kỳ
        const arr = yield Transport.query().TypeWhere('transport.suplier',data.subject)
        .innerJoin('type_transport','type_transport.id','transport.type_transport')
        .select('transport.*','type_transport.name as type_transport')
        .fetch()
        response.json({ status: true , data : arr.toJSON()})
      }catch(e){
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message })
      }
  }

}
module.exports = ReportListTransportController
