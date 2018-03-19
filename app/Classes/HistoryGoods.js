'use strict'

const HistoryGoodsModel = use('App/Model/HistoryGoods')

class HistoryGoods {

  insertRecord (goods,inventory,status) {
      const result = new HistoryGoodsModel()
          result.goods = goods
          result.inventory = inventory
          result.status = status
          return result
  }

}

module.exports = HistoryGoods
