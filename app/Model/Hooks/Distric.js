'use strict'

const Distric = exports = module.exports = {}

Distric.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Distric.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
