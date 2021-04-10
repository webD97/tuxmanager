import React from 'react';
import { toHumanReadableNumber } from '../../utils/toHumanReadableNumber';

export interface DiskInfoProps {
    name: string,
    capacity: number,
    partitions: Record<string, any>
}

export const DiskInfo: React.FC<DiskInfoProps> = (props) => {
    const {
        name,
        capacity,
        partitions
    } = props;

    const data = Object.entries(partitions).map(([name, { capacity }]) => ({ name, capacity }));

    return (
        <>
            <div className="resource-title">
                <h1>{name}</h1>
                <h2>{toHumanReadableNumber(capacity, 1000, num => num.toFixed(0))}</h2>
            </div>

            <pre>{JSON.stringify(data, undefined, 2)}</pre>

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
                                <td>{toHumanReadableNumber(capacity, 1000, num => num.toFixed(0))}</td>
                                <td></td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </>
    );
};


