const _ = require('lodash');

const tests = [
    [3,3],
    [3,3],
    [2,1,3],
    [4,1,1,1],
    [5,1,2,1],
    [5,4,2],
    [3,1,1,3],
    [3,2,4],
    [2,2,1],
    [2,1],
    [2,3,2,2],
    [2,3,2],
    [3,7],
    [4,7],
    [4,1]
];

class Row {

    constructor(data, size) {
        this.size = size;
        this.value = Row.createRange(size, ' ');
        this.possibleRows = [];
        this.blocks = [].concat(data);
        this.countGaps();
        this.findTotal();
        this.maxDelta();
        this.findUnshiftable();
        return this;
    }

    static createRange(size, fill) {
        return _.range(0, size).map(() => fill);
    }

    static countGaps(blocks) {
        let gaps = blocks.length - 1;
        return (gaps) ? gaps : 0;
    }

    countGaps() {
        this.minGaps = Row.countGaps(this.blocks);
    }

    static findTotal(blocks, gaps) {
        gaps = (typeof gaps === 'undefined') ? Row.countGaps(blocks) : gaps;
        let total = blocks.reduce((total, block) => total += block, 0) + gaps;
        return (total > 0) ? total : 0;
    }

    findTotal() {
        this.total = Row.findTotal(this.blocks, this.minGaps);
    }

    maxDelta() {
        this.maxDelta = this.size - this.total;
    }

    findUnshiftable() {
        this.unshiftables = [];
        this.blocks.forEach((block, index, blocks) => {
            let leftBlocks = (blocks[index - 1]) ? blocks.slice(0, index) : [];
            let leftTotal = (leftBlocks.length) ? Row.findTotal(leftBlocks) + 1 : 0;
            let rightBlocks = (blocks[index + 1]) ? blocks.slice(index + 1) : [];
            let rightTotal = (rightBlocks.length) ? Row.findTotal(rightBlocks) + 1 : 0;
            let used = leftTotal + rightTotal;
            let space = this.size - used;
            let overlap = (block - (space / 2)) * 2;
            let offset = ((space - overlap) / 2) + leftTotal;
            if (overlap > 0) {
                let unshiftable = Row.createRange(offset, false)
                                      .concat(Row.createRange(overlap, true));
                while (unshiftable.length < this.size) {
                    unshiftable.push(false);
                }
                if (unshiftable.length) {
                    this.unshiftables.push(unshiftable);
                }
            }
        }, this);
        this.possibleRows = Row._arrayLogicalOr(this.unshiftables);
    }

    static checkLengths(array) {
        let lengths = array.map(arr => arr.length).filter((v, i, a) => a.indexOf(v) === i);
        if (lengths.length === 1) {
            return lengths[0];
        } else {
            return false;
        }
    }

    static _arrayLogicalOr(arrays) {
        let length = Row.checkLengths(arrays);
        if (length === false) { return []; }
        let output = [];
        for (let index = 0; index < length; index++) {
            let result = false;
            for (let i = 0; i < arrays.length; i++) {
                if (arrays[i][index]) {
                   result = true;
                }
            }
            output.push(result);
        }
        return output;
    }

    results() {
        let output = [];
        this.possibleRows.forEach((element) => {
            let char = (element) ? 'X' : '-';
            output.push(char);
        });
        return (output.length) ? output.join('') : false;
    }

}

/*
for (let i = 0; i < tests.length; i++) {
    let test = new Row(tests[i], 15);
    console.log(test.blocks);
    console.log(test.results());

}
*/

module.exports = Row;
