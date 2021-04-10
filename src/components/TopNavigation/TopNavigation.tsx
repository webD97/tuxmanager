import React from 'react';

export const TopNavigation: React.FC = () => {
    return (
        <nav>
            <button>Processes</button>
            <button className="active">Performance</button>
            <button>Services</button>
        </nav>
    )
};
