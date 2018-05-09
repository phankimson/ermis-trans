'use strict'
const Payment = use('App/Model/Payment')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
const PaymentMethod = use('App/Model/PaymentMethod')  // EDIT
const Shift = use('App/Model/Shift') //EDIT

var moment = require('moment')

class ReportShiftRevenueController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-shift-revenue"  // EDIT
      this.room = "report-revenue"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_shift_revenue.title')  // EDIT
      const end_date = moment().format('DD/MM/YYYY')
      const shift = yield Shift.query().where('active',1).orderBy('id', 'desc').fetch()
      const payment_method = yield PaymentMethod.query().where('active',1).orderBy('id', 'desc').fetch()
      const stock = yield Inventory.query().where('active',1).orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/report_shift_revenue', {key : this.key ,room : this.room ,title: title , end_date:end_date , payment_method:payment_method.toJSON() , shift_list : shift.toJSON() , stock: stock.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        const payment = yield Payment.query()
                        .innerJoin('goods', 'goods.id', 'payment.goods')
                        .TypeWhereNot('payment.inventory',data.inventory)
                        .innerJoin('shift', 'shift.id', 'payment.shift')
                        .innerJoin('payment_method', 'payment_method.id', 'payment.type')
                        .whereNot('payment.type',0)
                        .TypeWhereNot('payment.shift',data.shift)
                        .TypeWhereNot('payment.type',data.payment_method)
                        .whereBetween('goods.date_voucher',[moment(data.start_date ,"YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
                        .select("goods.date_voucher","goods.code as voucher","payment.type","shift.name as shift","goods.note as description","payment_method.name as payment_method","payment.amount as total_amount","payment.payment","payment.refund")
        var arr = []
        for(var g of payment){
          arr.push({date_voucher : g.date_voucher ,
                    voucher : g.voucher ,
                    shift : g.shift,
                    description : Antl.formatMessage('store.sell_daily') + ' - '+ moment(g.date_voucher).format('DD/MM/YYYY') + ' - '+g.voucher ,
                    payment_method : g.payment_method,
                    total_amount :  g.total_amount ,
                    payment :  g.payment ,
                    refund :  g.refund
                  })
        }
        response.json({ status: true , data : arr})
      }catch(e){
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message})
      }
  }

}
module.exports = ReportShiftRevenueController
