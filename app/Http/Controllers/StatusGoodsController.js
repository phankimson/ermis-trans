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
      .select('goods.*','in1.name as transport_station_send','in2.name as transport_station_receive')
      .paginate(page,option.value)
      data.toJSON().page = Math.ceil(data.toJSON().total / data.toJSON().perPage)
      const city = yield City.query().where('active',1).fetch()
      const stock = yield Inventory.query().whereNot('id',inventory).where('active',1).fetch()
      const payment_method = yield PaymentMethod.query().where('active',1).fetch()
      const surcharge = yield Surcharge.query().where('active',1).fetch()
      const show = yield response.view('pos/pages/status_goods', {key : this.key ,title: title , data: data.toJSON() , surcharge : surcharge.toJSON() ,payment_method : payment_method.toJSON(),stock : stock.toJSON() })  // EDIT
      response.send(show)
  }
  * page (request, response){
    try{
      const page = JSON.parse(request.input('data'))
      const option = yield Option.query().where("code","MAX_ITEM_APPROVED").first()
      const data = yield Goods.query()
      .innerJoin('inventory as in1','in1.id','goods.transport_station_send')
      .leftJoin('inventory as in2','in2.id','goods.transport_station_receive')
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
      const arr = yield Goods.query()
      .innerJoin('inventory as in1','in1.id','goods.transport_station_send')
      .leftJoin('inventory as in2','in2.id','goods.transport_station_receive')
      .OrTypeWhere('goods.code',data.voucher_search)
      .TypeWhere('goods.sender_fullname',data.customer_search)
      .TypeWhere('goods.active',data.active_search)
      .TypeWhereIn('goods.status',eval(data.status_search))
      .OrTypeWhere('goods.date_voucher',data.date_voucher_search)
      .select('goods.*','in1.name as transport_station_send','in2.name as transport_station_receive')
      .fetch()
      if(arr.toJSON().length > 0){
        response.json({ status: true , data : arr.toJSON()})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
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
    if(data.step0 == 1){
      status = 0
      inventory = 0
      const hs = new HistoryGoods()
      hs.goods = data.id
      hs.inventory = inventory
      hs.status = status
      yield hs.save()
    }
    if(data.step1 == 1){
      status = 1
      inventory = goods.transport_station_send
      const hs = new HistoryGoods()
      hs.goods = data.id
      hs.inventory = inventory
      hs.status = status
      yield hs.save()
    }
    if(data.step2 == 1){
      status = 2
      inventory = 0
      const hs = new HistoryGoods()
      hs.goods = data.id
      hs.inventory = inventory
      hs.status = status
      yield hs.save()
    }
    if(data.step3 == 1){
      status = 3
      inventory = goods.transport_station_receive
      const hs = new HistoryGoods()
      hs.goods = data.id
      hs.inventory = inventory
      hs.status = status
      yield hs.save()
    }
    if(data.step4 == 1){
      status = 4
      inventory = 0
      const hs = new HistoryGoods()
      hs.goods = data.id
      hs.inventory = inventory
      hs.status = status
      yield hs.save()
    }

    goods.name = data.name
    goods.transport_station_receive = data.transport_station_receive
    goods.parcel_volumes = data.parcel_volumes
    goods.size = data.size
    goods.lot_number = data.lot_number
    goods.surcharge = data.surcharge
    goods.price = data.price
    goods.surcharge_amount = data.surcharge_amount
    goods.total_amount = parseInt(data.price) + parseInt(data.surcharge_amount)
    goods.note = data.note
    goods.sender_fullname = data.sender_fullname
    goods.sender_phone = data.sender_phone
    goods.sender_email = data.sender_email
    goods.sender_address = data.sender_address
    goods.receiver_fullname = data.receiver_fullname
    goods.receiver_phone = data.receiver_phone
    goods.receiver_email = data.receiver_email
    goods.receiver_address = data.receiver_address
    goods.receiver_city = data.receiver_city
    goods.collect = data.collect
    goods.inventory = inventory
    goods.status = status
    yield goods.save()
    response.json({ status: true  , message: Antl.formatMessage('messages.update_success') })
    } catch (e) {
     response.json({ status: false , error : true , message: Antl.formatMessage('messages.update_error')  })
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
      .where('goods.id',data)
      .select('goods.*','in1.name as transport_station_send')
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
