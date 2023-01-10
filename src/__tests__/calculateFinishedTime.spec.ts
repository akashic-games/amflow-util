import * as pl from "@akashic/playlog";
import { calculateFinishedTime } from "../calculateFinishedTime";

describe("calculateFinishedTime", () => {
	const fps = 30;
	const startTime = 1671780000;
	const lastAge = 600;
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
	it("tickListにtimestampイベントが無い場合、フレーム数をミリ秒に変換した値を返す", () => {
		const tickList: pl.TickList = [
			0,
			lastAge,
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
		const expected = lastAge / fps * 1000;
		expect(calculateFinishedTime(tickList, fps, startTime)).toBe(expected);
	});
	it("tickListの最後のtimestampイベントのtimestampと残りフレーム数をミリ秒に変換した値を足した値を返す", () => {
		const tickList: pl.TickList = [
			0,
			lastAge,
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
		// timeStampEventのタイムスタンプとstartTimeの差分が115秒で、timeStampEventの後に残っているフレーム数が150枚(5秒)のため
		expect(calculateFinishedTime(tickList, fps, startTime)).toBe(120000);
	});
	it("tickListの最後のtimestampイベントの相対時刻と残りフレーム数をミリ秒に変換した値を足した値を返す", () => {
		const tickList: pl.TickList = [
			0,
			lastAge,
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
		expect(calculateFinishedTime(tickList, fps, startTime)).toBe(180000);
	});
});
