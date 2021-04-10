const { contextBridge } = require("electron");
const fs = require('fs');
const child_process = require('child_process');

contextBridge.exposeInMainWorld('api', {
    getUptime: function () {
        return parseFloat(fs.readFileSync('/proc/uptime').toString().split(' ')[0]);
    },
    getCPU: function () {
        const obj = {};

        return fs.readFileSync('/proc/cpuinfo').toString()
            .split('\n\n')
            .filter(block => block !== '')
            .map(line => line.split('\n').map(line => line.split(':').map(part => part.trim())))
            .map(cpu => {
                const obj = {};

                cpu.forEach(([k, v]) => obj[k] = v);

                return obj;
            });

        // return obj;
    },
    getProcessCount: function () {
        return fs.readdirSync('/proc')
            .filter(dir => dir.match(/[0-9]{1,}/)).length;
    },
    getThreadCount: function () {
        return fs.readdirSync('/proc')
            .filter(dir => dir.match(/[0-9]{1,}/))
            .map(pidDir => {
                try {
                    return parseInt(
                        fs.readFileSync(`/proc/${pidDir}/status`)
                            .toString()
                            .split('\n')
                            .filter(line => line.startsWith('Threads:'))
                        [0]
                            .split(':')
                            .map(split => split.trim())
                        [1])
                }
                catch (e) {
                    return 0;
                }
            })
            .reduce((prev, next) => prev + next, 0)
    },
    getHandleCount: function () {
        const fileNr = fs.readFileSync('/proc/sys/fs/file-nr').toString().split(/\s{1,}/);

        return ({
            open: parseInt(fileNr[0]),
            free: parseInt(fileNr[1]),
            max: parseInt(fileNr[2])
        });
    },
    getUsageOfCPU: function () {
        return fs.readFileSync('/proc/stat').toString().split('\n')
            .filter(line => line.startsWith('cpu'))
            .map(line => line.split(/ {1,}/))
            .map(line => {
                return ({
                    user: parseInt(line[1]),
                    nice: parseInt(line[2]),
                    system: parseInt(line[3]),
                    idle: parseInt(line[4]),
                    iowait: parseInt(line[5]),
                    irq: parseInt(line[6]),
                    softirq: parseInt(line[6]),
                    steal: parseInt(line[7]),
                    guest: parseInt(line[8]),
                    guestNice: parseInt(line[9])
                });
            });
    },
    getUsageOfRAM: function () {
        const obj = {};

        fs.readFileSync('/proc/meminfo').toString().split('\n')
            .filter(line => line !== '')
            .map(line => line.split(/: {1,}/))
            .forEach(([k, v]) => obj[k] = parseInt(v));

        return obj;
    },
    getInstalledGPUs: function () {
        // const isNvidia = child_process.spawnSync('which nvidia-smi').status === 0;

        // if (isNvidia) {
        const nvsmiPattern = /(GPU \d):\s(.*)\s\(UUID:\s(.*)\)/;

        return child_process.execSync('nvidia-smi -L').toString().split('\n')
            .filter(line => line !== '')
            .map(line => line.match(nvsmiPattern).slice(1, 4))
        // }

    },
    getBlockDevices: function () {
        const disks = fs.readdirSync('/sys/block/')
            .filter(name => !name.startsWith('loop'))
            // .filter(name => fs.readFileSync(`/sys/block/${name}/removable`).toString() === '0\n')
            .sort();

        const disksWithStat = {};

        disks.forEach(disk => {
            disksWithStat[disk] = {
                stat: fs.readFileSync(`/sys/block/${disk}/stat`).toString()
                    .split(/\s{1,}/)
                    .filter(value => value !== '')
                    .map(value => parseInt(value)),
                capacity: parseInt(fs.readFileSync(`/sys/block/${disk}/size`).toString()) * 512,
                partitions: (() => {
                    const parts = {};

                    fs.readdirSync(`/sys/block/${disk}/`)
                        .filter(name => name.match(/nvme\d{1,}n\d{1,}|sd[a-z]{1,}\d{1,}/))
                        .forEach(part => {
                            parts[part] = {
                                capacity: parseInt(fs.readFileSync(`/sys/block/${disk}/${part}/size`).toString()) * 512
                            };
                        });

                    return parts
                })()
            };
        });

        return disksWithStat;
    },
    listProcesses: function () {
        const pids = fs.readdirSync('/proc')
            .filter(dir => dir.match(/[0-9]{1,}/))
            .map(pid => parseInt(pid));

        const processes = [];

        pids.forEach(pid => {
            const { uid } = fs.statSync(`/proc/${pid}`)
            const cmdline = fs.readFileSync(`/proc/${pid}/cmdline`).toString();

            const [, executable, state] = fs.readFileSync(`/proc/${pid}/stat`).toString().split(/\s+(?=[^\])}]*(?:[(]|$))/);

            processes.push({ pid, cmdline, uid, executable, state });
        });

        return processes;
    }
});