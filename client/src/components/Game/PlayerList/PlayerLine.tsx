import React, { useMemo } from 'react';
import { Fade, Tooltip } from '@mui/material';

import DisconnectedIcon from '@mui/icons-material/SignalCellularConnectedNoInternet1Bar';
import OwnerIcon from '@mui/icons-material/Create';
import Player from '../../../types/Player';

const PlayerLine = ({ player }: { player: Player }) => {
    const { connected, isOwner, number, extra, username } = player;

    const tooltipText = useMemo(() => {
        switch (true) {
            case connected && isOwner:
                return `Owner`;
            case !connected && !isOwner:
                return `Disconnected`;
            case !connected && isOwner:
                return `Owner (Disconnected)`;
            default:
                return ``;
        }
    }, [connected, isOwner]);

    return (
        <Fade in>
            <Tooltip title={tooltipText} arrow placement="left">
                <div
                    style={{
                        whiteSpace: 'nowrap',
                        display: 'flex',
                    }}
                >
                    {number}.&nbsp;
                    {!connected ? (
                        <DisconnectedIcon
                            style={{
                                paddingRight: '3px',
                                paddingBottom: '5px',
                            }}
                        />
                    ) : (
                        isOwner && (
                            <OwnerIcon style={{ paddingRight: '3px', paddingBottom: '5px' }} />
                        )
                    )}
                    {username}
                    {extra && ` (${extra})`}
                    {/* {connected && DisconnectedExtraText} */}
                </div>
            </Tooltip>
        </Fade>
    );
};

export default PlayerLine;
