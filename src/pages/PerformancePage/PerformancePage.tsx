import React, { useEffect, useState } from 'react';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { CpuInfo } from '../../components/CpuInfo/CpuInfo';
import { DiskInfo } from '../../components/DiskInfo/DiskInfo';
import { InterfaceInfo } from '../../components/InterfaceInfo/InterfaceInfo';
import { MemoryInfo } from '../../components/MemoryInfo/MemoryInfo';
import { SideNavigationItem } from '../../components/SideNavigationItem/SideNavigationItem';
import { useTimeseries } from '../../hooks/useTimeseries';
import { toHumanReadableNumber } from '../../utils/toHumanReadableNumber';
import { PageProps } from '../PageProps';

export const PerformancePage: React.FC<PageProps> = (props) => {
    const [uptime, setUptime] = useState(0);
    const [cpuName, setCpuName] = useState('?');
    const [processCount, setProcessCount] = useState(0);
    const [threadCount, setThreadCount] = useState(0);
    const [handleCount, setHandleCount] = useState(0);

    const [cpuFreq, setCpuFreq] = useState(0);

    const [ramTotalCapacity, setRamTotalCapacity] = useState(0);
    const [ramNonCacheOrBuffer, setRamNonCacheOrBuffer] = useState(0);
    const [ramBuffers, setRamBuffers] = useState(0);
    const [ramCached, setRamCached] = useState(0);
    const [ramHistory, pushRamHistory] = useTimeseries(60);

    const [swapCapacity, setSwapCapacity] = useState(0);
    const [swapUsed, setSwapUsed] = useState(0);

    const [cpuHistory, pushCpuHistory] = useTimeseries(60);
    const [cpuUsageHistory, pushCpuUsage] = useTimeseries<number>(60);

    const [blockDeviceHistory, pushBlockDeviceHistory] = useTimeseries<Record<string, any>>(60);
    const [blockDevices, setBlockDevices] = useState<Record<string, any>>({});

    const [interfaces, setInterfaces] = useState<Record<string, any>>([]);
    const [interfaceHistory, pushInterfaceHistory] = useTimeseries<Record<string, any>>(60);

    useEffect(() => {
        const collectInfo = () => {
            const cpuInfo = window.api.getCPU();
            const seconds = window.api.getUptime();

            setProcessCount(window.api.getProcessCount());
            setThreadCount(window.api.getThreadCount());
            setHandleCount(window.api.getHandleCount().open);

            setUptime(seconds);
            setCpuName(cpuInfo[0]['model name']);
            setCpuFreq(cpuInfo.map((cpu: any) => parseFloat(cpu['cpu MHz']) / 1000.0).reduce((prev: number, next: number) => Math.max(prev, next), 0));

            pushCpuHistory(window.api.getUsageOfCPU()[0]);

            const ramInfo = window.api.getUsageOfRAM();

            const totalUsedMemory = ramInfo.MemTotal - ramInfo.MemFree;
            const cached = ramInfo.Cached + ramInfo.SReclaimable + ramInfo.Shmem;
            const ramNonCacheOrBuffer = totalUsedMemory - (ramInfo.Buffers + cached);

            setRamNonCacheOrBuffer(ramNonCacheOrBuffer);
            setRamBuffers(ramInfo.Buffers);
            setRamCached(cached);
            setRamTotalCapacity(ramInfo.MemTotal);

            setSwapCapacity(ramInfo.SwapTotal);
            setSwapUsed(ramInfo.SwapTotal - ramInfo.SwapFree);

            pushRamHistory({ ramNonCacheOrBuffer, ramCached: cached, ramBuffers: ramInfo.Buffers });

            const blkDevices = window.api.getBlockDevices();
            setBlockDevices(blkDevices);

            pushBlockDeviceHistory(blkDevices);

            const ifaces = window.api.getInterfaces();
            setInterfaces(ifaces);
            pushInterfaceHistory(ifaces);
        };

        collectInfo();

        const handle = window.setInterval(collectInfo, props.updateInterval);

        return () => window.clearInterval(handle);
    }, [props.updateInterval, pushBlockDeviceHistory, pushCpuHistory, pushInterfaceHistory, pushRamHistory]);

    useEffect(() => {
        if (cpuHistory.length >= 2) {
            const measurement1 = cpuHistory[cpuHistory.length - 1].value;
            const measurement2 = cpuHistory[cpuHistory.length - 2].value;


            const timeSpent = Object.values<number>(measurement2).reduce((prev, next) => prev + next, 0) - Object.values<number>(measurement1).reduce((prev, next) => prev + next, 0);
            const idleFraction = (measurement2.idle - measurement1.idle) / timeSpent;

            const usagePercent = ((1 - idleFraction) * 100);

            pushCpuUsage(usagePercent);
        }
    }, [cpuHistory, pushCpuUsage]);

    const cpuGraphData = [...(cpuUsageHistory.length < 60 ? new Array(60 - cpuUsageHistory.length).fill(0) : []), ...cpuUsageHistory];
    const ramGraphData = [...(ramHistory.length < 60 ? new Array(60 - ramHistory.length).fill(0) : []), ...ramHistory];

    const match = useRouteMatch();

    const diskTransferData: Record<string, any> = {};

    blockDeviceHistory.forEach((entry, index, blockDeviceHistory) => {
        Object.keys(entry.value).forEach(device => {
            const m1 = blockDeviceHistory[index];
            const m2 = blockDeviceHistory[index - 1];

            if (m1 === undefined || m2 === undefined) {
                return { bytesReadPerSecond: 0, bytesWrittenPerSecond: 0, activeTime: 0 }
            }

            const bytesWrittenPerSecond = ((m1.value[device].stat.write_sectors - m2.value[device].stat.write_sectors) * 512) / ((m1.timestamp - m2.timestamp) / 1000);
            const bytesReadPerSecond = ((m1.value[device].stat.read_sectors - m2.value[device].stat.read_sectors) * 512) / ((m1.timestamp - m2.timestamp) / 1000);
            const activeTime = (m1.value[device].stat.io_ticks - m2.value[device].stat.io_ticks) / ((m1.timestamp - m2.timestamp) / 1000);


            diskTransferData[device] = [...(Array.isArray(diskTransferData[device]) ? diskTransferData[device] : []), { bytesWrittenPerSecond, bytesReadPerSecond, activeTime }];
            diskTransferData[device] = [...(diskTransferData.length < 60 ? new Array(60 - diskTransferData.length).fill({ bytesReadPerSecond: 0, bytesWrittenPerSecond: 0, activeTime: 0 }) : []), ...diskTransferData[device]]
        });
    });

    const interfaceGraphData: Record<string, any> = {};

    interfaceHistory.forEach((entry, index, interfaceHistory) => {
        Object.keys(entry.value).forEach(device => {
            const m1 = interfaceHistory[index];
            const m2 = interfaceHistory[index - 1];

            if (m1 === undefined || m2 === undefined) {
                return { bitsWritten: 0, bitsRead: 0 }
            }

            const bitsWritten = (8 * (m1.value[device].txBytes - m2.value[device].txBytes)) / ((m1.timestamp - m2.timestamp) / 1000);
            const bitsRead = (8 * (m1.value[device].rxBytes - m2.value[device].rxBytes)) / ((m1.timestamp - m2.timestamp) / 1000);

            interfaceGraphData[device] = [...(Array.isArray(interfaceGraphData[device]) ? interfaceGraphData[device] : []), { bitsWritten, bitsRead }];
            interfaceGraphData[device] = [...(interfaceGraphData.length < 60 ? new Array(60 - interfaceGraphData.length).fill({ bitsWritten: 0, bitsRead: 0 }) : []), ...interfaceGraphData[device]]
        });
    });

    return (
        <>
            <section>
                <Link to={`${match.url}/cpu`} style={{ textDecoration: 'none' }}>
                    <SideNavigationItem
                        visual={
                            <AreaChart compact margin={{ top: 2, left: 2, right: 2, bottom: 2 }} width={90} height={48} data={cpuGraphData}>
                                <CartesianGrid fill="#ffffff" stroke="#91caf7" />
                                <XAxis hide tick={false} />
                                <YAxis hide tick={false} domain={[0, 100]} />
                                <Area type="monotone"
                                    dataKey="value"
                                    stroke="#91caf7"
                                    fill="#f1f6fa"
                                    isAnimationActive={false}
                                    dot={false}
                                />
                            </AreaChart>
                        }
                        title="CPU"
                        subtitle={cpuUsageHistory.map(entry => entry.value)[cpuUsageHistory.length - 1]?.toFixed(0) + '% ' + cpuFreq.toLocaleString(undefined, {
                            maximumFractionDigits: 2
                        }) + ' GHz'}
                    />
                </Link>

                <Link to={`${match.url}/ram`} style={{ textDecoration: 'none' }}>
                    <SideNavigationItem
                        visual={
                            <AreaChart compact margin={{ top: 2, left: 2, right: 2, bottom: 2 }} width={90} height={48} data={ramGraphData}>
                                <CartesianGrid fill="#ffffff" stroke="#9220b3" />
                                <XAxis hide tick={false} />
                                <YAxis hide tick={false} domain={[0, ramTotalCapacity]} />
                                <Area type="monotone"
                                    dataKey="value.ramNonCacheOrBuffer"
                                    stroke="#9220b3"
                                    fill="#f4f2f4"
                                    isAnimationActive={false}
                                    dot={false}
                                />
                            </AreaChart>
                        }
                        title="RAM"
                        subtitle={`${toHumanReadableNumber(ramNonCacheOrBuffer * 1024, 'B', 1024, num => num.toPrecision(2))}/${(toHumanReadableNumber(ramTotalCapacity * 1024, 'B', 1024, num => num.toPrecision(2)))} (${(100 * ramNonCacheOrBuffer / ramTotalCapacity).toFixed(0)}%)`}
                    />
                </Link>

                {
                    Object.entries(blockDevices).map(([name, metrics]) => (
                        <Link to={`${match.url}/blk/${name}`} key={name} style={{ textDecoration: 'none' }}>
                            <SideNavigationItem
                                visual={
                                    <AreaChart compact margin={{ top: 2, left: 2, right: 2, bottom: 2 }} width={90} height={48} data={diskTransferData[name]}>
                                        <CartesianGrid fill="#ffffff" stroke="#62b029" />
                                        <XAxis hide tick={false} />
                                        <YAxis hide tick={false} domain={[0, 1000]} />
                                        <Area type="monotone"
                                            dataKey="activeTime"
                                            fill="#eff7e9"
                                            stroke="#62b029"
                                            isAnimationActive={false}
                                            dot={false}
                                        />
                                    </AreaChart>
                                }
                                title={name}
                                subtitle={diskTransferData[name] ? (diskTransferData[name][diskTransferData[name].length - 1].activeTime / 10.0).toFixed(0) + '%' : ''}
                            />
                        </Link>
                    ))
                }

                {
                    Object.entries(interfaces).map(([name, metrics]) => (
                        <Link to={`${match.url}/iface/${name}`} key={name} style={{ textDecoration: 'none' }}>
                            <SideNavigationItem
                                visual={
                                    <AreaChart compact margin={{ top: 2, left: 2, right: 2, bottom: 2 }} width={90} height={48} data={interfaceGraphData[name]}>
                                        <CartesianGrid fill="#ffffff" stroke="#6b6041" />
                                        <XAxis hide tick={false} />
                                        <YAxis hide tick={false} />
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
                                            isAnimationActive={false}
                                            dot={false}
                                        />
                                    </AreaChart>
                                }
                                title={name}
                                subtitle={
                                    `D: ${
                                        toHumanReadableNumber(
                                            interfaceGraphData[name][interfaceGraphData[name].length - 1].bitsRead.toString(),
                                            'bit/s',
                                            1000,
                                            num => Math.round(num)
                                        )
                                    } U: ${
                                        toHumanReadableNumber(
                                            interfaceGraphData[name][interfaceGraphData[name].length - 1].bitsWritten.toString(),
                                            'bit/s',
                                            1000,
                                            num => Math.round(num)
                                        )
                                    }`
                                }
                            />
                        </Link>
                    ))
                }
            </section>
            <section>
                <Switch>
                    <Route path={`${match.path}/cpu`}>
                        <CpuInfo
                            name={cpuName}
                            freq={cpuFreq}
                            uptime={uptime}
                            usageHistory={cpuUsageHistory}
                            processCount={processCount}
                            threadCount={threadCount}
                            handleCount={handleCount}
                        />
                    </Route>

                    <Route path={`${match.path}/ram`}>
                        <MemoryInfo
                            totalCapacity={ramTotalCapacity}
                            nonCacheOrBuffer={ramNonCacheOrBuffer}
                            buffers={ramBuffers}
                            cached={ramCached}
                            history={ramHistory}
                            swapCapacity={swapCapacity}
                            swapUsed={swapUsed}
                        />
                    </Route>

                    <Route path={`${match.path}/blk/:name`} render={
                        ({ match, history }) => {
                            if (blockDevices[match.params.name!] === undefined) {
                                history.push('/performance/cpu');

                                return <></>;
                            }

                            return (
                                <DiskInfo
                                    name={match.params.name!}
                                    removable={blockDevices[match.params.name!].removable}
                                    capacity={blockDevices[match.params.name!].capacity}
                                    partitions={blockDevices[match.params.name!].partitions}
                                    history={diskTransferData[match.params.name!]}
                                />
                            );
                        }
                    }
                    />

                    <Route path={`${match.path}/iface/:name`} render={
                        ({ match, history }) => {
                            if (interfaces[match.params.name!] === undefined) {
                                history.push('/performance/cpu');

                                return <></>;
                            }

                            return (
                                <InterfaceInfo
                                    name={match.params.name!}
                                    address={interfaces[match.params.name!].address}
                                    mtu={interfaces[match.params.name!].mtu}
                                    state={interfaces[match.params.name!].operstate}
                                    history={interfaceGraphData[match.params.name!] || []}
                                />
                            );
                        }
                    }
                    />
                </Switch>
            </section>
        </>
    );
};
