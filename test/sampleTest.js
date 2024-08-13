const { expect } = require('chai');
const config = require('../test-config');

describe('Sample Test', () => {

	it('should return true if the input is true', () => {
		const input = true;
		const output = input;

		// Use the configuration to toggle between a passing and failing test
		expect(output).to.equal(config.shouldPass ? true : false);
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

