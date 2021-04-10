import React from 'react';

export interface LabeledStatProps {
    label: string,
    value: string|number,
    prepend?: string,
    append?: string
}

export const LabeledStat: React.FC<LabeledStatProps> = (props) => (
    <div>
        <h6>{props.label}</h6>
        <span>{props.prepend}{props.value}{props.append}</span>
    </div>
);
