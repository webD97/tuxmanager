import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { toHumanReadableNumber } from '../../utils/toHumanReadableNumber';
import { LabeledStat } from '../LabeledStat/LabeledStat';

export interface InterfaceInfoProps {
    name: string,
    mtu: number,
    address: string,
    state: string,
    history: any[]
}

export const InterfaceInfo: React.FC<InterfaceInfoProps> = (props) => {
    const {
        name,
        history,
        state,
        address,
        mtu
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
            </div>

            <h6>Usage</h6>
            <AreaChart margin={{ top: 2, left: 2, right: 2, bottom: 2 }} width={600} height={200} data={graphData}>
                <CartesianGrid fill="#ffffff" stroke="#6b6041" />
                <XAxis hide tick={false} />
                <YAxis
                    tickFormatter={(value) => toHumanReadableNumber(parseFloat(value), 'bit/s', undefined, num => num.toLocaleString(undefined, { maximumFractionDigits: 1 }))}
                />
                <Area type="monotone"
                    dataKey="bitsRead"
                    fill="#fff3ea"
                    stroke="#6b6041"
                    isAnimationActive={false}
                    dot={false}
                />
                <Area type="monotone"
                    dataKey="bitsWritten"
                    fill="transparent"
                    stroke="#6b6041"
                    strokeDasharray="3 3"
                    isAnimationActive={false}
                    dot={false}
                />
            </AreaChart>

            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <LabeledStat
                    label="Current download"
                    value={toHumanReadableNumber(
                        history[history.length - 1].bitsRead.toString(),
                        'bit/s',
                        1000,
                        num => num.toLocaleString(undefined, { maximumSignificantDigits: 2 })
                    )}
                />

                <LabeledStat
                    label="Current upload"
                    value={toHumanReadableNumber(
                        history[history.length - 1].bitsWritten.toString(),
                        'bit/s',
                        1000,
                        num => num.toLocaleString(undefined, { maximumSignificantDigits: 2 })
                    )}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <LabeledStat
                    label="State"
                    value={state.toString()}
                />

                <LabeledStat
                    label="MTU"
                    value={mtu.toString()}
                />

                <LabeledStat
                    label="MAC"
                    value={address.toString()}
                />
            </div>
        </>
    );
};


