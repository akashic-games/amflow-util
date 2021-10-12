import { AMFlow, StartPoint, GetTickListOptions } from "@akashic/amflow";
import * as pl from "@akashic/playlog";

export const enum EventPriority {
	Lowest = 0,
	Unjoined = 1,
	Joined = 2,
	System = 3
}

export interface GetTicksRequest {
	from: number;
	to: number;
	respond: (error: Error | null, ticks?: pl.Tick[] | null) => void;
}

export class MockAMFlow implements AMFlow {
	static INVALID_PLAYID: string = "invalid-playId";
	static INVALID_TOKEN: string = "invalid-token";
	static INVALID_BEGIN_OF_GETTICKLIST: number = 200;
	static BEGIN_VALUE_CALLS_CALLBACK_OF_GETTICKLIST: number = 100;
	static INVALID_REGION_VALUE_OF_STORAGEDATA: number = 10;
	static REGIONKEY_CALLS_CALLBACK_OF_STORAGEDATA: string = "callback";

	ticks: pl.Tick[];
	logs: string[];

	tickHandlers: ((tick: pl.Tick) => void)[];
	eventHandlers: ((ev: pl.Event) => void)[];

	requestsGetTicks: GetTicksRequest[];
	requestsPutStorageData: ((err?: any) => void)[];
	requestsGetStorageData: ((err?: any) => void)[];
	storage: { [key: string]: pl.StorageValue };

	constructor() {
		this.ticks = [];
		this.logs = [];
		this.tickHandlers = [];
		this.eventHandlers = [];
		this.requestsGetTicks = [];
		this.requestsPutStorageData = [];
		this.requestsGetStorageData = [];
		this.storage = <any>Object.create(null);
	}

	hasEventHandler(h: (pev: pl.Event) => void): boolean {
		return this.eventHandlers.indexOf(h) !== -1;
	}

	open(playId: string, callback?: (error: Error | null) => void): void {
		if (callback) setTimeout(() => {
			if (playId === MockAMFlow.INVALID_PLAYID ) {
				return callback(new Error("open-error"));
			}
			callback(null);
		}, 0);
	}

	close(callback?: (error: Error | null) => void): void {
		if (callback) setTimeout(() => {
			callback(null);
		}, 0);
	}

	authenticate(token: string, callback: (error: Error | null, permission?: any) => void): void {
		setTimeout(() => {
			if (token === MockAMFlow.INVALID_TOKEN) {
				return callback(new Error("authenticate-error"));
			}

			callback(null, {
				writeTick: true,
				readTick: true,
				subscribeTick: true,
				subscribeEvent: true,
				sendEvent: true,
				maxEventPriority: 0
			});
		}, 0);
	}

	sendTick(tick: pl.Tick): void {
		this.logs.push(JSON.stringify(tick));
	}

	onTick(handler: (tick: pl.Tick) => void): void {
		this.tickHandlers.push(handler);
	}

	offTick(handler: (tick: pl.Tick) => void): void {
		this.tickHandlers = this.tickHandlers.filter(h => h !== handler);
	}

	sendEvent(event: pl.Event): void {
		this.logs.push(JSON.stringify(event));
		this.eventHandlers.forEach((h: (pev: pl.Event) => void) => {
			h(event);
		});
	}

	onEvent(handler: (event: pl.Event) => void): void {
		this.eventHandlers.push(handler);
	}

	offEvent(handler: (event: pl.Event) => void): void {
		this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
	}

	getTickList(
		optsOrBegin: number | GetTickListOptions,
		endOrCallback: number | ((error: Error | null, tickList?: pl.TickList) => void),
		callbackOrUndefined?: (error: Error | null, tickList?: pl.TickList) => void
	): void {
		let opts: GetTickListOptions;
		let callback: (error: Error | null, tickList?: pl.TickList) => void;

		if (typeof optsOrBegin === "number") {
			// NOTE: optsOrBegin === "number" であれば必ず amflow@2 以前の引数だとみなしてキャストする
			opts = {
				begin: optsOrBegin,
				end: endOrCallback as number
			};
			if (callbackOrUndefined)
				callback = callbackOrUndefined;
		} else {
			// NOTE: optsOrBegin !== "number" であれば必ず amflow@3 以降の引数だとみなしてキャストする
			opts = optsOrBegin;
			callback = endOrCallback as (error: Error | null, tickList?: pl.TickList) => void;
		}
		this.logs.push(`${opts.begin},${opts.end}`);

		let req: GetTicksRequest;
		const wrap = (error: Error | null, tickArray?: pl.Tick[] | null): void => {
			this.requestsGetTicks = this.requestsGetTicks.filter((r: GetTicksRequest) => {
				return r !== req;
			});
			if (!tickArray || tickArray.length === 0) {
				callback(null, undefined);
				return;
			}
			const ret: pl.TickList = [
				tickArray[0][0],
				tickArray[tickArray.length - 1][0],
				tickArray.filter((t: pl.Tick) => !!(t[1] || t[2]))
			];
			callback(error, ret);
		};

		if (opts.begin >= MockAMFlow.BEGIN_VALUE_CALLS_CALLBACK_OF_GETTICKLIST) {
			this.logs.push(`${opts.begin},${opts.end}`);
			if (opts.begin === MockAMFlow.INVALID_BEGIN_OF_GETTICKLIST) {
				setTimeout(() => callback(new Error("getTickList-error")), 0);
			} else {
				const tickList: pl.TickList = [opts.begin, opts.end, []];
				setTimeout(() =>  callback(null, tickList), 0);
			}
		} else {
			req = { from: opts.begin, to: opts.end, respond: wrap };
			this.requestsGetTicks.push(req);
		}
	}

	putStartPoint(startPoint: StartPoint, callback: (error: Error | null) => void): void {
		this.logs.push(JSON.stringify(startPoint));
		setTimeout(() => {
			callback(startPoint.frame !== 0 ? new Error("putStartPoint-error") : null);
		}, 0);
	}

	getStartPoint(opts: { frame?: number }, callback: (error: Error | null, startPoint?: StartPoint) => void): void {
		this.logs.push("getStartPoint");
		setTimeout(() => {
			if (opts.frame && opts.frame >= 100) {
				callback(new Error("getStartPoint-error"));
			} else {
				callback(null, { frame: 0, timestamp: 0, data: { seed: 0 } });
			}
		}, 0);
	}

	// StorageReadKeyはregionKeyしか見ない + StorageValueは一つしか持たない簡易実装なので注意
	putStorageData(key: pl.StorageKey, value: pl.StorageValue, _options: any, callback: (err: Error | null) => void): void {
		this.logs.push("putStorageData");
		if (key.regionKey === MockAMFlow.REGIONKEY_CALLS_CALLBACK_OF_STORAGEDATA) {
			if (key.region === MockAMFlow.INVALID_REGION_VALUE_OF_STORAGEDATA) {
				callback(new Error("putStorageData-error"));
			} else {
				callback(null);
			}
		} else {
			const wrap = (err?: any): void => {
				this.requestsPutStorageData = this.requestsPutStorageData.filter((r: any) => {
					return r !== wrap;
				});
				this.storage[key.regionKey] = value;
				callback(err);
			};
			this.requestsPutStorageData.push(wrap);
		}
	}
	getStorageData(keys: pl.StorageReadKey[], callback: (error: Error | null, values?: pl.StorageData[]) => void): void {
		this.logs.push("getStorageData");
		if (keys[0].regionKey === MockAMFlow.REGIONKEY_CALLS_CALLBACK_OF_STORAGEDATA) {
			if (keys[0].region === MockAMFlow.INVALID_REGION_VALUE_OF_STORAGEDATA) {
				callback(new Error("getStorageData-error"));
			} else {
				const data: pl.StorageData[] = [{
					readKey: {
						region: 0,
						regionKey: "callback"
					},
					values: [{
						data: 1
					}]
				}];
				callback(null, data);
			}
		} else {
			const wrap = (err?: any): void => {
				this.requestsGetStorageData = this.requestsGetStorageData.filter((r: any) => {
					return r !== wrap;
				});
				const data = keys.map((k: pl.StorageReadKey) => {
					return { readKey: k, values: [this.storage[k.regionKey]] };
				});
				callback(err, data);
			};
			this.requestsGetStorageData.push(wrap);
		}
	}
}
