import type { GetStartPointOptions, GetTickListOptions, Permission, StartPoint } from "@akashic/amflow";
import type * as playlog from "@akashic/playlog";

/**
 * AMFlow の非同期関数を Promise でラップした interface
 */
export interface PromisifiedAMFlow {
	// 非同期関数
	open(playId: string): Promise<void>;
	close(): Promise<void>;
	authenticate(token: string): Promise<Permission | undefined>;
	getTickList(begin: number, end: number): Promise<playlog.TickList | undefined>;
	getTickList(opts: GetTickListOptions): Promise<playlog.TickList | undefined>;
	putStartPoint(startPoint: StartPoint): Promise<void>;
	getStartPoint(opts: GetStartPointOptions): Promise<StartPoint | undefined>;
	putStorageData(key: playlog.StorageKey, value: playlog.StorageValue, options: any): Promise<void>;
	getStorageData(keys: playlog.StorageReadKey[]): Promise<playlog.StorageData[] | undefined>;
	// 同期関数
	onTick(handler: (tick: playlog.Tick) => void): void;
	offTick(handler: (tick: playlog.Tick) => void): void;
	onEvent(handler: (event: playlog.Event) => void): void;
	offEvent(handler: (event: playlog.Event) => void): void;
	sendTick(tick: playlog.Tick): void;
	sendEvent(event: playlog.Event): void;
}
