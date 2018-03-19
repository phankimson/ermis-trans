'use strict'

const TypeTransport = exports = module.exports = {}

TypeTransport.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

TypeTransport.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
