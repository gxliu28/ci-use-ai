const { expect } = require('chai');

describe('Sample Test', function() {
    it('should return true if the input is true', function() {
        const input = true;
        expect(input).to.be.true;
    });

    it('should throw an error for undefined input', function() {
        const testFunction = (input) => {
            if (input === undefined) {
                throw new Error('Input is undefined');
            }
            return true;
        };
        expect(() => testFunction(undefined)).to.throw('Input is undefined');
    });
});

