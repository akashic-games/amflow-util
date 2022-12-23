import * as amf from "@akashic/amflow";
import * as pl from "@akashic/playlog";

export interface DumpedPlaylog {
	tickList: pl.TickList;
	startPoints: amf.StartPoint[];
}
