'use strict'
const Goods = use('App/Model/Goods')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Customer = use('App/Model/Customer')  // EDIT

var moment = require('moment')
const fs = require('fs')
var XlsxTemplate = require('xlsx-template')

class ReportListFreightController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-list-freight"  // EDIT
      this.room = "report_list_freight"  // EDIT
      this.subject_key = "customer"  // EDIT
      this.download = "Template1.xlsx"  // EDIT
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

  * prints (request, response) {
    try {
     const data = JSON.parse(request.input('data'))
     const detail = yield Goods.query()
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
     const customer = yield Customer.query().where('customer.id',data.subject)
     .innerJoin('payment_method','payment_method.id','customer.payment_method')
     .select('customer.*','payment_method.name as payment_method')
     .first()
      response.json({ status: true , detail : detail.toJSON() , customer : customer})
    }catch(e){
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message })
    }
  }

  * excel (request, response) {
    try {
     const data = JSON.parse(request.input('data'))
     const detail = yield Goods.query()
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
     const customer = yield Customer.query().where('customer.id',data.subject)
     .innerJoin('payment_method','payment_method.id','customer.payment_method')
     .select('customer.*','payment_method.name as payment_method')
     .first()
     fs.createReadStream(Helpers.storagePath(this.download)).pipe(fs.createWriteStream(Helpers.storagePath('template/'+this.download)));

     // Load an XLSX file into memory
     fs.readFile(Helpers.storagePath('template/'+this.download), function(err, data) {

         // Create a template
         var template = new XlsxTemplate(data);
         // Replacements take place on first sheet
         var sheetNumber = 1;

         // Set up some placeholder values matching the placeholders in the template
         var values = {
                 extractDate: new Date(),
                 dates: [ new Date("2013-06-01"), new Date("2013-06-02"), new Date("2013-06-03") ],
                 people: [
                     {name: "John Smith", age: 20},
                     {name: "Bob Johnson", age: 22}
                 ]
             };

         // Perform substitution
         template.substitute(sheetNumber, values);


         // ...

     })

      response.json({ status: true })
    }catch(e){
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message })
    }
  }

  * downloadExcel (request, response){
    response.download(Helpers.storagePath('template/'+this.download))
  }

}
module.exports = ReportListFreightController
