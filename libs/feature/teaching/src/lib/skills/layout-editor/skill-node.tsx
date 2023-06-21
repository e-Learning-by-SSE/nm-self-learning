import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default memo(({ data, isConnectable } : {data: any, isConnectable: boolean}) => {

    let label = data.label;
    if (label.length > 10) {
      label = label.substring(0, 7) + '...';
    }

    return (
        <>
          <Handle
            type="target"
            position={Position.Top}
            style={{ background: '#555' }}
            onConnect={(params) => console.log('handle onConnect', params)}
            isConnectable={isConnectable}
          />
          <div className="px-4 py-2 shadow-md rounded-md bg-white border-1 border-black-400 hover:bg-gray-200" style={{ width: '150px', height: '45px' }}>
            <div style={{display: 'flex' , justifyContent: 'center', alignItems: 'center'}}>
                <div className="text-lg font-bold">{label}</div>
            </div>
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            id="a"
            style={{ background: '#555' }}
            isConnectable={isConnectable}
          />
        </>
      );
    });
