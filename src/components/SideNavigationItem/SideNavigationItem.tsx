import React from 'react';
import clsx from 'clsx';

import styles from './SideNavigationItem.module.css';

export interface SideNavigationItemProps {
    active?: boolean,
    visual: React.ReactNode,
    title: string,
    subtitle: string,
    onClick?: () => void
}

export const SideNavigationItem: React.FC<SideNavigationItemProps> = (props) => {
    const {
        visual, title, subtitle,
        active = false,
        onClick = () => undefined,
    } = props;

    const rootClassNames = clsx({
        [styles.root]: true,
        [styles.active]: active
    });

    return (
        <div className={rootClassNames} onClick={onClick}>
            <figure className={styles.visual}>
                {visual}
            </figure>
            <div className={styles.text}>
                <h3 className={styles.title}>
                    {title}
                </h3>
                <h4 className={styles.subtitle}>
                    {subtitle}
                </h4>
            </div>
        </div>
    );
};