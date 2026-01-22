
export default {
  methods: {
    findNodeByIdOrMrid(idOrMrid, nodes) {
      for (const node of nodes) {
        if (node.id === idOrMrid || node.mrid === idOrMrid) {
          return node
        }

        if (node.children) {
          const result = this.findNodeByIdOrMrid(idOrMrid, node.children)
          if (result) return result
        }
      }
      return null
    },

    findNodeById(mrid, nodes) {
      for (const node of nodes) {
        if (node.mrid === mrid) {
          return node
        }

        if (node.children) {
          const result = this.findNodeById(mrid, node.children)
          if (result) return result
        }
      }
      return null
    }
  }
}
