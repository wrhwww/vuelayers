<script>
  import { Style } from 'ol/style'
  import { olCmp, styleContainer, stubVNode } from '../../mixins'
  import { isFunction, noop, mergeDescriptors, sequential } from '../../utils'

  /**
   * Style function component for advanced styling.
   * Plays the role of both a style that mounts itself to style target component (vl-layer-vector, vl-feature & etc.)
   * and style target for inner style containers (vl-style-box) as fallback style.
   */
  export default {
    name: 'VlStyleFunc',
    mixins: [
      stubVNode,
      styleContainer,
      olCmp,
    ],
    stubVNode: {
      empty: false,
      attrs () {
        return {
          id: this.vmId,
          class: this.vmClass,
        }
      },
    },
    props: {
      /**
       * @type {function(): function(feature: Feature): Style}
       */
      func: {
        type: Function,
        // required: true,
      },
      /**
       * @deprecated Use `func` prop instead.
       * @todo remove in v0.13.x
       */
      factory: Function,
    },
    computed: {
      styleFunc () {
        let func = this.func
        if (!func && this.factory) {
          func = this.factory()
        }
        if (!isFunction(func)) {
          if (process.env.NODE_ENV !== 'production') {
            this.$logger.warn('Factory returned a value not of Function type, fallback style will be used')
          }
          func = noop
        }

        return func
      },
    },
    watch: {
      styleFunc: /*#__PURE__*/sequential(async function () {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('styleFunc changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      }),
    },
    created () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.factory) {
          this.$logger.warn("'factory' prop is deprecated. Use 'func' prop instead.")
        }
      }

      this::defineServices()
    },
    updated () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.factory) {
          this.$logger.warn("'factory' prop is deprecated. Use 'func' prop instead.")
        }
      }
    },
    methods: {
      /**
       * @return {function(feature: Feature): Style}
       * @protected
       */
      createOlObject () {
        // user provided style function
        const providedStyleFunc = this.styleFunc
        // fallback style function made from inner style containers
        const fallbackStyleFunc = this.createStyleFunc(this.$style, this.getDefaultStyle())

        const func = function __styleFunc (feature, resolution) {
          const style = providedStyleFunc(feature, resolution)
          // not empty or null style
          if (
            style == null ||
            (Array.isArray(style) && style.length) ||
            style instanceof Style
          ) {
            return style
          }
          return fallbackStyleFunc(feature, resolution)
        }
        func.id = this.currentId

        return func
      },
      /**
       * @returns {Object}
       * @protected
       */
      getServices () {
        return mergeDescriptors(
          this::olCmp.methods.getServices(),
          this::styleContainer.methods.getServices(),
        )
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async mount () {
        if (this.$styleContainer) {
          await this.$styleContainer.setStyle(this)
        }

        return this::olCmp.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        if (this.$styleContainer && this.$styleContainer.getStyle() === this.$styleFunc) {
          await this.$styleContainer.setStyle(null)
        }

        return this::olCmp.methods.unmount()
      },
      async getStyleTarget () {
        return {
          setStyle: async () => {
            if (process.env.VUELAYERS_DEBUG) {
              this.$logger.log('style changed, scheduling recreate...')
            }

            await this.scheduleRecreate()
          },
        }
      },
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      $styleFunc: {
        enumerable: true,
        get: () => this.$olObject,
      },
      /**
       * @type {Object|undefined}
       */
      $styleContainer: {
        enumerable: true,
        get: () => this.$services?.styleContainer,
      },
    })
  }
</script>
