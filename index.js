const _ = require('lodash');

const argv = require('yargs')
    .command('nonogram [clues..]', 'analyze nonogram clues')
    .default('size', 15)
    .describe('size', 'Width of nonogram board')
    .help('h')
    .alias('h', 'help')
    .argv;

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

if (require.main === module) {
    var blocks = argv._;
    if (blocks.filter((block) => !isNaN(block)).length == blocks.length) {
        var row = new Row(blocks, argv.size);
        var results = row.results();
        if (results) {
            console.log(results);
        }
    } else {
        console.log('Please provide numerical clue data only.');
        console.log(blocks);
        process.exit(1);
    }
}

module.exports = Row;
