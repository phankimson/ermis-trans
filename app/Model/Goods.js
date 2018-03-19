'use strict'

const Lucid = use('Lucid')

class Goods extends Lucid {
  static get table () {
    return 'goods'
  }
  static get createTimestamp () {
    return 'created_at'
  }
  static get updateTimestamp () {
   return 'updated_at'
   }
   static get deleteTimestamp () {
     return null
   }
   static scopeTypeWhere (builder,column,value) {
     if(value){
      builder.where(column,value)
     }
      builder.whereNotNull(column)
    }
    static scopeOrTypeWhere (builder,column,value) {
      if(value){
       builder.orWhere(column,value)
      }
       builder.whereNotNull(column)
     }
    static scopeTypeWhereIn (builder,column,value) {
      if(value){
       builder.whereIn(column,value)
      }
       builder.whereNotNull(column)
     }
     static scopeTypeWhereNot (builder,column,value) {
       if(value){
        builder.where(column,value)
       }
        builder.whereNot(column,0)
      }
      static scopeOrTypeWhereNot (builder,column,value) {
        if(value){
         builder.orWhere(column,value)
        }
         builder.whereNot(column,0)
       }
       detail (){
        return this
        .hasMany('App/Model/PosDetail','id','item_id')
        .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general')
        .where('pos_general.active',1)
        .whereIn('pos_general.status',[1,2])
      }
}

module.exports = Goods
