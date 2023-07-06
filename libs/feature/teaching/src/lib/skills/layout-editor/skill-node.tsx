import { TrashIcon } from '@heroicons/react/solid';
import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default memo(({ data, isConnectable } : {id:string, data: any, isConnectable: boolean}) => {

    let label = data.label;
    if (label.length > 10) {
      label = label.substring(0, 7) + '...';
    }

    let onDelete = data.markedForDelete;

    const [isHovered, setIsHovered] = useState(false);

    const onMouseEnter = () => {
      setIsHovered(true);
    }

    const onMouseLeave = () => {
      setIsHovered(false);
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
          <div className="px-4 py-2 shadow-md rounded-md bg-white border-1 border-black-400 hover:bg-gray-200" style={{ width: '150px', height: '45px' }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}>
            <div style={{display: 'flex' , justifyContent: 'center', alignItems: 'center'}}>
              {isHovered ? 
                    <TrashIcon className="h-5 w-5 text-red-500 mt-1 hover:text-red-800" onClick={() => {onDelete = true}}/> : 
                  <div className="text-lg font-bold">{label}</div>
                 }
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


    