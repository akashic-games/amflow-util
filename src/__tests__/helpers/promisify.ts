import type { GetTickListOptions, GetStartPointOptions, Permission, StartPoint, AMFlow } from "@akashic/amflow";
import type { TickList, StorageKey, StorageValue, StorageData, StorageReadKey, Tick, Event } from "@akashic/playlog";
import type { PromisifiedAMFlow } from "../../PromisifiedAMFlow";

export function promisify<T extends AMFlow>(amflow: T): PromisifiedAMFlow {
	return {
		open(playId: string): Promise<void> {
			return new Promise((resolve, reject) => {
				amflow.open(playId, (err?: any) => (err ? reject(err) : resolve()));
			});
		},

		close(): Promise<void> {
			return new Promise((resolve, reject) => {
				amflow.close((err?: any) => (err ? reject(err) : resolve()));
			});
		},

		authenticate(token: string): Promise<Permission | undefined> {
			return new Promise((resolve, reject) => {
				amflow.authenticate(token, (err?: any, perm?: Permission) =>
					err ? reject(err) : resolve(perm)
				);
			});
		},

		getTickList(beginOrOpts: number | GetTickListOptions, end?: number): Promise<TickList | undefined> {
			return new Promise((resolve, reject) => {
				if (typeof beginOrOpts === "number") {
					amflow.getTickList(beginOrOpts, end as number, (err?: unknown, ticks?: TickList) => {
						if (err) {
							reject(err);
						} else {
							resolve(ticks);
						}
					});
				} else {
					amflow.getTickList(beginOrOpts, (err?: unknown, ticks?: TickList) =>
						err ? reject(err) : resolve(ticks)
					);
				}
			});
		},

		putStartPoint(startPoint: StartPoint): Promise<void> {
			return new Promise((resolve, reject) => {
				amflow.putStartPoint(startPoint, (err?: any) => (err ? reject(err) : resolve()));
			});
		},

		getStartPoint(opts: GetStartPointOptions): Promise<StartPoint | undefined> {
			return new Promise((resolve, reject) => {
				amflow.getStartPoint(opts, (err?: any, sp?: StartPoint) =>
					err ? reject(err) : resolve(sp)
				);
			});
		},

		putStorageData(key: StorageKey, value: StorageValue, options: unknown): Promise<void> {
			return new Promise((resolve, reject) => {
				amflow.putStorageData(key, value, options, (err?: any) => (err ? reject(err) : resolve()));
			});
		},

		getStorageData(keys: StorageReadKey[]): Promise<StorageData[] | undefined> {
			return new Promise((resolve, reject) => {
				amflow.getStorageData(keys, (err?: any, data?: StorageData[]) =>
					err ? reject(err) : resolve(data)
				);
			});
		},

		onTick(handler: (tick: Tick) => void): void {
			amflow.onTick(handler);
		},

		offTick(handler: (tick: Tick) => void): void {
			amflow.offTick(handler);
		},

		onEvent(handler: (event: Event) => void): void {
			amflow.onEvent(handler);
		},

		offEvent(handler: (event: Event) => void): void {
			amflow.offEvent(handler);
		},

		sendTick(tick: Tick): void {
			amflow.sendTick(tick);
		},

		sendEvent(event: Event): void {
			amflow.sendEvent(event);
		},
	};
}
