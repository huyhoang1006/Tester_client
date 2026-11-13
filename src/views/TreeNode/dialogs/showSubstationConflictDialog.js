import Vue from 'vue'
import ConflictDialog from './ConflictDialog.vue'

export function showSubstationConflictDialog(fields, name) {
    return new Promise((resolve, reject) => {
        const mount = document.createElement('div')
        document.body.appendChild(mount)
        let settled = false
        const instance = new Vue({
            data: { visible: true, fields },
            render(h) {
                return h(ConflictDialog, {
                    props: { visible: this.visible, diffFields: this.fields, name },
                    on: {
                        resolve: (resolved) => finish(resolved),
                        cancel: () => finish(null)
                    }
                })
            }
        }).$mount(mount)

        function finish(resolved) {
            if (settled) return
            settled = true
            instance.visible = false
            setTimeout(() => {
                instance.$destroy()
                if (mount.parentNode) mount.parentNode.removeChild(mount)
            }, 300)
            if (resolved) resolve(resolved)
            else reject(new Error('CANCELED'))
        }
    })
}
