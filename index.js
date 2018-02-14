const _ = require('lodash');

const argv = require('yargs')
    .command('nonorow [clues..]', 'analyze nonogram clues')
    .default('size', 15)
    .describe('size', 'Width of nonogram board')
    .help('h')
    .alias('h', 'help')
    .argv;

class StaticNonoRow {
    static createRange(size, fill) {
        return _.range(0, size).map(() => fill);
    }

    static countGaps(blocks) {
        let gaps = blocks.length - 1;
        return (gaps) ? gaps : 0;
    }

    static findTotal(blocks, gaps) {
        gaps = (typeof gaps === 'undefined') ? StaticNonoRow.countGaps(blocks) : gaps;
        let total = blocks.reduce((total, block) => total += block, 0) + gaps;
        return (total > 0) ? total : 0;
    }

    static directionalTotal(blocks) {
        return (blocks.length) ? StaticNonoRow.findTotal(blocks) + 1 : 0;
    }

    static leftTotal(blocks, index) {
        let leftBlocks = (blocks[index - 1]) ? blocks.slice(0, index) : [];
        return StaticNonoRow.directionalTotal(leftBlocks);
    }

    static rightTotal(blocks, index) {
        let rightBlocks = (blocks[index + 1]) ? blocks.slice(index + 1) : [];
        return StaticNonoRow.directionalTotal(rightBlocks);
    }

    static findOverlap(block, blocks, index, size) {
        let leftTotal = StaticNonoRow.leftTotal(blocks, index);
        let rightTotal = StaticNonoRow.rightTotal(blocks, index);
        let used = leftTotal + rightTotal;
        let space = size - used;
        let overlap = (block - (space / 2)) * 2;
        let offset = ((space - overlap) / 2) + leftTotal;
        return {
            overlap: overlap,
            offset: offset
        };
    }

    static findUnshiftable(blocks, size) {
        let unshiftables = [];
        blocks.forEach((block, index, blocks) => {
            let overlapData = StaticNonoRow.findOverlap(block, blocks, index, size);
            let overlap = overlapData.overlap;
            let offset = overlapData.offset;
            if (overlap > 0) {
                let unshiftable = StaticNonoRow.createRange(offset, false)
                                      .concat(StaticNonoRow.createRange(overlap, true));
                while (unshiftable.length < size) {
                    unshiftable.push(false);
                }
                if (unshiftable.length && unshiftable.length == size) {
                    unshiftables.push(unshiftable);
                }
            }
        });
        return StaticNonoRow._arrayLogicalOr(unshiftables);
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
        let length = StaticNonoRow.checkLengths(arrays);
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

}

class NonoRow extends StaticNonoRow {

    constructor(data, size) {
        super();
        this.size         = size;
        this.value        = NonoRow.createRange(size, ' ');
        this.possibleRows = [];
        this.blocks       = [].concat(data);
        this.minGaps      = undefined;
        this.total        = undefined;
        this.maxDelta     = undefined;
        if (blocks.length) {
            this.analyze();
        }
        return this;
    }

    analyze() {
        return this.setMinGaps()
           .setTotal()
           .setMaxDelta()
           .findUnshiftable()
           .results();
    }

    setMinGaps() {
        this.minGaps = NonoRow.countGaps(this.blocks);
        return this;
    }

    setTotal() {
        this.total = NonoRow.findTotal(this.blocks, this.minGaps);
        return this;
    }

    setMaxDelta() {
        this.maxDelta = this.size - this.total;
        return this;
    }

    findUnshiftable() {
        this.possibleRows = NonoRow.findUnshiftable(this.blocks, this.size);
        return this;
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
        var results = new NonoRow(blocks, argv.size).analyze();
        if (results) {
            console.log(results);
        }
    } else {
        console.log('Please provide numerical clue data only.');
        console.log(blocks);
        process.exit(1);
    }
}

module.exports = NonoRow;
