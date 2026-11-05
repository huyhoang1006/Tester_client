/* eslint-disable */
/**
 * Hộp thoại khi máy đổi pha mà đã có KQTN ở pha cũ — 3 lựa chọn:
 *   1. move   – Move test results to phase mới (mặc định)
 *   2. keep   – Giữ nguyên, không thay đổi gì
 *   3. delete – Xoá hẳn bài test cũ
 * Nhãn/ghi chú từng lựa chọn có thể truyền vào (moveLabel, moveHint, deleteHint...).
 * @returns Promise<'move' | 'keep' | 'delete' | null>  (null = bấm Cancel / đóng)
 */
import Vue from 'vue'

export const askPhaseChange = ({
    title, message, oldPhase, newPhase,
    moveLabel = `Move test results to phase ${newPhase}`,
    moveHint = `Keep all results and relabel them as phase ${newPhase}.`,
    keepHint = `Change nothing in the tests; the results stay labelled as phase ${oldPhase}.`,
    deleteLabel = 'Delete the old tests',
    deleteHint = 'Remove these tests (with all their results) from the job.'
}) => new Promise(resolve => {
    const Dialog = Vue.extend({
        data() {
            return { visible: true, choice: 'move', settled: false }
        },
        methods: {
            done(value) {
                if (this.settled) return
                this.settled = true
                this.visible = false
                resolve(value)
                setTimeout(() => {
                    this.$destroy()
                    if (this.$el && this.$el.parentNode) this.$el.parentNode.removeChild(this.$el)
                }, 400)
            }
        },
        render(h) {
            const option = (value, label, hint) => h('el-radio', {
                props: { label: value },
                style: { display: 'flex', alignItems: 'flex-start', margin: '0 0 12px', whiteSpace: 'normal' }
            }, [
                h('div', { style: { display: 'inline-block' } }, [
                    h('div', { style: { fontWeight: 600 } }, label),
                    h('div', { style: { color: '#909399', fontSize: '12px', marginTop: '2px', lineHeight: '1.4' } }, hint)
                ])
            ])
            return h('el-dialog', {
                props: {
                    title,
                    visible: this.visible,
                    width: '560px',
                    appendToBody: true,
                    closeOnClickModal: false
                },
                on: {
                    'update:visible': value => { this.visible = value },
                    close: () => this.done(null)
                }
            }, [
                h('p', { style: { margin: '0 0 16px', lineHeight: '1.5', color: '#303133' } }, message),
                h('el-radio-group', {
                    props: { value: this.choice },
                    on: { input: value => { this.choice = value } },
                    style: { display: 'flex', flexDirection: 'column' }
                }, [
                    option('move', `1. ${moveLabel}`, moveHint),
                    option('keep', '2. Keep everything unchanged', keepHint),
                    option('delete', `3. ${deleteLabel}`, deleteHint)
                ]),
                h('span', { slot: 'footer' }, [
                    h('el-button', { props: { size: 'small' }, on: { click: () => this.done(null) } }, 'Cancel'),
                    h('el-button', { props: { size: 'small', type: 'primary' }, on: { click: () => this.done(this.choice) } }, 'OK')
                ])
            ])
        }
    })
    const vm = new Dialog()
    vm.$mount()
    document.body.appendChild(vm.$el)
})
