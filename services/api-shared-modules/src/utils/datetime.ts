import moment from 'moment';

export default class DateTimeFunctions {

	private static minuteMillis: number = 1000 * 60;
	private static hourMillis: number = DateTimeFunctions.minuteMillis * 60;
	private static dayMillis: number = DateTimeFunctions.hourMillis * 24;

	public static IsWithinHours = (hours: number, date: Date | string): boolean => moment(date) < moment().subtract(hours, 'hours');

	public static FloorTime = (millis: number): string => new Date(Math.floor(new Date().getTime() / millis) * millis).toISOString();

	public static FloorMinute: string = DateTimeFunctions.FloorTime(DateTimeFunctions.minuteMillis);
	public static FloorHour: string  = DateTimeFunctions.FloorTime(DateTimeFunctions.hourMillis);
	public static FloorDay: string  = DateTimeFunctions.FloorTime(DateTimeFunctions.dayMillis);

}
