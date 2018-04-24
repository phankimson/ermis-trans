'use strict'
const Payment = use('App/Model/Payment')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Customer = use('App/Model/Customer')  // EDIT
const Data = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosCash')  // EDIT
const Initial = use('App/Model/Initial')  // EDIT
const Goods = use('App/Model/Goods')  // EDIT

const Docso = use('App/Classes/docso')

var moment = require('moment')
var fs = require('fs')
var XlsxTemplate = require('xlsx-template')

class ReportDetailDebtController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-detail-debt"  // EDIT
      this.room = "report-debt"  // EDIT
      this.subject_key = "customer"  // EDIT
      this.download = "Template2.xlsx"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_detail_debt.title')  // EDIT
      const end_date = moment().format('DD/MM/YYYY')
      const subject = yield Customer.query().where('active',1).fetch()
      const show = yield response.view('pos/pages/report_detail_debt', {key : this.key ,title: title , end_date:end_date , subject:subject.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        // Số đầu kỳ
       const opening_balance = yield Initial.query().where('item',data.subject).where('type',3).sum('debt_account as q').sum('credit_account as a')
        // Lấy số đầu kỳ
        const opening_debt = yield Data.query()
       .where('subject',data.subject).where('subject_key',this.subject_key).where('active',data.active).where('type',1)
       .where('date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
       .sum('total_amount as q')

       const opening_credit = yield Data.query()
      .where('subject',data.subject).where('subject_key',this.subject_key).where('active',data.active).where('type',7)
      .where('date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
      .sum('total_amount as q')

      // chi tiết
      const detail = yield Data.query()
     .where('subject',data.subject).where('subject_key',this.subject_key)
     .where('active',data.active).whereIn('type',[1,7])
     .whereBetween('date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
     .orderBy('date_voucher')
     .fetch()

     var arr = []
     var debt =0
     var credit = 0

     arr.push({
       description : Antl.formatMessage('report_inventory.opening_balance'),
       date_voucher : null,
       debt : 0,
       credit : 0,
       closing : opening_balance[0].q+opening_debt[0].q - opening_credit[0].q-opening_balance[0].a
     })

     for(var d of detail.toJSON()){
       var a = (d.type == 1)? d.total_amount : 0
       var b = (d.type == 7)? d.total_amount : 0
       // Số đầu kỳ
         arr.push({
           id : d.id,
           date_voucher : d.date_voucher,
           voucher : d.voucher,
           description : d.description,
           debt : a ,
           credit : b ,
           closing : 0
         })
       //
       debt += a
       credit += b
     }

     arr.push({
       description : Antl.formatMessage('report_inventory.closing_balance'),
       date_voucher : null,
       debt : 0,
       credit : 0,
       closing : opening_balance[0].q+opening_debt[0].q - opening_credit[0].q + debt - credit-opening_balance[0].a
     })

        response.json({ status: true , data : arr})
      }catch(e){
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message})
      }
  }

  * excel (request, response) {
    try {
     const result = JSON.parse(request.input('data'))
     const detail = yield Goods.query()
     .whereBetween('goods.date_voucher',[moment(result.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(result.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
     .innerJoin('pos_detail','pos_detail.item_id','goods.id')
     .innerJoin('pos_general','pos_general.id','pos_detail.general')
     .leftJoin('unit','unit.id','goods.unit_quantity')
     .leftJoin('transport','transport.id','pos_general.transport')
     .leftJoin('surcharge','surcharge.id','goods.surcharge')
     .leftJoin('pos_cash','pos_cash.reference_get','pos_detail.general')
     .TypeWhere('pos_general.subject',result.subject)
     .where('pos_general.subject_key',this.subject_key)
     .TypeWhere('goods.active',result.active)
     .select('goods.*','pos_general.description','transport.code as transport_code','surcharge.name as surcharge','unit.name as unit','pos_cash.total_amount as paid')
     .fetch()

     const receipt = yield Data.query()
     .whereBetween('date_voucher',[moment(result.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(result.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
     .TypeWhere('subject',result.subject)
     .where('subject_key',this.subject_key)
     .TypeWhere('active',result.active)
     .where('reference','')
     .where('type',7)
     .fetch()

     const customer = yield Customer.query().where('customer.id',result.subject)
     .leftJoin('payment_method','payment_method.id','customer.payment_method')
     .leftJoin('sales_staff','sales_staff.id','customer.sales_staff')
     .select('customer.*','payment_method.name as payment_method','sales_staff.name as sales_staff')
     .first()

     let hs = new Docso()
     // Load an XLSX file into memory
     fs.readFile(Helpers.storagePath(this.download), function(err, data) {

         // Create a template
         var template = new XlsxTemplate(data);
         // Replacements take place on first sheet
         var sheetNumber = 1;

         // Set up some placeholder values matching the placeholders in the template
         var values = {}
         var arr = []
         var i = 1
         var total_remaining = 0
         var total_vat = 0
         var rest_payable = 0
         var remaining = 0
        for(let w of detail.toJSON()){
              var a = {}
               a.stt = i
               a.date_voucher = moment(w.date_voucher,'YYYY-MM-DD').format('DD/MM/YYYY')
               a.code = w.code
               a.description = w.description
               a.transport_code = w.transport_code
               a.quantity = w.quantity
               a.unit = w.unit
               a.fee = w.fee
               a.vat_amount = w.vat_amount
               a.surcharge_amount = w.surcharge_amount
               a.total_amount = w.total_amount
               a.paid = w.paid ? w.paid : 0
               remaining += a.total_amount - a.paid
               a.remaining = remaining

          total_vat += w.vat_amount
          arr.push(a)
          i++
        }

        for(let w of receipt.toJSON()){
              var a = {}
               a.stt = i
               a.date_voucher = moment(w.date_voucher,'YYYY-MM-DD').format('DD/MM/YYYY')
               a.description = w.description
               a.code = ""
               a.transport_code = ""
               a.quantity = ""
               a.unit = ""
               a.fee = ""
               a.vat_amount = ""
               a.surcharge_amount = ""
               a.total_amount = ""
               a.paid = w.total_amount
               remaining += a.total_amount - a.paid
               a.remaining = remaining
               
          arr.push(a)
          i++
        }
          total_remaining = remaining
          rest_payable = total_remaining

        if( i == 2 ){
          var a = {}
           a.stt = ""
           a.date_voucher = ""
           a.description = ""
           a.code = ""
           a.name = ""
           a.lot_number = ""
           a.sender_address = ""
           a.receiver_address = ""
           a.quantity = ""
           a.unit = ""
           a.price = ""
           a.fee = ""
           a.vat_amount = ""
           a.surcharge_amount = ""
           a.total_amount = ""
           arr.push(a)
        }

         if(customer){
           values = {
                  start_date : moment(result.start_date,'YYYY-MM-DD').format('DD/MM/YYYY'),
                  end_date : moment(result.end_date,'YYYY-MM-DD').format('DD/MM/YYYY'),
                  sales_staff : customer.sales_staff,
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
                   total_remaining : total_remaining - total_vat,
                  total_vat : total_vat,
                  rest_payable : total_remaining,
                  rest_payable_letter : hs.docso.doc(rest_payable) +" đồng",
               };

         }else{

           values = {
                   start_date : result.start_date,
                   end_date : result.end_date,
                   sales_staff : "",
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
                   total_remaining : total_remaining - total_vat,
                  total_vat : total_vat,
                  rest_payable : total_remaining,
                  rest_payable_letter : hs.docso.doc(rest_payable) +" đồng",
               };

         }

         // Perform substitution
         template.substitute(sheetNumber, values);

         // Get binary data
       var output = template.generate();
       var filePath = Helpers.storagePath('Temp/Template2.xlsx')

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
module.exports = ReportDetailDebtController
