import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { toHumanReadableNumber } from '../../utils/toHumanReadableNumber';
import { LabeledStat } from '../LabeledStat/LabeledStat';

export interface DiskInfoProps {
    name: string,
    capacity: number,
    partitions: Record<string, any>,
    history: {
        bytesWrittenPerSecond: number,
        bytesReadPerSecond: number,
    }[],
    removable: boolean
}

export const DiskInfo: React.FC<DiskInfoProps> = (props) => {
    const {
        name,
        capacity,
        partitions,
        history,
        removable
    } = props;

    const graphData = [
        ...(
            history.length < 60
                ? new Array(60 - history.length).fill({ bytesReadPerSecond: 0, bytesWrittenPerSecond: 0 })
                : []
        ),
        ...history
    ];

    return (
        <>
            <div className="resource-title">
                <h1>{name}</h1>
                <h2>{toHumanReadableNumber(capacity, 'B', 1000, num => num.toFixed(0))}</h2>
            </div>

            <h6>Active time</h6>
            <AreaChart margin={{ top: 2, left: 2, right: 2, bottom: 2 }} width={600} height={200} data={graphData}>
                <CartesianGrid fill="#ffffff" stroke="#62b029" />
                <XAxis hide tick={false} />
                <YAxis
                    domain={[0, 1000]}
                    tickFormatter={(value) => `${(parseFloat(value) / 10.0).toFixed(0)}%`}
                />
                <Area type="monotone"
                    dataKey="activeTime"
                    fill="#eff7e9"
                    stroke="#62b029"
                    isAnimationActive={false}
                    dot={false}
                />
            </AreaChart>

            <h6>Usage</h6>
            <AreaChart margin={{ top: 2, left: 2, right: 2, bottom: 2 }} width={600} height={100} data={graphData}>
                <CartesianGrid fill="#ffffff" stroke="#62b029" />
                <XAxis hide tick={false} />
                <YAxis
                    domain={[0, graphData.reduce((prev, next) => Math.max(next.bytesReadPerSecond, next.bytesWrittenPerSecond) > prev ? Math.max(next.bytesReadPerSecond, next.bytesWrittenPerSecond) : prev), 1e6]}
                    tickFormatter={(value) => toHumanReadableNumber(parseFloat(value), 'B/s', undefined, num => num.toLocaleString(undefined, { maximumFractionDigits: 1 }))}
                />
                <Area type="monotone"
                    dataKey="bytesReadPerSecond"
                    fill="#eff7e9"
                    stroke="#62b029"
                    isAnimationActive={false}
                    dot={false}
                />
                <Area type="monotone"
                    dataKey="bytesWrittenPerSecond"
                    fill="transparent"
                    stroke="#8dc663"
                    strokeDasharray="3 3"
                    isAnimationActive={false}
                    dot={false}
                />
            </AreaChart>

            <div style={{display: 'flex', justifyContent: 'space-around'}}>
                <LabeledStat
                    label="Read speed"
                    value={toHumanReadableNumber(graphData[graphData.length - 1].bytesReadPerSecond, 'B', undefined, num => num.toLocaleString(undefined, { maximumFractionDigits: 2 }))}
                    append="/s"
                />

                <LabeledStat
                    label="Write speed"
                    value={toHumanReadableNumber(graphData[graphData.length - 1].bytesWrittenPerSecond, 'B', undefined, num => num.toLocaleString(undefined, { maximumFractionDigits: 2 }))}
                    append="/s"
                />

                <LabeledStat
                    label="Active time"
                    value={graphData[graphData.length - 1].activeTime.toFixed(0)}
                    append="ms"
                />

                <LabeledStat
                    label="Removable"
                    value={removable.toString()}
                />
            </div>

            <h6>Partitions</h6>
            <table>
                <thead>
                    <tr>
                        <th>Partition</th>
                        <th>Capacity</th>
                        <th>Free %</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        Object.entries(partitions).map(([name, { capacity }]) => (
                            <tr key={name}>
                                <td>{name}</td>
                                <td>{toHumanReadableNumber(capacity, 'B', 1000, num => num.toFixed(0))}</td>
                                <td></td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </>
    );
};


