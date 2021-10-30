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
            treeData: {
                type: Array,
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
                let parentNode = currentNode.parent;
                // 兼容element-plus的 el-tree-v2 (Virtualized Tree 虚拟树)
                if (currentNode.level === 1 && !currentNode.parent) {
                    // el-tree-v2的第一层node是没有parent的，必需 treeData 创建一个parent
                    if (!this.treeData || !Array.isArray(this.treeData)) {
                        throw Error(
                            'if you using el-tree-v2 (Virtualized Tree) of element-plus,element-tree-line required data.'
                        );
                    }
                    parentNode = {
                        children: Array.isArray(this.treeData)
                            ? this.treeData.map((item) => {
                                  return { ...item, key: item.id };
                              })
                            : [],
                        level: 0,
                        key: 'node-0',
                        parent: null,
                    };
                }
                if (parentNode) {
                    // element-plus的 el-tree-v2 使用的是children和key， 其他使用的是 childNodes和id
                    const index = (
                        parentNode.children || parentNode.childNodes
                    ).findIndex(
                        (item) =>
                            (item.key || item.id) ===
                            (currentNode.key || currentNode.id)
                    );
                    lastnodeArr.unshift(
                        index ===
                            (parentNode.children || parentNode.childNodes)
                                .length -
                                1
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
