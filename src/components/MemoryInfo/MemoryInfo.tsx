import React from 'react';
import { AreaChart, CartesianGrid, XAxis, YAxis, Area, BarChart, Bar } from 'recharts';
import { toHumanReadableNumber } from '../../utils/toHumanReadableNumber';
import { LabeledStat } from '../LabeledStat/LabeledStat';

export interface MemoryInfoProps {
    totalCapacity: number,
    history: any[],
    nonCacheOrBuffer: number,
    buffers: number,
    cached: number,
    swapCapacity?: number,
    swapUsed?: number
}

export const MemoryInfo: React.FC<MemoryInfoProps> = (props) => {
    const {
        totalCapacity,
        history,
        nonCacheOrBuffer,
        buffers,
        cached,
        swapCapacity,
        swapUsed
    } = props;

    const graphData = [...(history.length < 60 ? new Array(60 - history.length).fill(0) : []), ...history];

    return (
        <>
            <div className="resource-title">
                <h1>Memory</h1>
                <h2>{(toHumanReadableNumber(totalCapacity * 1024, 'B', 1024, num => num.toPrecision(2)))}</h2>
            </div>
            <h6>Memory usage</h6>
            <AreaChart compact margin={{ top: 2, left: 2, right: 2, bottom: 2 }} width={600} height={200} data={graphData}>
                <CartesianGrid fill="#ffffff" stroke="#9220b3" />
                <XAxis hide tick={false} />
                <YAxis hide tick={false} domain={[0, totalCapacity]} />
                <Area type="monotone" stackId="a"
                    dataKey="value.ramNonCacheOrBuffer"
                    fill="#f4f2f4"
                    stroke="#9220b3"
                    isAnimationActive={false}
                    dot={false}
                />
                <Area type="monotone" stackId="a"
                    dataKey="value.ramBuffers"
                    fill="#eee6f1"
                    stroke="#9220b3"
                    isAnimationActive={false}
                    dot={false}
                />
                <Area type="monotone" stackId="a"
                    dataKey="value.ramCached"
                    fill="#ffffff"
                    stroke="#9220b3"
                    isAnimationActive={false}
                    dot={false}
                />
            </AreaChart>

            <h6>Current memory composition</h6>
            <BarChart layout="vertical" width={600} height={75} margin={{ top: 0, bottom: 0, right: 0, left: 0 }} data={[{
                nonCacheOrBuffer,
                buffers,
                cached,
                free: totalCapacity - cached - buffers - nonCacheOrBuffer
            }]}>
                <Bar dataKey="nonCacheOrBuffer" fill="#f4f2f4" stroke="#9220b3" stackId="a" />
                <Bar dataKey="buffers" fill="#eee6f1" stroke="#9220b3" stackId="a" />
                <Bar dataKey="cached" fill="#ffffff" stroke="#9220b3" stackId="a" />
                <Bar dataKey="free" fill="#ffffff" stroke="#9220b3" stackId="a" />
                <XAxis hide type="number" domain={[0, totalCapacity]} />
                <YAxis hide type="category" dataKey="name" />
            </BarChart>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {
                    swapCapacity !== undefined
                        ? <LabeledStat label="Swap capacity" value={toHumanReadableNumber(swapCapacity * 1024, 'B', 1024, num => num.toPrecision(2))} />
                        : undefined
                }

                {
                    swapUsed !== undefined
                        ? <LabeledStat label="Swap usage" value={toHumanReadableNumber(swapUsed * 1024, 'B', 1024)} />
                        : undefined
                }

                <LabeledStat label="In use" value={toHumanReadableNumber(nonCacheOrBuffer * 1024, 'B', 1024, num => num.toPrecision(2))} />
                <LabeledStat label="Cached" value={toHumanReadableNumber(cached * 1024, 'B', 1024, num => num.toPrecision(2))} />
                <LabeledStat label="Buffered" value={toHumanReadableNumber(buffers * 1024, 'B', 1024, num => num.toPrecision(2))} />
            </div>
        </>
    );
};
