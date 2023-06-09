import ReactFlow, { Controls, Background, MiniMap, useNodesState,
    useEdgesState, ConnectionLineType, addEdge, Panel, Node, Edge, ReactFlowProvider, Position} from 'reactflow';
import React, { useState, useRef } from 'react';
import { useCallback } from 'react';
import {Skills} from '@self-learning/types';
import dagre from '@dagrejs/dagre';


  
  
  
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 172;
  const nodeHeight = 36;
  
  const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });
  
    nodes.forEach((node: Node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });
  
    edges.forEach((edge: Edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
  
    dagre.layout(dagreGraph);
  
    nodes.forEach((node: Node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? Position.Left : Position.Top;
      node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
  
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
  
      return node;
    });
  
    return { nodes, edges };
  };
  
  
  
  export default function FlowLayoutEditor({
      onFinished,
      skills,
    }: {
      onFinished: (skilltree: Skills) => void,
      skills : Skills[];
    }) {

      
    // this ref stores the current dragged node
    
    // target is the node that the node is dragged over

    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const reactFlowWrapper = useRef(null);

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      convertSkillArrayToNodes(skills),
      convertSkillArrayToEdges(skills)
    );
  
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  
    const onConnect = useCallback(
      (params: any) =>
        setEdges((eds) =>
          addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)
        ),
      [setEdges]
    );
    const onLayout = useCallback(
      (direction: string | undefined) => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          nodes,
          edges,
          direction
        );
  
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
      },
      [nodes, edges, setNodes, setEdges]
    );
  
  
    const onDrop = useCallback(
      (event: { preventDefault: () => void; dataTransfer: { getData: (arg0: string) => any; }; clientX: number; clientY: number; }) => {
        event.preventDefault();

        if(reactFlowInstance === null || reactFlowWrapper.current === null) {
          return;
        }
 
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const id = event.dataTransfer.getData('application/reactflow');

        const type = "default";
  
        // check if the dropped element is valid
        if (typeof type === 'undefined' || !type) {
          return;
        }
  
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        const newNode = {
          id,
          type,
          position,
          data: { label: `${type} node` },
        };
  
        setNodes((nds) => nds.concat(newNode));
      },
      [ reactFlowInstance, setNodes]
    );

    const onDragOver = useCallback((event: { preventDefault: () => void; dataTransfer: { dropEffect: string; }; }) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }, []);
   
      return(
        <ReactFlowProvider>
          <div style={{height: "100%"}} ref={reactFlowWrapper}>
              <ReactFlow
               onNodeDragStop={() => onLayout('TB')}
               nodes={nodes}
               onNodesChange={onNodesChange}
               edges={edges}
               onConnect={(event) => {onConnect(event)}}
               onInit={setReactFlowInstance}
               fitView
               onDrop={onDrop}
               onDragOver={onDragOver}
               onEdgesChange={onEdgesChange}>
                  <Background />
                  <Controls />
                  <MiniMap zoomable  pannable/>
                  <Panel position="top-right">
                    <button onClick={() => onLayout('TB')}>vertical layout</button>
                    <button onClick={() => onLayout('LR')}>horizontal layout</button>
                  </Panel>
              </ReactFlow>
          </div>
        </ReactFlowProvider>
      );
  
  }


  function convertSkillArrayToNodes(skills: Skills[]) {
    const nodes = skills.map((skill) => {
      return {
        id: skill.id,
        data: { label: skill.name },
        position: { x: 0, y: 0 }
      }
    });
    return nodes;
  }

  function convertSkillArrayToEdges(skills: Skills[]) {
    const edges = skills.map((skill) => {
      const targetId = skills.find((s) => skill.nestedSkills.find((e) => s.id === e.id))?.id ?? 'none'
      return {
        id: skill.id + "-" + targetId,
        source: skill.id,
        target: targetId,
        label: skill.name,
        type: 'step',
      }
    });
    const cleanedEdges = edges.filter((edge) => edge.target !== 'none');
    return cleanedEdges;
  }

  function convertNodesAndEdgesToSkillArray(nodes: Node[], edges: Edge[]) : Skills[] {
    const skills = nodes.map((node) => {
      return {
        id: node.id,
        name: node.data.label,
        nestedSkills: edges.filter((edge) => edge.source === node.id).map((edge) => {
          return {
            id: edge.target,
            name: edge.label?.toLocaleString() ?? "",
            nestedSkills: [],
            level: 0,
            description: ""
          }
        }),
        level: 0,
        description: ""
      }
    });
    return skills;
  }
