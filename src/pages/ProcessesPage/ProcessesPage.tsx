import React, { useEffect, useState } from 'react';
import { PageProps } from '../PageProps';

export const ProcessesPage: React.FC<PageProps> = props => {
    const { updateInterval } = props;

    const [processes, setProcesses] = useState<Record<string, any>[]>([]);

    useEffect(() => {
        const handle = window.setInterval(() => {
            setProcesses(window.api.listProcesses().sort((prev: any, next: any) => {
                if (prev.pid < next.pid) return -1;
                if (prev.pid > next.pid) return 1;
                return 0;
            }));
        }, updateInterval);

        return () => window.clearInterval(handle);
    }, [updateInterval]);

    return (
        <table>
            <thead>
                <tr>
                    <th data-type="numeric">pid </th>
                    <th data-type="numeric">uid</th>
                    <th data-type="text-short">executable</th>
                    <th data-type="numeric">State</th>
                    <th data-type="text-long">cmdline</th>
                </tr>
            </thead>
            <tbody>
                {
                    processes.map(({ pid, cmdline, uid, executable, state }) => (
                        <tr key={pid}>
                            <td>{pid}</td>
                            <td>{uid}</td>
                            <td>{executable}</td>
                            <td>{state}</td>
                            <td>{cmdline}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
};