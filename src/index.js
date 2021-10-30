import './style.scss';
export function getElementLabelLine(h) {
    return {
        name: 'element-tree-line',
        props: {
            node: {
                type: Object,
                required: true,
            },
            data: {
                type: Object,
            },
            indent: {
                type: Number,
                default() {
                    return 16;
                },
            },
            showLabelLine: {
                type: Boolean,
                default: true,
            },
        },
        render(createElement) {
            const $createElement = h || createElement;
            // 自定义整行节点label区域
            const scopeSlotDefault = this.getScopedSlot('default');
            // 显示横线时自定义节点label区域
            const labelSlot = this.getScopedSlot('node-label');
            // 显示横线时追加在横线右边的内容
            const afterLabelSlot = this.getScopedSlot('after-node-label');
            const labelNodes = scopeSlotDefault
                ? this.getScopedSlotValue(scopeSlotDefault, {
                      node: this.node,
                      data: this.data,
                  })
                : [
                      labelSlot
                          ? this.getScopedSlotValue(labelSlot, {
                                node: this.node,
                                data: this.data,
                            })
                          : $createElement(
                                'span',
                                { class: 'element-tree-node-label' },
                                this.node.label
                            ),
                      this.showLabelLine
                          ? $createElement('span', {
                                class: 'element-tree-node-label-line',
                            })
                          : null,
                      this.getScopedSlotValue(afterLabelSlot, {
                          node: this.node,
                          data: this.data,
                      }),
                  ];
            // 取得每一层的当前节点是不是在当前层级列表的最后一个
            const lastnodeArr = [];
            let currentNode = this.node;
            while (currentNode) {
                const parentNode = currentNode.parent;
                if (parentNode) {
                    const index = parentNode.childNodes.findIndex(
                        (item) => item.id === currentNode.id
                    );
                    lastnodeArr.unshift(
                        index === parentNode.childNodes.length - 1
                    );
                }
                currentNode = parentNode;
            }
            const lineNodes = [];
            for (let i = 0; i < this.node.level; i++) {
                lineNodes.push(
                    $createElement('span', {
                        class: {
                            'element-tree-node-line-ver': true,
                            'last-node-line':
                                lastnodeArr[i] && this.node.level - 1 !== i,
                            'last-node-isLeaf-line':
                                lastnodeArr[i] && this.node.level - 1 === i,
                        },
                        style: { left: this.indent * i + 'px' },
                    })
                );
            }
            return $createElement(
                'span',
                {
                    class: 'element-tree-node-label-wrapper',
                },
                [labelNodes].concat(lineNodes).concat([
                    $createElement('span', {
                        class: 'element-tree-node-line-hor',
                        style: {
                            width: (this.node.isLeaf ? 24 : 8) + 'px',
                            left: (this.node.level - 1) * this.indent + 'px',
                        },
                    }),
                ])
            );
        },
        methods: {
            getScopedSlot(slotName) {
                if (!slotName) {
                    return null;
                }
                const slotNameSplits = slotName.split('||');
                let scopeSlot = null;
                for (let index = 0; index < slotNameSplits.length; index++) {
                    const name = slotNameSplits[index];
                    const slot = (this.$slots || {})[name];
                    if (slot) {
                        scopeSlot = slot;
                        break;
                    }
                    scopeSlot = (this.$scopedSlots || {})[name];
                    if (scopeSlot) {
                        break;
                    }
                }
                return scopeSlot;
            },
            getScopedSlotValue(scopeSlot, scopedData, defaultNode = null) {
                if (typeof scopeSlot === 'function') {
                    return scopeSlot(scopedData) || defaultNode;
                }
                return scopeSlot || defaultNode;
            },
        },
    };
}
const ElementLabelLine = getElementLabelLine();
export default ElementLabelLine;
