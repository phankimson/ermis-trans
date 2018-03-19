'use strict'

const Transport = exports = module.exports = {}

Transport.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Transport.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
