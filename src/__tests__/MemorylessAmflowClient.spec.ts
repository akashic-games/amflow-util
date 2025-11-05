import type * as amf from "@akashic/amflow";
import * as pl from "@akashic/playlog";
import { MemorylessAmflowClient } from "../MemorylessAmflowClient";
import { promisify } from "./helpers/promisify";
import { EventPriority } from "./helpers/src/MockAMFlow";

describe("MemorylessAmflowClient", () => {
	it("can be instantiated", () => {
		const self = new MemorylessAmflowClient({ playId: "test-play-id" });
		expect(self._playId).toBe("test-play-id");
	});

	it("open/close", async () => {
		const self = new MemorylessAmflowClient({ playId: "test-play-id" });
		const promisified = promisify(self);

		await expect(promisified.open("test-play-id")).resolves.toBeUndefined();
		await expect(promisified.open("invalid-play-id")).rejects.toThrow();
		await expect(promisified.close()).resolves.toBeUndefined();
	});

	it("authenticate", async () => {
		const self = promisify(new MemorylessAmflowClient({ playId: "test-play-id" }));
		const permission = await self.authenticate("dummy-token");
		expect(permission).toEqual({
			writeTick: true,
			readTick: true,
			subscribeTick: false,
			sendEvent: false,
			subscribeEvent: true,
			maxEventPriority: 2,
		});
	});

	it("onTick/offTick/sendTick", () => {
		const joinEvent = [pl.EventCode.Join, EventPriority.System, "dummy-player-id", "dummy-name"] satisfies pl.JoinEvent;
		const joinEvent2 = [pl.EventCode.Join, EventPriority.System, "dummyPlayerId2", "dummy-name2"]satisfies pl.JoinEvent;
		const self = new MemorylessAmflowClient({ playId: "test-play-id" });
		const handleTick = jest.fn();

		self.onTick(handleTick);
		self.sendTick([5, [joinEvent]]);
		self.sendTick([10, [joinEvent2]]);
		expect(handleTick).toHaveBeenCalledTimes(2);
		expect(handleTick).toHaveBeenNthCalledWith(1, [5, [joinEvent]]);
		expect(handleTick).toHaveBeenNthCalledWith(2, [10, [joinEvent2]]);

		self.offTick(handleTick);
		self.sendTick([5, [joinEvent]]);
		self.sendTick([10, [joinEvent2]]);
		expect(handleTick).toHaveBeenCalledTimes(2);
	});

	it("onEvent/offEvent/sendEvent", () => {
		const joinEvent = [pl.EventCode.Join, EventPriority.System, "dummy-player-id", "dummy-name"] satisfies pl.JoinEvent;
		const joinEvent2 = [pl.EventCode.Join, EventPriority.System, "dummyPlayerId2", "dummy-name2"]satisfies pl.JoinEvent;
		const self = new MemorylessAmflowClient({ playId: "test-play-id" });
		const handleEvent = jest.fn();

		self.onEvent(handleEvent);
		self.sendEvent(joinEvent);
		self.sendEvent(joinEvent2);
		expect(handleEvent).toHaveBeenCalledTimes(2);
		expect(handleEvent).toHaveBeenNthCalledWith(1, joinEvent);
		expect(handleEvent).toHaveBeenNthCalledWith(2, joinEvent2);

		self.offEvent(handleEvent);
		self.sendEvent(joinEvent);
		self.sendEvent(joinEvent2);
		expect(handleEvent).toHaveBeenCalledTimes(2);
	});

	it("putStartPoint/getStartPoint", async () => {
		const self = new MemorylessAmflowClient({ playId: "test-play-id" });
		const promisified = promisify(self);

		await expect(promisified.getStartPoint({ frame: 0 })).rejects.toThrow();

		const zerothStartPoint = { frame: 0, timestamp: 0, data: { seed: 14 } } satisfies amf.StartPoint;
		await promisified.putStartPoint(zerothStartPoint);
		expect(self._zerothStartPoint).toEqual(zerothStartPoint);
		expect(await promisified.getStartPoint({ frame: 10 })).toEqual(zerothStartPoint);
		expect(await promisified.getStartPoint({})).toEqual(zerothStartPoint);

		const zerothStartPoint2 = { frame: 0, timestamp: 0, data: { seed: 128 } } satisfies amf.StartPoint;
		await promisified.putStartPoint(zerothStartPoint2);
		expect(self._zerothStartPoint).toEqual(zerothStartPoint2);
		expect(await promisified.getStartPoint({ frame: 10 })).toEqual(zerothStartPoint2);
		expect(await promisified.getStartPoint({})).toEqual(zerothStartPoint2);
	});

	it("throws when calling unsupported methods", async () => {
		const self = new MemorylessAmflowClient({ playId: "test-play-id" });
		const promisified = promisify(self);

		await expect(promisified.getTickList(0, 1)).rejects.toThrow();
		await expect(promisified.getTickList({ begin: 0, end: 1 })).rejects.toThrow();
		await expect(promisified.putStorageData({ region: 0, regionKey: "key" }, { data: "foo" }, {})).rejects.toThrow();
		await expect(promisified.getStorageData([{ region: 0, regionKey: "key"}])).rejects.toThrow();
	});
});
