'use strict'
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
const Goods = use('App/Model/Goods')  // EDIT
const HistoryGoods = use('App/Model/HistoryGoods') //EDIT

var moment = require('moment')

class HistoryGoodsController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "history-goods"  // EDIT
      this.room = "history-goods"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('history_goods.title')  // EDIT
      const item = yield Goods.query()
      .select('id','code','name as name')
      .fetch()
      const show = yield response.view('pos/pages/history_goods', {key : this.key ,room: this.room,title: title , item: item.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        const arr = yield HistoryGoods.query()
        .where('goods',data.item)
        .fetch()
        const goods = yield Goods.query()
        .where('goods.id',data.item)
        .innerJoin('inventory as in1','in1.id','goods.transport_station_send')
        .leftJoin('inventory as in2','in2.id','goods.transport_station_receive')
        .select('goods.*','in1.name as transport_station_send','in2.name as transport_station_receive')
        .first()
        response.json({ status: true  , data : arr.toJSON() , goods : goods})
      }catch(e){
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error')+' ' + e.message })
      }
  }

}
module.exports = HistoryGoodsController
