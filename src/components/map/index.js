/**
 * Map module consists of two main components:
 *
 * - <a @click="scrollTo('vl-map')">Map `vl-map`</a> - viewport, map rendering and low level interactions.
 * - <a @click="scrollTo('vl-view')">View `vl-view`</a> - 2D view of the map
 *
 * @module map
 * @example <caption>Install</caption>
 * import Vue from 'vue'
 * // import module and styles
 * import { Map } from 'vuelayers'
 * import 'vuelayers/lib/style.css'
 *
 * // register vl-map and vl-view components
 * Vue.use(Map)
 */
import Map from './map.vue'
import View from './view.vue'

export default {
  /**
   * Map `vl-map` component.
   *
   * Container for **layers**, **interactions**, **controls** and **overlays**. It responsible for viewport
   * rendering and low level interaction events.
   *
   * @see module:map/map
   */
  Map,
  /**
   * View `vl-view` component.
   *
   * Represents a simple **2D view** of the map. This is the component to act upon to change the **center**,
   * **resolution**, and **rotation** of the map.
   *
   * @see module:map/view
   */
  View,
  /**
   * Registers Map and View components with default names.
   *
   * @param {Vue} Vue
   * @return {void}
   */
  install (Vue) {
    Vue.component(Map.name, Map)
    Vue.component(View.name, View)
  },
}
