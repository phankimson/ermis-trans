'use strict'
const Goods = use('App/Model/Goods')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Customer = use('App/Model/Customer')  // EDIT
const Docso = use('App/Classes/docso')

var moment = require('moment')
var fs = require('fs')
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
        .innerJoin('pos_detail','pos_detail.item_id','goods.id')
        .innerJoin('pos_general','pos_general.id','pos_detail.general')
        .leftJoin('transport','transport.id','pos_general.transport')
        .leftJoin('surcharge','surcharge.id','goods.surcharge')
        .TypeWhere('pos_general.subject',data.subject)
        .where('pos_general.subject_key',this.subject_key)
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
     .innerJoin('pos_detail','pos_detail.item_id','goods.id')
     .innerJoin('pos_general','pos_general.id','pos_detail.general')
     .leftJoin('transport','transport.id','pos_general.transport')
     .leftJoin('surcharge','surcharge.id','goods.surcharge')
     .TypeWhere('pos_general.subject',data.subject)
     .where('pos_general.subject_key',this.subject_key)
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
     .innerJoin('pos_detail','pos_detail.item_id','goods.id')
     .innerJoin('pos_general','pos_general.id','pos_detail.general')
     .leftJoin('unit','unit.id','goods.unit_quantity')
     .leftJoin('transport','transport.id','pos_general.transport')
     .leftJoin('surcharge','surcharge.id','goods.surcharge')
     .TypeWhere('pos_general.subject',data.subject)
     .where('pos_general.subject_key',this.subject_key)
     .TypeWhere('goods.active',data.active)
     .select('goods.*','transport.code as transport_code','surcharge.name as surcharge','unit.name as unit')
     .fetch()

     const customer = yield Customer.query().where('customer.id',data.subject)
     .leftJoin('payment_method','payment_method.id','customer.payment_method')
     .select('customer.*','payment_method.name as payment_method')
     .first()

     var arr = []
     var i = 1
    var total_surchange_amount_ = 0
     for(let w of detail.toJSON()){
           var a = {}
            a.stt = i
            a.date_voucher = moment(w.date_voucher,'YYYY-MM-DD').format('DD/MM/YYYY')
            a.code = w.code
            a.name = w.name
            a.lot_number = w.lot_number
            a.sender_address = w.sender_address
            a.receiver_address = w.receiver_address
            a.quantity = w.quantity
            a.unit = w.unit
            a.price = w.price
            a.fee = w.fee
            a.surcharge_amount = w.surcharge_amount
            a.vat_amount = w.vat_amount
            a.total_amount = w.total_amount
            total_surchange_amount_ += a.surcharge_amount
       arr.push(a)
       i++
     }
     if( i == 2 ){
       var a = {}
        a.stt = ""
        a.date_voucher = ""
        a.code = ""
        a.name = ""
        a.lot_number = ""
        a.sender_address = ""
        a.receiver_address = ""
        a.quantity = ""
        a.unit = ""
        a.price = ""
        a.fee = ""
        a.surcharge_amount = ""
        a.vat_amount = ""
        a.total_amount = ""
        arr.push(a)
     }

     let hs = new Docso()
     // Load an XLSX file into memory
     fs.readFile(Helpers.storagePath(this.download), function(err, data) {

         // Create a template
         var template = new XlsxTemplate(data);
         // Replacements take place on first sheet
         var sheetNumber = 1;

         // Set up some placeholder values matching the placeholders in the template
         var values = {}
         var total_quantity_ = detail.toJSON().reduce((p, c) => p + c.quantity, 0)
         var total_fee_ =  detail.toJSON().reduce((p, c) => p + c.fee, 0)
         var total_amount_ = detail.toJSON().reduce((p, c) => p + c.total_amount, 0)
         var vat = detail.toJSON().reduce((p, c) => p + c.vat_amount, 0)


         if(customer){
           values = {
                   customer_code : customer.code,
                   customer_name : customer.name,
                   customer_address : customer.address,
                   customer_phone : customer.phone,
                   customer_taxcode : customer.tax_code,
                   customer_fax : customer.fax,
                   customer_contact : customer.full_name_contact,
                   customer_contact_phone : customer.telephone1_contact,
                   customer_payment_method : customer.payment_method,
                   detail : arr,
                   total_quantity_ : total_quantity_,
                   total_fee_ : total_fee_,
                   total_surchange_amount_ : total_surchange_amount_,
                   total_amount_ : total_amount_,
                   vat : vat,
                   amount_letter : hs.docso.doc(total_amount_) +" đồng",
               };

         }else{

           values = {
                   customer_code : "",
                   customer_name : "",
                   customer_address : "",
                   customer_phone : "",
                   customer_taxcode : "",
                   customer_fax : "",
                   customer_contact : "",
                   customer_contact_phone : "",
                   customer_payment_method : "",
                   detail : arr,
                   total_quantity_ : total_quantity_,
                   total_fee_ : total_fee_,
                   total_surchange_amount_ : total_surchange_amount_,
                   total_amount_ : total_amount_,
                   vat : vat,
                   amount_letter : hs.docso.doc(total_amount_) +" đồng",
               };

         }

         // Perform substitution
         template.substitute(sheetNumber, values);

         // Get binary data
       var output = template.generate();
       var filePath = Helpers.storagePath('Temp/Template1.xlsx')

        fs.writeFile(filePath, output, 'binary', function(err){
            if(err) console.log(err);
        });

         // ...

     })

      response.json({ status: true })
    }catch(e){
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message })
    }
  }

  * downloadExcel (request, response){
    response.download(Helpers.storagePath('Temp/'+this.download))
  }

}
module.exports = ReportListFreightController
