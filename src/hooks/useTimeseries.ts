import { useCallback, useState } from "react";

type TimeseriesEntry<T> = {
    timestamp: ReturnType<typeof performance.now>,
    value: T
}

export const useTimeseries = <T = any>(capacity = 10) => {
    const [history, setHistory] = useState<TimeseriesEntry<T>[]>([]);

    const pushValue = useCallback(
        function (value: T) {
            setHistory(
                history => ([
                    ...history,
                    { timestamp: performance.now(), value }
                ]).slice(-1 * capacity)
            );
        }
    , [capacity]);

    return [history, pushValue] as [TimeseriesEntry<T>[], (value: T) => void];
}