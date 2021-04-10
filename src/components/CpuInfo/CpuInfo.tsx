import React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { LabeledStat } from '../LabeledStat/LabeledStat';

export interface CpuInfoProps {
    name: string,
    usageHistory: any[],
    freq: number,
    uptime: number,
    processCount: number,
    threadCount: number,
    handleCount: number
}

export const CpuInfo: React.FC<CpuInfoProps> = (props) => {
    const {
        name,
        usageHistory,
        freq,
        uptime,
        processCount,
        threadCount,
        handleCount
    } = props;

    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor(uptime % (3600 * 24) / 3600);
    const minutes = Math.floor(uptime % 3600 / 60);
    const secs = Math.floor(uptime % 60);

    const graphData = [...(usageHistory.length < 60 ? new Array(60 - usageHistory.length).fill(0) : []), ...usageHistory];

    return (
        <>
            <div className="resource-title">
                <h1>CPU</h1>
                <h2>{name}</h2>
            </div>

            <AreaChart width={600} height={200} data={graphData}>
                <Area type="monotone"
                    dataKey="value"
                    stroke="#91caf7"
                    fill="#f1f6fa"
                    isAnimationActive={false}
                    dot={false}
                />
                <CartesianGrid stroke="#91caf7" />
                <XAxis hide tick={false} />
                <YAxis hide tickCount={3} domain={[0, 100]} />
            </AreaChart>

            <div className="cpu-details">
                <div style={{ gridArea: "usage" }}>
                    <LabeledStat label="Usage" value={usageHistory.map(entry => entry.value).reduce((prev, next) => next > prev ? next : prev, 0).toLocaleString()} append="%" />
                </div>
                <div style={{ gridArea: "frequency" }}>
                    <LabeledStat label="Usage" value={freq.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })} append=" GHz" />
                </div>
                <div style={{ gridArea: "processes" }}>
                    <LabeledStat label="Processes" value={processCount} />
                </div>
                <div style={{ gridArea: "threads" }}>
                    <LabeledStat label="Threads" value={threadCount} />
                </div>
                <div style={{ gridArea: "handles" }}>
                    <LabeledStat label="Handles" value={handleCount} />
                </div>
                <div style={{ gridArea: "uptime" }}>
                    <LabeledStat label="Uptime"
                        value={`${days}:${hours > 9 ? hours : '0' + hours}:${minutes > 9 ? minutes : '0' + minutes}:${secs > 9 ? secs : '0' + secs}`}
                    />
                </div>
                <div style={{ gridArea: "other" }}>
                    <LabeledStat label="Base frequency" value={'?'} />
                    <LabeledStat label="Sockets" value={'?'} />
                    <LabeledStat label="Physical cores" value={'?'} />
                    <LabeledStat label="Logical cores" value={'?'} />
                    <LabeledStat label="Virtualization" value={'?'} />
                    <LabeledStat label="L1 cache" value={'?'} />
                    <LabeledStat label="L2 cache" value={'?'} />
                    <LabeledStat label="L3 cache" value={'?'} />
                </div>
            </div>
        </>
    )
};