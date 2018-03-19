'use strict'

const City = exports = module.exports = {}

City.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

City.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
