import React from 'react';
import { Player } from './PlayerList';
import { Fade, Tooltip } from '@mui/material';

import DisconnectedIcon from '@mui/icons-material/SignalCellularConnectedNoInternet1Bar';

const PlayerLine = ({ player }: { player: Player }) => {
    return (
        <Fade in>
            <Tooltip
                title={!player.connected ? `Disconnected` : ''}
                arrow
                placement="left"
            >
                <div
                    style={{
                        whiteSpace: 'nowrap',
                        display: 'flex',
                    }}
                >
                    {player.number}.&nbsp;
                    {!player.connected && (
                        <DisconnectedIcon
                            style={{
                                paddingRight: '3px',
                                paddingBottom: '5px',
                            }}
                        />
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
