'use strict'

const Lucid = use('Lucid')

class Driver extends Lucid {

  static boot () {
   super.boot()
   this.addHook('beforeCreate', 'Driver.validate')
   this.addHook('beforeUpdate', 'Driver.validate')
 }
  static get table () {
    return 'driver'
  }
  static get createTimestamp () {
    return null
  }
  static get updateTimestamp () {
   return null
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

}

module.exports = Driver
