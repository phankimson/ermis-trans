'use strict'
const Goods = use('App/Model/Goods')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const City = use('App/Model/City')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
const PaymentMethod = use('App/Model/PaymentMethod')  // EDIT
const Surcharge = use('App/Model/Surcharge')  // EDIT
const HistoryGoods = use('App/Model/HistoryGoods')  // EDIT
const Customer = use('App/Model/Customer')  // EDIT
const SalesStaff = use('App/Model/SalesStaff')  // EDIT
const Unit = use('App/Model/Unit')  // EDIT
const PosDetail = use('App/Model/PosDetail')  // EDIT
const PosGeneral = use('App/Model/PosGeneral')  // EDIT

var moment = require('moment')

class TaxMoneyController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "tax-money"  // EDIT
      this.room = "tax-money"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('approved_inventory_voucher.title')  // EDIT
      const inventory = yield request.session.get('inventory')
      const page = 1
      const option = yield Option.query().where("code","MAX_ITEM_APPROVED").first()
      const data = yield Goods.query()
      .innerJoin('inventory as in1','in1.id','goods.transport_station_send')
      .leftJoin('inventory as in2','in2.id','goods.transport_station_receive')
      .orderBy('goods.created_at','desc')
      .select('goods.*','in1.name as transport_station_send','in2.name as transport_station_receive')
      .paginate(page,option.value)
      data.toJSON().page = Math.ceil(data.toJSON().total / data.toJSON().perPage)
      const city = yield City.query().where('active',1).fetch()
      const stock = yield Inventory.query().whereNot('id',inventory).where('active',1).fetch()
      const payment_method = yield PaymentMethod.query().where('active',1).fetch()
      const subject = yield Customer.query().where('active',1).fetch()
      const sale_staff = yield SalesStaff.query().where('active',1).fetch()
      const surcharge = yield Surcharge.query().where('active',1).fetch()
      const unit = yield Unit.query().where('type',1).where('active',1).fetch()
      const unit_quantity = yield Unit.query().where('type',2).where('active',1).fetch()
      const show = yield response.view('pos/pages/tax_money', {key : this.key ,title: title , unit : unit.toJSON() , unit_quantity : unit_quantity.toJSON() , data: data.toJSON(),sales_staff : sale_staff.toJSON(),city : city.toJSON(), subject : subject.toJSON() , surcharge : surcharge.toJSON() ,payment_method : payment_method.toJSON(),stock : stock.toJSON() })  // EDIT
      response.send(show)
  }

  * save (request, response){
    const data = JSON.parse(request.input('data'))
    try{
    const goods = yield Goods.find(data.id)
    goods.quantity = data.quantity
    goods.unit_quantity = data.unit_quantity
    goods.surcharge = data.surcharge
    goods.price = data.price
    goods.fee = data.fee
    goods.surcharge_amount = data.surcharge_amount
    goods.money = data.money
    goods.vat = data.vat
    goods.vat_amount = data.vat_amount
    goods.total_amount = data.total
    yield goods.save()

   const detail = yield PosDetail.query().where('id',data.id).first()
   const general = yield PosGeneral.query().where('id',detail.general).first()
   general.traders = data.sender_fullname
   general.subject = data.subject
   general.subject_key = this.subject_key
   general.total_number = data.quantity
   general.total_amount = data.total
    yield general.save()


    response.json({ status: true  , message: Antl.formatMessage('messages.update_success') })
    } catch (e) {
     response.json({ status: false , error : true , message: Antl.formatMessage('messages.update_error') +' '+ e.message })
    }
  }



}
module.exports = TaxMoneyController
