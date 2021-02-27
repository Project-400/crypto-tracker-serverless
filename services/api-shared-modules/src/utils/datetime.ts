import moment from 'moment';

export default class DateTimeFunctions {

	public static IsWithinHours = (hours: number, date: Date | string): boolean => moment(date) < moment().subtract(hours, 'hours');

}

export class DatetimeUtils {

	private minuteMillis: number = 1000 * 60;
	private hourMillis: number = this.minuteMillis * 60;
	private dayMillis: number = this.hourMillis * 24;

	public FloorTime = (millis: number): string => new Date(Math.floor(new Date().getTime() / millis) * millis).toISOString();

	public FloorMinute = (): string => this.FloorTime(this.minuteMillis);
	public FloorHour = (): string => this.FloorTime(this.hourMillis);
	public FloorDay = (): string => this.FloorTime(this.dayMillis);
	public PreviousFloorMinute = (count: number): string => this.FloorTime(this.minuteMillis * count);
	public PreviousFloorHour = (count: number): string => this.FloorTime(this.hourMillis * count);
	public PreviousFloorDay = (count: number): string => this.FloorTime(this.dayMillis * count);

}
