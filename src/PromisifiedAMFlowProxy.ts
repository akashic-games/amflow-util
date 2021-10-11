import { AMFlow, GetStartPointOptions, GetTickListOptions, Permission, StartPoint } from "@akashic/amflow";
import * as playlog from "@akashic/playlog";
import { PromisifiedAMFlow } from "./PromisifiedAMFlow";

/**
 * 引数に渡された AMFlow 実装の非同期関数を Promise でラップしたクラス
 */
export class PromisifiedAMFlowProxy implements PromisifiedAMFlow {
	_amflow: AMFlow;

	constructor(amflow: AMFlow) {
		this._amflow = amflow;
	}

	open(playId: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this._amflow.open(playId, err => (err ? reject(err) : resolve()));
		});
	}

	close(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this._amflow.close(err => (err ? reject(err) : resolve()));
		});
	}

	authenticate(token: string): Promise<Permission | undefined> {
		return new Promise((resolve, reject) => {
			this._amflow.authenticate(token, (err, perm) => (err ? reject(err) : resolve(perm)));
		});
	}

	getTickList(
		optsOrBegin: number | GetTickListOptions,
		endOrUndefined?: number
	): Promise<playlog.TickList | undefined> {
		if (typeof optsOrBegin === "number") {
			// NOTE: optsOrBegin === "number" であれば必ず amflow@2 以前の引数だとみなしてキャストし、2 系の引数形で呼び出す
			const end = endOrUndefined as number;
			return new Promise((resolve, reject) => {
				this._amflow.getTickList(optsOrBegin, end, (err, tl?) => (err ? reject(err) : resolve(tl)));
			});
		} else {
			// NOTE: optsOrBegin !== "number" であれば必ず amflow@3 以降の引数だとみなす
			return new Promise((resolve, reject) => {
				this._amflow.getTickList(optsOrBegin, (err, tl?) => (err ? reject(err) : resolve(tl)));
			});
		}
	}


	putStartPoint(startPoint: StartPoint): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this._amflow.putStartPoint(startPoint, (err) => (err ? reject(err) : resolve()));
		});
	}

	getStartPoint(opts: GetStartPointOptions): Promise<StartPoint | undefined> {
		return new Promise((resolve, reject) => {
			this._amflow.getStartPoint(opts, (err, sp) => (err ? reject(err) : resolve(sp)));
		});
	}

	putStorageData(key: playlog.StorageKey, value: playlog.StorageValue, options: any): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this._amflow.putStorageData(key, value, options, (err) => (err ? reject(err) : resolve()));
		});
	}

	getStorageData(keys: playlog.StorageReadKey[]): Promise<playlog.StorageData[] | undefined> {
		return new Promise((resolve, reject) => {
			this._amflow.getStorageData(keys, (err, values?) =>
				(err ? reject(err) : resolve(values)));
		});
	}


	onTick(handler: (tick: playlog.Tick) => void): void {
		this._amflow.onTick(handler);
	}

	offTick(handler: (tick: playlog.Tick) => void): void {
		this._amflow.offTick(handler);
	}

	onEvent(handler: (event: playlog.Event) => void): void {
		this._amflow.onEvent(handler);
	}

	offEvent(handler: (event: playlog.Event) => void): void {
		this._amflow.offEvent(handler);
	}

	sendTick(tick: playlog.Tick): void {
		this._amflow.sendTick(tick);
	}

	sendEvent(event: playlog.Event): void {
		this._amflow.sendEvent(event);
	}
}
