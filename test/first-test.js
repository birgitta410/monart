/* global describe, it */

describe('Give it some context', function () {
    describe('maybe a bit more context here', function () {
        it('should run here few assertions', function () {
        	var message = { date: 1402152565 };
			expect(moment().diff(moment(message.date, 'X'), 'days')).toBe(0);

			message.date = 1402056732;
			// yesterday: 1
			expect(moment().diff(moment(message.date, 'X'), 'days')).toBe(1);
			
			// message.date = 1202056732;
			// expect(moment().diff(moment(message.date, 'X'), 'days')).toBe(1);

        });
    });
});
