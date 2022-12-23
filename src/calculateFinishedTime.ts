import { DumpedPlaylog } from "./DumpedPlaylog";

// 指定のplaylogのゲーム終了までの時間を算出する
export function calculateFinishedTime(playlog: DumpedPlaylog): number {
	const fps = playlog.startPoints[0].data.fps;
	const replayStartTime = playlog.startPoints[0].timestamp;
	const replayLastAge = playlog.tickList[1];
	const ticksWithEvents = playlog.tickList[2] ?? [];
	let replayLastTime = null;
	loop: for (let i = ticksWithEvents.length - 1; i >= 0; --i) {
		const tick = ticksWithEvents[i];
		const pevs = tick[1] || [];
		for (let j = 0; j < pevs.length; ++j) {
			if (pevs[j][0] === 2) { // TimestampEvent
				const timestamp = pevs[j][3]; // Timestamp
				// Timestamp の時刻がゲームの開始時刻より小さかった場合は相対時刻とみなす
				replayLastTime =
					(timestamp < replayStartTime ? timestamp + replayStartTime : timestamp) + (replayLastAge - tick[0]) * 1000 / fps;
				break loop;
			}
		}
	}
	return (replayLastTime == null) ? (replayLastAge * 1000 / fps) : (replayLastTime - replayStartTime);
}
