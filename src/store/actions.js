import { RECEIVE_ADDRESS, RECEIVE_CATEGORYS, RECEIVE_SHOPS } from './mutation-types'
import {reqAddress, reqFoodCategorys, reqShops} from '../api'

export default {
  getAddress ({commit, state}) {
    const geohash = state.latitude + ',' + state.longitude
    reqAddress(geohash).then(response => {
      if (response.code === 0) {
        const address = response.data
        commit(RECEIVE_ADDRESS, {address})
      }
    })
  },
  getShops ({commit, state}) {
    const {latitude, longitude} = state
    reqShops(latitude, longitude).then(response => {
      if (response.code === 0) {
        const shops = response.data
        commit(RECEIVE_SHOPS, {shops})
      }
    })
  },
  getCategorys ({commit, state}) {
    reqFoodCategorys().then(response => {
      if (response.code === 0) {
        const categorys = response.data
        commit(RECEIVE_CATEGORYS, {categorys})
      }
    })
  }
}
