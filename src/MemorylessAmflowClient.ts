import type * as amf from "@akashic/amflow";
import type * as pl from "@akashic/playlog";

export interface MemorylessAmflowClientParameterObject {
	playId: string;
}

export class MemorylessAmflowClient implements amf.AMFlow {
	_playId: string;

	_zerothStartPoint: amf.StartPoint | null = null;
	_tickHandlers: ((tick: pl.Tick) => void)[] = [];
	_eventHandlers: ((ev: pl.Event) => void)[] = [];

	constructor(param: MemorylessAmflowClientParameterObject) {
		this._playId = param.playId;
	}

	open(playId: string, callback?: (error: Error | null) => void): void {
		if (!callback) return;
		setTimeout(() => {
			if (playId !== this._playId)
				return void callback(new Error("MemorylessAmflowClient#open: unknown playId"));
			callback(null);
		}, 0);
	}

	close(callback?: (error: Error | null) => void): void {
		if (!callback) return;
		setTimeout(() => {
			callback(null);
		}, 0);
	}

	authenticate(_token: string, callback: (error: Error | null, permission?: amf.Permission) => void): void {
		setTimeout(() => {
			callback(null, {
				writeTick: true,
				readTick: true,
				subscribeTick: false,
				sendEvent: false,
				subscribeEvent: true,
				maxEventPriority: 2
			});
		}, 0);
	}

	sendTick(tick: pl.Tick): void {
		this._tickHandlers.forEach((h: (t: pl.Tick) => void) => h(tick));
	}

	onTick(handler: (tick: pl.Tick) => void): void {
		this._tickHandlers.push(handler);
	}

	offTick(handler: (tick: pl.Tick) => void): void {
		this._tickHandlers = this._tickHandlers.filter((h: (tick: pl.Tick) => void) => (h !== handler));
	}

	sendEvent(pev: pl.Event): void {
		this._eventHandlers.forEach((h: (pev: pl.Event) => void) => h(pev));
	}

	onEvent(handler: (pev: pl.Event) => void): void {
		this._eventHandlers.push(handler);
	}

	offEvent(handler: (pev: pl.Event) => void): void {
		this._eventHandlers = this._eventHandlers.filter((h: (pev: pl.Event) => void) => (h !== handler));
	}

	getTickList(opts: amf.GetTickListOptions, callback: (error: Error | null, tickList?: pl.TickList) => void): void;
	getTickList(begin: number, end: number, callback: (error: Error | null, tickList?: pl.TickList) => void): void;
	getTickList(
		optsOrBegin: number | amf.GetTickListOptions,
		endOrCallback: number | ((error: Error | null, tickList?: pl.TickList) => void),
		callbackOrUndefined?: (error: Error | null, tickList?: pl.TickList) => void
	): void {
		let callback: ((error: Error | null, tickList?: pl.TickList) => void);

		if (typeof optsOrBegin === "number") {
			callback = callbackOrUndefined as (error: Error | null, tickList?: pl.TickList) => void;
		} else {
			callback = endOrCallback as (error: Error | null, tickList?: pl.TickList) => void;
		}

		setTimeout(() => void callback(new Error("MemorylessAmflowClient#getTickList: not implemented")), 0);
	}

	putStartPoint(startPoint: amf.StartPoint, callback: (error: Error | null) => void): void {
		setTimeout(() => {
			if (startPoint.frame === 0) {
				this._zerothStartPoint = startPoint;
			}
			callback(null);
		}, 0);
	}

	getStartPoint(_opts: amf.GetStartPointOptions, callback: (error: Error | null, startPoint?: amf.StartPoint) => void): void {
		setTimeout(() => {
			if (this._zerothStartPoint) {
				callback(null, this._zerothStartPoint);
			} else {
				callback(new Error("MemorylessAmflowClient#getStorageData: no zeroth startPoint"));
			}
		}, 0);
	}

	putStorageData(_key: pl.StorageKey, _value: pl.StorageValue, _options: any, callback: (err: Error | null) => void): void {
		setTimeout(() => void callback(new Error("MemorylessAmflowClient#putStorageData: not implemented")), 0);
	}

	getStorageData(_keys: pl.StorageReadKey[], callback: (error: Error | null, values?: pl.StorageData[]) => void): void {
		setTimeout(() => void callback(new Error("MemorylessAmflowClient#getStorageData: not implemented")), 0);
	}
}
