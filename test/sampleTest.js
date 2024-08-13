const { expect } = require('chai');

describe('Sample Test', () => {

	it('should return true if the input is true', () => {
		const input = true;
		const output = input;  // 本来、ロジックがあるべきところ
		expect(output).to.be.true;
		//expect(output).to.be.false; // このテストは意図的に失敗する
	});

	it('should throw an error for undefined input', () => {
		const testFunction = (input) => {
			if (input === undefined) {
				throw new Error('Input is undefined');
			}
			return input;
		};

		expect(() => testFunction(undefined)).to.throw(Error, 'Input is undefined');
	});

	it('should pass when input is not undefined', () => {
		const testFunction = (input) => {
			if (input === undefined) {
				throw new Error('Input is undefined');
			}
			return input;
		};

		expect(testFunction('valid input')).to.equal('valid input');
	});

});
