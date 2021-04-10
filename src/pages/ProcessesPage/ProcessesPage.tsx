import React, { useEffect, useLayoutEffect, useState } from 'react';
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

    //

    // useLayoutEffect(() => {
    //     const min = 50;

    //     // The max (fr) values for grid-template-columns
    //     const columnTypeToRatioMap = {
    //         numeric: 1,
    //         'text-short': 1.67,
    //         'text-long': 3.33
    //     };

    //     const table = document.querySelector('table')!;

    //     const columns: any[] = [];
    //     let headerBeingResized: any;

    //     // Where the magic happens. I.e. when they're actually resizing
    //     const onMouseMove = (e: any) => requestAnimationFrame(() => {
    //         // Calculate the desired width
    //         const horizontalScrollOffset = document.documentElement.scrollLeft;
    //         const width = horizontalScrollOffset + e.clientX - headerBeingResized.offsetLeft;

    //         // Update the column object with the new size value
    //         const column = columns.find(({ header }) => header === headerBeingResized);
    //         column.size = Math.max(min, width) + 'px'; // Enforce our minimum

    //         // For the other headers which don't have a set width, fix it to their computed width
    //         columns.forEach(column => {
    //             if (column.size.startsWith('minmax')) {// isn't fixed yet (it would be a pixel value otherwise)
    //                 column.size = parseInt(column.header.clientWidth, 10) + 'px';
    //             }
    //         });

    //         /* 
    //             Update the column sizes
    //             Reminder: grid-template-columns sets the width for all columns in one value
    //         */
    //         table!.style.gridTemplateColumns = columns
    //             .map(({ header, size }) => size)
    //             .join(' ');
    //     });

    //     // Clean up event listeners, classes, etc.
    //     const onMouseUp = () => {
    //         window.removeEventListener('mousemove', onMouseMove);
    //         window.removeEventListener('mouseup', onMouseUp);
    //         headerBeingResized.classList.remove(classes.headerBeingResized);
    //         headerBeingResized = null;
    //     };

    //     // Get ready, they're about to resize
    //     const initResize = (e: any) => {
    //         const { target } = e;

    //         headerBeingResized = target.parentNode;
    //         window.addEventListener('mousemove', onMouseMove);
    //         window.addEventListener('mouseup', onMouseUp);
    //         headerBeingResized.classList.add(classes.headerBeingResized);
    //     };

    //     // Let's populate that columns array and add listeners to the resize handles
    //     table.querySelectorAll('th').forEach(header => {
    //         const max = columnTypeToRatioMap[header.dataset.type as keyof typeof columnTypeToRatioMap] + 'fr';

    //         columns.push({
    //             header, size: `minmax(${min}px, ${max})`
    //         });

    //         header.querySelector('.' + classes.resizeHandle)!.addEventListener('mousedown', initResize);
    //     });

    // }, []);

    //

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