import React, { memo, useEffect, useState } from "react";


const listeners: Array<(state: State) => void> = [];

let memoryState: State = { isOpen: false, dialog: null };



interface State {
    isOpen: boolean;
    dialog: React.ReactNode; 
}

export const dispatchDialog = (dialog: React.ReactNode) => {
    memoryState = { isOpen: true, dialog: dialog };
    listeners.forEach((listener) => {
      listener(memoryState);
    });
  };
/**
 * Should be used if the same dialog is opend multiple times in one component 
 * Reason React will not rerender the component if the same dialog is used
 */
  export const freeDialog = () => {
    memoryState = { isOpen: false, dialog: null };
    listeners.forEach((listener) => {
      listener(memoryState);
    });
  }

function useDialog(): State {
    const [state, setState] = useState<State>(memoryState);
    useEffect(() => {
      listeners.push(setState);
      return () => {
        const index = listeners.indexOf(setState);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    }, [state]);

    return state;
}

export const DialogHandler = memo(DialogHandlerComponent);

 function DialogHandlerComponent() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isOpen, dialog } = useDialog();
    
    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
            {dialog}
        </>
    );

}