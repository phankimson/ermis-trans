'use strict'

const Lucid = use('Lucid')

class PosDetailPlan extends Lucid {
  static get table () {
    return 'pos_detail_plan'
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
       static scopeOrTypeWhereMuti (builder,column1,column2,value1,value2) {
         if(value1 && value2){
           builder.where(function () {
                this.where(column2,value2)
                this.orWhere(column1,value1)
              })
         }else if(value1 && !value2){
           builder.where(function () {
                this.orWhereNotNull(column2)
                this.where(column1,value1)
              })
         }else if(!value1 && value2){
           builder.where(function () {
                this.orWhereNotNull(column1)
                this.where(column2,value2)
              })
         }else{
           builder.where(function () {
                this.whereNotNull(column1)
                this.orWhereNotNull(column2)
              })
         }
        }
        static scopeTypeWhereMuti (builder,column1,column2,value1,value2) {
          if(value1 && value2){
            builder.where(function () {
                 this.where(column2,value2)
                 this.where(column1,value1)
               })
          }else if(value1 && !value2){
            builder.where(function () {
                 this.whereNotNull(column2)
                 this.where(column1,value1)
               })
          }else if(!value1 && value2){
            builder.where(function () {
                 this.whereNotNull(column1)
                 this.where(column2,value2)
               })
          }else{
            builder.where(function () {
                 this.whereNotNull(column1)
                 this.whereNotNull(column2)
               })
          }
         }
}

module.exports = PosDetailPlan
