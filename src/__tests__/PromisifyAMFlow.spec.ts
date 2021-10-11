import * as pl from "@akashic/playlog";
import { PromisifiedAMFlowProxy } from "../../lib/PromisifiedAMFlowProxy";
import { MockAmflow} from "./helpers/src/MockAMFlow";

describe("PromisifyAMFlow", () => {
	it("promisifyAMFlow", () => {
		const promisifiedAMFlow = new PromisifiedAMFlowProxy(new MockAmflow());

		expect(promisifiedAMFlow.open).toBeDefined();
		expect(promisifiedAMFlow.close).toBeDefined();
		expect(promisifiedAMFlow.authenticate).toBeDefined();
		expect(promisifiedAMFlow.onTick).toBeDefined();
		expect(promisifiedAMFlow.offTick).toBeDefined();
		expect(promisifiedAMFlow.onEvent).toBeDefined();
		expect(promisifiedAMFlow.offEvent).toBeDefined();
		expect(promisifiedAMFlow.getTickList).toBeDefined();
		expect(promisifiedAMFlow.putStartPoint).toBeDefined();
		expect(promisifiedAMFlow.getStartPoint).toBeDefined();
		expect(promisifiedAMFlow.putStorageData).toBeDefined();
		expect(promisifiedAMFlow.getStartPoint).toBeDefined();
		expect(promisifiedAMFlow.sendTick).toBeDefined();
		expect(promisifiedAMFlow.sendEvent).toBeDefined();
	});

	it("Function open ", async () => {
		const promisifiedAMFlow = new PromisifiedAMFlowProxy((new MockAmflow()));
		let cnt = 0;
		const calledFunc = (): void => void cnt++;

		await promisifiedAMFlow.open("0")
			.then(() => calledFunc());
		expect(cnt).toBe(1);

		let errMsg = "";
		await promisifiedAMFlow.open("testId") // 引数が数値にパースできなければモックでエラーとしている
			.then(() => calledFunc())
			.catch ((e) => errMsg = e.message);
		expect(cnt).toBe(1);
		expect(errMsg).toBe("open-error");
	});

	it("Function close ", async () => {
		const promisifiedAMFlow = new PromisifiedAMFlowProxy((new MockAmflow()));
		let cnt = 0;
		const calledFunc = (): void => void cnt++;

		let errMsg = "";
		await promisifiedAMFlow.close()
			.then(() => calledFunc())
			.catch((e) => errMsg = e.message);
		expect(cnt).toBe(1);
		expect(errMsg).toBe("");
	});

	it("Function authenticate ", async () => {
		const promisifiedAMFlow = new PromisifiedAMFlowProxy((new MockAmflow()));
		let permission;

		await promisifiedAMFlow.authenticate("0")
			.then((perm) => permission = perm);

		expect(permission).toEqual({
			writeTick: true,
			readTick: true,
			subscribeTick: true,
			sendEvent: true,
			subscribeEvent: true,
			maxEventPriority: 0
		});

		let errMsg = "";
		await promisifiedAMFlow.authenticate("token") // 引数が数値にパースできなければモックでエラーとしている
			.catch((e) => errMsg = e.message);
		expect(errMsg).toBe("authenticate-error");
	});

	it("Function sendTick ", () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = new PromisifiedAMFlowProxy((mockAmflow));

		const tick: pl.Tick = [1, [[32, 0, "foo", {}]]];
		promisifiedAMFlow.sendTick(tick);
		expect(mockAmflow.logs.length).toBe(1);
		expect(mockAmflow.logs[0]).toBe(JSON.stringify(tick));
	});

	it("Function onTick and offTick ", () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = new PromisifiedAMFlowProxy((mockAmflow));

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const tickHandler = (_tick: pl.Tick): void => {};
		promisifiedAMFlow.onTick(tickHandler);
		expect(mockAmflow.tickHandlers.length).toBe(1);
		expect(mockAmflow.tickHandlers[0]).toBe(tickHandler);

		promisifiedAMFlow.offTick(tickHandler);
		expect(mockAmflow.tickHandlers.length).toBe(0);
	});

	it("Function sendEvent", () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = new PromisifiedAMFlowProxy((mockAmflow));

		const event: pl.Event = [32, 0, "zoo", { some: "data" }];
		promisifiedAMFlow.sendEvent(event);
		expect(mockAmflow.logs.length).toBe(1);
		expect(mockAmflow.logs[0]).toBe(JSON.stringify(event));
	});

	it("Function onEvent and offEvent ", () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = new PromisifiedAMFlowProxy((mockAmflow));

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const eventHandler = (_event: pl.Event): void => {};
		promisifiedAMFlow.onEvent(eventHandler);
		expect(mockAmflow.eventHandlers.length).toBe(1);
		expect(mockAmflow.eventHandlers[0]).toBe(eventHandler);

		promisifiedAMFlow.offEvent(eventHandler);
		expect(mockAmflow.eventHandlers.length).toBe(0);
	});

	it("Function getTickList ", async () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = new PromisifiedAMFlowProxy((mockAmflow));

		let result;
		const opts = {begin: 100, end: 110};
		await promisifiedAMFlow.getTickList(opts)
			.then((tick) => result = tick);

		expect(result).toEqual([100, 110, []]);
		expect(mockAmflow.logs[0]).toBe(`${opts.begin},${opts.end}`);

		let errMsg = "";
		await promisifiedAMFlow.getTickList({begin: 200, end: 250}) // 引数 begin が200以上ならモックでエラーとしている
			.catch((e) => errMsg = e.message);
		expect(errMsg).toBe("getTickList-error");
	});

	it("Function getTickList (deprecated)", async () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = new PromisifiedAMFlowProxy((mockAmflow));

		let result;
		await promisifiedAMFlow.getTickList(100, 110)
			.then((tick) => result = tick);
		expect(result).toEqual([100, 110, []]);
		expect(mockAmflow.logs[0]).toBe("100,110");

		let errMsg = "";
		await promisifiedAMFlow.getTickList(211, 215) // 引数 begin が200以上ならモックでエラーとしている
			.catch((e) => errMsg = e.message);
		expect(errMsg).toBe("getTickList-error");
	});

	it("Function putStartPoint ", async () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = new PromisifiedAMFlowProxy((mockAmflow));
		let cnt = 0;
		const calledFunc = (): void => void cnt++;

		const startPoint = { frame: 0, data: { foo: false }, timestamp: 100 };
		await promisifiedAMFlow.putStartPoint(startPoint)
			.then(() => calledFunc());
		expect(cnt).toBe(1);
		expect(mockAmflow.logs[0]).toBe(JSON.stringify(startPoint));

		let errMsg = "";
		await promisifiedAMFlow.putStartPoint({ frame: 1, data: { foo: false }, timestamp: 100 }) // frame が 0 以外ならモックでエラーとしている
			.then(() => calledFunc())
			.catch((e) => errMsg = e.message);
		expect(cnt).toBe(1);
		expect(errMsg).toBe("putStartPoint-error");
	});

	it("Function getStartPoint ", async () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = new PromisifiedAMFlowProxy((mockAmflow));

		let result;
		await promisifiedAMFlow.getStartPoint({frame: 0})
			.then((startPoint) => result = startPoint);

		expect(mockAmflow.logs[0]).toBe("getStartPoint");
		expect(result).toEqual({ frame: 0, timestamp: 0, data: { seed: 0 } });

		let errMsg = "";
		await promisifiedAMFlow.getStartPoint({ frame: 100 }) // frame が 100 以上ならモックでエラーとしている
			.catch((e) => errMsg = e.message);
		expect(errMsg).toBe("getStartPoint-error");
	});

	it("Function putStorageData ", async () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = new PromisifiedAMFlowProxy((mockAmflow));
		let cnt = 0;
		// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
		const calledFunc = () => cnt++;

		const key = { region: 0, regionKey: "callback"};
		const value =  { data: "value"};
		await promisifiedAMFlow.putStorageData(key, value, {})
			.then(() => calledFunc());
		expect(cnt).toBe(1);
		expect(mockAmflow.logs[0]).toBe("putStorageData");

		let errMsg = "";
		key.region = 1; // region が 0 以外ならモックでエラーとしている
		await promisifiedAMFlow.putStorageData(key, value, {})
			.then(() => calledFunc())
			.catch((e) => errMsg = e.message);
		expect(cnt).toBe(1);
		expect(errMsg).toBe("putStorageData-error");
	});

	it("Function getStorageData ", async () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = new PromisifiedAMFlowProxy((mockAmflow));

		let result;
		const key = { region: 0, regionKey: "callback" };
		await promisifiedAMFlow.getStorageData( [key])
			.then((value: pl.StorageData[] | undefined) => result = value);

		expect(mockAmflow.logs[0]).toBe("getStorageData");
		expect(result).toEqual([{ readKey: { region: 0, regionKey: "callback"}, values: [{data: 1}]}]);

		let errMsg = "";
		key.region = 1; // region が 0 以外ならモックでエラーとしている
		await promisifiedAMFlow.getStorageData([key])
			.catch((e) => errMsg = e.message);
		expect(errMsg).toBe("getStorageData-error");
	});
});
