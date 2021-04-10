import React, { useEffect, useState } from 'react';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { CpuInfo } from '../../components/CpuInfo/CpuInfo';
import { DiskInfo } from '../../components/DiskInfo/DiskInfo';
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

    const [blockDeviceHistory, pushBlockDeviceHistory] = useTimeseries<Record<string, number[]>>(60);
    const [blockDevices, setBlockDevices] = useState<Record<string, any>>({});

    useEffect(() => {
        const collectInfo = () => {
            const cpuInfo = window.api.getCPU();
            const seconds = window.api.getUptime();

            setProcessCount(window.api.getProcessCount());
            setThreadCount(window.api.getThreadCount());
            setHandleCount(window.api.getHandleCount().open);

            setUptime(seconds);
            setCpuName(cpuInfo[0]['model name']);
            setCpuFreq((parseFloat(cpuInfo[0]['cpu MHz']) / 1000.0));

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
        };

        collectInfo();

        const handle = window.setInterval(collectInfo, props.updateInterval);

        return () => window.clearInterval(handle);
    }, [props.updateInterval, pushBlockDeviceHistory, pushCpuHistory, pushRamHistory]);

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
                        subtitle={cpuUsageHistory.map(entry => entry.value).reduce((prev, next) => next > prev ? next : prev, 0).toFixed(0) + '% ' + cpuFreq.toLocaleString(undefined, {
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
                        subtitle={`${toHumanReadableNumber(ramNonCacheOrBuffer * 1024, 1024, num => num.toPrecision(2))}/${(toHumanReadableNumber(ramTotalCapacity * 1024, 1024, num => num.toPrecision(2)))} (${(100 * ramNonCacheOrBuffer / ramTotalCapacity).toFixed(0)}%)`}
                    />
                </Link>

                {
                    Object.entries(blockDevices).map(([name, metrics]) => (
                        <Link to={`${match.url}/blk/${name}`} key={name} style={{ textDecoration: 'none' }}>
                            <SideNavigationItem
                                visual={<img alt="" src="http://placehold.it/90x48" />}
                                title={name}
                                subtitle={"lol"}
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
                                    capacity={blockDevices[match.params.name!].capacity}
                                    partitions={blockDevices[match.params.name!].partitions}
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
