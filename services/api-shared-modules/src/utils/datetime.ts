import moment from 'moment';

export default class DateTimeFunctions {

	public static IsWithinHours = (hours: number, date: Date | string): boolean => moment(date) < moment().subtract(hours, 'hours');

}
