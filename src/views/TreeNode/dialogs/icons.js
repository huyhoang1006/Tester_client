const IconSubstation = {
    render(h) {
        return h('svg', { attrs: { viewBox: '0 0 24 24', width: '24', height: '24' } }, [
            h('path', { attrs: { fill: 'currentColor', d: 'M12,3L2,12H5V20H19V12H22L12,3M11,10H13V18H11V10Z' } })
        ]);
    }
};

const IconVoltageLevel = {
    render(h) {
        return h('svg', { attrs: { viewBox: '0 0 24 24', width: '24', height: '24' } }, [
            h('path', { attrs: { fill: 'currentColor', d: 'M7,2V13H10V22L17,10H13L17,2H7Z' } })
        ]);
    }
};

const IconBay = {
    render(h) {
        return h('svg', { attrs: { viewBox: '0 0 100 100', width: '24', height: '24' } }, [
            h('path', { attrs: { d: 'M 20 22 Q 20 20 23 20 L 77 20 Q 80 20 80 22 L 80 32 Q 80 34 77 34 L 77 26 L 23 26 L 23 34 Q 20 34 20 32 Z', fill: 'currentColor' } }),
            ...[35, 50, 65].map(x => [
                h('path', { attrs: { d: `M ${x - 6} 45 L ${x + 6} 45 L ${x + 4} 55 L ${x - 4} 55 Z`, fill: 'currentColor' } }),
                h('rect', { attrs: { x: x - 2, y: 50, width: '4', height: '40', rx: '2', fill: 'currentColor' } })
            ]).flat()
        ]);
    }
};

const IconCB = {
    render(h) {
        return h('svg', { attrs: { viewBox: '0 0 100 100' } }, [
            h('line', { attrs: { x1: '50', y1: '90', x2: '50', y2: '70', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('line', { attrs: { x1: '50', y1: '70', x2: '20', y2: '35', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('line', { attrs: { x1: '45', y1: '15', x2: '65', y2: '35', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('line', { attrs: { x1: '45', y1: '35', x2: '65', y2: '15', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } })
        ]);
    }
};

const IconPowerCable = {
    render(h) {
        return h('svg', { attrs: { viewBox: '0 0 100 100' } }, [
            h('circle', { attrs: { cx: '50', cy: '50', r: '30', fill: 'none', stroke: 'currentColor', 'stroke-width': '5' } }),
            h('line', { attrs: { x1: '75', y1: '25', x2: '90', y2: '10', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('circle', { attrs: { cx: '90', cy: '10', r: '10', fill: 'currentColor' } }),
            h('line', { attrs: { x1: '25', y1: '75', x2: '15', y2: '85', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('circle', { attrs: { cx: '10', cy: '90', r: '10', fill: 'currentColor' } })
        ]);
    }
};

const IconCT = {
    render(h) {
        return h('svg', { attrs: { viewBox: '0 0 100 100' } }, [
            h('circle', { attrs: { cx: '50', cy: '50', r: '30', fill: 'none', stroke: 'currentColor', 'stroke-width': '5' } }),
            h('line', { attrs: { x1: '50', y1: '95', x2: '50', y2: '5', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } })
        ]);
    }
};

const IconVT = {
    render(h) {
        return h('svg', { attrs: { viewBox: '0 0 100 100' } }, [
            h('circle', { attrs: { cx: '50', cy: '40', r: '20', fill: 'none', stroke: 'currentColor', 'stroke-width': '5' } }),
            h('circle', { attrs: { cx: '50', cy: '60', r: '20', fill: 'none', stroke: 'currentColor', 'stroke-width': '5' } }),
            h('line', { attrs: { x1: '50', y1: '15', x2: '50', y2: '5', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('line', { attrs: { x1: '50', y1: '82', x2: '50', y2: '92', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('line', { attrs: { x1: '35', y1: '95', x2: '65', y2: '95', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } })
        ]);
    }
};

const IconDisconnector = {
    render(h) {
        return h('svg', { attrs: { viewBox: '0 0 100 100' } }, [
            h('line', { attrs: { x1: '50', y1: '90', x2: '50', y2: '70', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('line', { attrs: { x1: '50', y1: '70', x2: '20', y2: '35', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('line', { attrs: { x1: '50', y1: '25', x2: '50', y2: '10', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('line', { attrs: { x1: '40', y1: '25', x2: '60', y2: '25', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } })
        ]);
    }
};

const IconBreaker = {
    render(h) {
        return h('svg', { attrs: { viewBox: '0 0 100 100' } }, [
            h('line', { attrs: { x1: '50', y1: '0', x2: '50', y2: '30', stroke: 'currentColor', 'stroke-width': '5' } }),
            h('rect', { attrs: { x: '25', y: '30', width: '50', height: '40', fill: 'none', stroke: 'currentColor', 'stroke-width': '5' } }),
            h('line', { attrs: { x1: '50', y1: '70', x2: '50', y2: '100', stroke: 'currentColor', 'stroke-width': '5' } })
        ]);
    }
};

const IconBushing = {
    render(h) {
        return h('svg', { attrs: { viewBox: '0 0 100 100' } }, [
            h('line', { attrs: { x1: '50', y1: '5', x2: '50', y2: '95', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('ellipse', { attrs: { cx: '50', cy: '50', rx: '20', ry: '35', fill: 'none', stroke: 'currentColor', 'stroke-width': '5' } }),
            h('line', { attrs: { x1: '35', y1: '30', x2: '65', y2: '30', stroke: 'currentColor', 'stroke-width': '5' } }),
            h('line', { attrs: { x1: '30', y1: '50', x2: '70', y2: '50', stroke: 'currentColor', 'stroke-width': '5' } }),
            h('line', { attrs: { x1: '35', y1: '70', x2: '65', y2: '70', stroke: 'currentColor', 'stroke-width': '5' } })
        ]);
    }
};

const IconSurgeArrester = {
    render(h) {
        return h('svg', { attrs: { viewBox: '0 0 100 100' } }, [
            h('line', { attrs: { x1: '50', y1: '10', x2: '50', y2: '25', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('line', { attrs: { x1: '50', y1: '75', x2: '50', y2: '90', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('rect', { attrs: { x: '30', y: '25', width: '40', height: '50', fill: 'none', stroke: 'currentColor', 'stroke-width': '5', rx: '2' } }),
            h('path', { attrs: { d: 'M45 35 L60 45 L40 55 L55 65', fill: 'none', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' } }),
            h('path', { attrs: { d: 'M80 30 V70 M80 70 L75 60 M80 70 L85 60', fill: 'none', stroke: 'currentColor', 'stroke-width': '5' } })
        ]);
    }
};

const IconRotatingMachine = {
    render(h) {
        return h('svg', { attrs: { viewBox: '0 0 100 100' } }, [
            h('circle', { attrs: { cx: '50', cy: '50', r: '35', fill: 'none', stroke: 'currentColor', 'stroke-width': '5' } }),
            h('path', { attrs: { d: 'M 30 50 Q 40 30 50 50 T 70 50', fill: 'none', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } })
        ]);
    }
};

const IconCapacitor = {
    render(h) {
        return h('svg', { attrs: { viewBox: '0 0 100 100' } }, [
            h('line', { attrs: { x1: '50', y1: '10', x2: '50', y2: '40', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('line', { attrs: { x1: '25', y1: '40', x2: '75', y2: '40', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('line', { attrs: { x1: '25', y1: '60', x2: '75', y2: '60', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('line', { attrs: { x1: '50', y1: '60', x2: '50', y2: '90', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } })
        ]);
    }
};

const IconReactor = {
    render(h) {
        return h('svg', { attrs: { viewBox: '0 0 100 100' } }, [
            h('line', { attrs: { x1: '50', y1: '10', x2: '50', y2: '20', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('path', { attrs: { d: 'M50 20 A 15 15 0 0 1 50 50 A 15 15 0 0 1 50 80', fill: 'none', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } }),
            h('line', { attrs: { x1: '50', y1: '80', x2: '50', y2: '90', stroke: 'currentColor', 'stroke-width': '5', 'stroke-linecap': 'round' } })
        ]);
    }
};

export { IconSubstation, IconVoltageLevel, IconBay, IconCB, IconPowerCable, IconCT, IconVT, IconDisconnector, IconBushing, IconSurgeArrester, IconRotatingMachine, IconCapacitor, IconReactor, IconBreaker };