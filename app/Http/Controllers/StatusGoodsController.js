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

class StatusGoodsController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "status-goods"  // EDIT
      this.room = "status-goods"  // EDIT
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
      const show = yield response.view('pos/pages/status_goods', {key : this.key ,title: title , unit : unit.toJSON() , unit_quantity : unit_quantity.toJSON() , data: data.toJSON(),sales_staff : sale_staff.toJSON(),city : city.toJSON(), subject : subject.toJSON() , surcharge : surcharge.toJSON() ,payment_method : payment_method.toJSON(),stock : stock.toJSON() })  // EDIT
      response.send(show)
  }


  * page (request, response){
    try{
      const page = JSON.parse(request.input('data'))
      const option = yield Option.query().where("code","MAX_ITEM_APPROVED").first()
      const data = yield Goods.query()
      .innerJoin('inventory as in1','in1.id','goods.transport_station_send')
      .leftJoin('inventory as in2','in2.id','goods.transport_station_receive')
      .orderBy('goods.created_at','desc')
      .select('goods.*','in1.name as transport_station_send','in2.name as transport_station_receive')
      .paginate(page,option.value)
      if(data.toJSON().data.length > 0){
        response.json({ status: true , data : data.toJSON().data})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
      }
    }catch(e){
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message})
    }

  }
  * filter (request, response){
    try{
      const data = JSON.parse(request.input('data'))
      if(data.field_search == 'date_voucher'){
        data.value_search = moment(data.value_search , "DD/MM/YYYY").format('YYYY-MM-DD')
      }
      if(data.value_search != ''){
        const arr = yield Goods.query()
        .innerJoin('inventory as in1','in1.id','goods.transport_station_send')
        .leftJoin('inventory as in2','in2.id','goods.transport_station_receive')
        .where('goods.'+data.field_search,"LIKE",'%'+data.value_search+'%')
        .TypeWhere('goods.active',data.active_search)
        .TypeWhereIn('goods.status',eval(data.status_search))
        .orderBy('goods.created_at','desc')
        .select('goods.*','in1.name as transport_station_send','in2.name as transport_station_receive')
        .fetch()
        if(arr.toJSON().length > 0){
          response.json({ status: true , data : arr.toJSON()})
        }else{
          response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
        }
      }else{
        const page = 1
        const option = yield Option.query().where("code","MAX_ITEM_APPROVED").first()
        const arr = yield Goods.query()
        .innerJoin('inventory as in1','in1.id','goods.transport_station_send')
        .leftJoin('inventory as in2','in2.id','goods.transport_station_receive')
        .orderBy('goods.created_at','desc')
        .select('goods.*','in1.name as transport_station_send','in2.name as transport_station_receive')
        .paginate(page,option.value)
        if(arr.toJSON().data.length > 0){
          response.json({ status: true , page : true , data : arr.toJSON().data})
        }else{
          response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
        }
      }

    }catch(e){
              response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message})
    }
  }
  * save (request, response){
    const data = JSON.parse(request.input('data'))
    try{
      var status = 0
      var inventory = 0
      const goods = yield Goods.find(data.id)
    if(data.step0 == 'on' || data.step0 == 1 ){
      status = 0
      inventory = 0
      const hs = new HistoryGoods()
      hs.goods = data.id
      hs.inventory = inventory
      hs.status = status
      yield hs.save()
    }
    if(data.step1 == 1  || data.step1 == 'on'){
      status = 1
      inventory = goods.transport_station_send
      const hs = new HistoryGoods()
      hs.goods = data.id
      hs.inventory = inventory
      hs.status = status
      yield hs.save()
    }
    if(data.step2 == 1 || data.step2 == 'on'){
      status = 2
      inventory = 0
      const hs = new HistoryGoods()
      hs.goods = data.id
      hs.inventory = inventory
      hs.status = status
      yield hs.save()
    }
    if(data.step3 == 1 || data.step3 == 'on'){
      status = 3
      inventory = goods.transport_station_receive
      const hs = new HistoryGoods()
      hs.goods = data.id
      hs.inventory = inventory
      hs.status = status
      yield hs.save()
    }
    if(data.step4 == 1 || data.step4 == 'on'){
      status = 4
      inventory = 0
      const hs = new HistoryGoods()
      hs.goods = data.id
      hs.inventory = inventory
      hs.status = status
      yield hs.save()
    }

    goods.name = data.name
    goods.date_voucher = moment(data.date_voucher, 'DD/MM/YYYY').format('YYYY-MM-DD')
    goods.transport_station_receive = data.transport_station_receive
    goods.quantity = data.quantity
    goods.unit_quantity = data.unit_quantity
    goods.lot_number = data.lot_number
    goods.unit = data.unit
    goods.surcharge = data.surcharge
    goods.price = data.price
    goods.fee = data.fee
    goods.surcharge_amount = data.surcharge_amount
    goods.money = data.money
    goods.vat = data.vat
    goods.vat_amount = data.vat_amount
    goods.total_amount = data.total
    goods.note = data.note
    goods.sender_fullname = data.sender_fullname
    goods.sender_phone = data.sender_phone
    goods.sender_email = data.sender_email
    goods.sender_address = data.sender_address
    goods.sender_city = data.sender_city
    goods.receiver_fullname = data.receiver_fullname
    goods.receiver_phone = data.receiver_phone
    goods.receiver_email = data.receiver_email
    goods.receiver_address = data.receiver_address
    goods.receiver_city = data.receiver_city
    goods.collect = data.collect
    goods.collect_amount = data.collect_amount
    goods.inventory = inventory
    goods.status = status
    yield goods.save()

   const detail = yield PosDetail.query()
   .innerJoin('pos_general','pos_general.id','pos_detail.general')
   .where('pos_general.type',1)
   .where('pos_detail.item_id',data.id).first()

   const general = yield PosGeneral.query().where('id',detail.general).first()
   general.date_voucher = moment(data.date_voucher, 'DD/MM/YYYY').format('YYYY-MM-DD')
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
  * get (request, response){
    try{
      const data = JSON.parse(request.input('data'))
      const hs = yield HistoryGoods.query()
      .where('goods',data)
      .fetch()
      const arr = yield Goods.query()
      .innerJoin('inventory as in1','in1.id','goods.transport_station_send')
      .innerJoin('payment','payment.goods','goods.id')
      .where('goods.id',data)
      .select('goods.*','goods.total_amount as total','payment.subject','payment.sales_staff','in1.name as transport_station_send')
      .first()
      if(arr){
        response.json({ status: true , data : arr.toJSON() , history : hs.toJSON()})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
      }
    }catch(e){
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message})
    }
  }


}
module.exports = StatusGoodsController
