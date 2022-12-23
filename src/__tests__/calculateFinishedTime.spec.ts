import * as amf from "@akashic/amflow";
import * as pl from "@akashic/playlog";
import { calculateFinishedTime } from "../calculateFinishedTime";

describe("calculateFinishedTime", () => {
	const fps = 30;
	const replayStartTime = 1671780000;
	const replayLastAge = 600;
	const messageEvent: pl.MessageEvent = [
		pl.EventCode.Message,
		0,
		"test",
		"hogehoge"
	];
	const timeStampEvent: pl.TimestampEvent = [
		pl.EventCode.Timestamp,
		0,
		"test",
		1671895000
	];
	const relativeTimeStampEvent: pl.TimestampEvent = [
		pl.EventCode.Timestamp,
		0,
		"test",
		177000
	];
	const startPoints: amf.StartPoint[] = [
		{
			"frame": 0,
			"timestamp": replayStartTime,
			"data": {
				"fps": 30
			}
		}
	];
	it("tickListにtimestampイベントが無い場合、フレーム数をミリ秒に変換した値を返す", () => {
		const tickList: pl.TickList = [
			0,
			replayLastAge,
			[
				[
					0,
					[ messageEvent ],
					[]
				],
				[
					200,
					[ messageEvent ],
					[]
				],
			]
		];
		const expected = replayLastAge / fps * 1000;
		expect(calculateFinishedTime({ startPoints, tickList })).toBe(expected);
	});
	it("tickListの最後のtimestampイベントのtimestampと残りフレーム数をミリ秒に変換した値を足した値を返す", () => {
		const tickList: pl.TickList = [
			0,
			replayLastAge,
			[
				[
					0,
					[ messageEvent ],
					[]
				],
				[
					450,
					[ timeStampEvent ],
					[]
				],
			]
		];
		// timeStampEventのタイムスタンプとreplayStartTimeの差分が115秒で、timeStampEventの後に残っているフレーム数が150枚(5秒)のため
		expect(calculateFinishedTime({ startPoints, tickList })).toBe(120000);
	});
	it("tickListの最後のtimestampイベントの相対時刻と残りフレーム数をミリ秒に変換した値を足した値を返す", () => {
		const tickList: pl.TickList = [
			0,
			replayLastAge,
			[
				[
					0,
					[ messageEvent ],
					[]
				],
				[
					450,
					[ timeStampEvent ],
					[]
				],
				[
					510,
					[ relativeTimeStampEvent ],
					[]
				]
			]
		];
		// relativeTimeStampEventの相対時刻が177秒で、relativeTimeStampEventの後に残っているフレーム数が90枚(3秒)のため
		expect(calculateFinishedTime({ startPoints, tickList })).toBe(180000);
	});
});
