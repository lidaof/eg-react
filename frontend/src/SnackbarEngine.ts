import { OptionsObject, useSnackbar, WithSnackbarProps } from 'notistack';
import React, { useEffect } from 'react';


let useSnackbarRef: WithSnackbarProps;
let snackbarQueue: Map<string, OptionsObject> = new Map();
export const SnackbarUtilsConfigurator: React.FC = () => {
  useSnackbarRef = useSnackbar();

  useEffect(() => {
    if (!snackbarQueue.size) return;
    let lengthAscMap = new Map([...snackbarQueue.entries()].sort(([keyA], [keyB]) => keyB.length - keyA.length));
    for (let [msg, options] of lengthAscMap.entries()) {
      useSnackbarRef.enqueueSnackbar(msg, options);
    }
    snackbarQueue.clear();
  }, []);

  return null;
}

export default {
  success(msg: string, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'success' })
  },
  warning(msg: string, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'warning' })
  },
  info(msg: string, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'info' })
  },
  error(msg: string, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'error' })
  },
  toast(msg: string, options: OptionsObject = {}) {
    if (!useSnackbarRef) {
      snackbarQueue.set(msg, options);
      return;
    }
    useSnackbarRef.enqueueSnackbar(msg, options)
  }
}