'use strict'

const ParcelVolumes = exports = module.exports = {}

ParcelVolumes.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

ParcelVolumes.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
