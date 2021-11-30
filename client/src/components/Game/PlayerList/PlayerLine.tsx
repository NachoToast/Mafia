import React, { useMemo } from 'react';
import { Player } from './PlayerList';
import { Fade, Tooltip } from '@mui/material';

import DisconnectedIcon from '@mui/icons-material/SignalCellularConnectedNoInternet1Bar';
import OwnerIcon from '@mui/icons-material/Create';

const PlayerLine = ({ player }: { player: Player }) => {
    const tooltipText = useMemo(() => {
        switch (true) {
            case player.connected && player.isOwner:
                return `Owner`;
            case !player.connected && !player.isOwner:
                return `Disconnected`;
            case !player.connected && player.isOwner:
                return `Owner (Disconnected)`;
            default:
                return ``;
        }
    }, [player.connected, player.isOwner]);

    return (
        <Fade in>
            <Tooltip title={tooltipText} arrow placement="left">
                <div
                    style={{
                        whiteSpace: 'nowrap',
                        display: 'flex',
                    }}
                >
                    {player.number}.&nbsp;
                    {!player.connected ? (
                        <DisconnectedIcon
                            style={{
                                paddingRight: '3px',
                                paddingBottom: '5px',
                            }}
                        />
                    ) : (
                        player.isOwner && (
                            <OwnerIcon style={{ paddingRight: '3px', paddingBottom: '5px' }} />
                        )
                    )}
                    {player.username}
                    {player.extra && ` (${player.extra})`}
                    {/* {player.connected && DisconnectedExtraText} */}
                </div>
            </Tooltip>
        </Fade>
    );
};

export default PlayerLine;
